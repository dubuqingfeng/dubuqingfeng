import {
  CalldataError,
  bytesToHex,
  ensureLength,
  formatUnits,
  isAllZero,
  isPrintableText,
  readBigIntBE,
  readUintBE,
  utf8Decode,
  utf8Encode,
} from "../bytes";
import { toChecksumAddress } from "../crypto";

export type AbiType =
  | { kind: "uint"; bits: number }
  | { kind: "int"; bits: number }
  | { kind: "address" }
  | { kind: "bool" }
  | { kind: "fixedbytes"; size: number }
  | { kind: "bytes" }
  | { kind: "string" }
  | { kind: "function" }
  | { kind: "array"; length: number | null; inner: AbiType }
  | { kind: "tuple"; components: AbiParam[] };

export interface AbiParam {
  name: string;
  type: string;
  typeInfo: AbiType;
}

export type DecodedValue =
  | { kind: "uint"; value: bigint }
  | { kind: "int"; value: bigint }
  | { kind: "address"; value: string }
  | { kind: "bool"; value: boolean }
  | { kind: "bytes"; value: Uint8Array }
  | { kind: "string"; value: string }
  | { kind: "function"; value: Uint8Array }
  | { kind: "array"; items: DecodedValue[] }
  | { kind: "tuple"; fields: DecodedParam[] };

export interface DecodedParam {
  name: string;
  type: string;
  value: DecodedValue;
}

const MAX_ARRAY_LENGTH = 4096;
const MAX_DEPTH = 12;

function splitArraySuffix(type: string): { base: string; dims: (number | null)[] } {
  const dims: (number | null)[] = [];
  let current = type;
  for (;;) {
    const match = current.match(/^(.*)\[(\d*)\]$/);
    if (!match) {
      break;
    }
    dims.unshift(match[2] === "" ? null : Number.parseInt(match[2], 10));
    current = match[1];
  }
  return { base: current, dims };
}

export function splitTopLevel(input: string, separator = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth -= 1;
    } else if (char === separator && depth === 0) {
      parts.push(input.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(input.slice(start));
  return parts.filter((part) => part.trim() !== "");
}

function indexOfTopLevel(input: string, target: string): number {
  let depth = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === "(" || char === "[") {
      depth += 1;
    } else if (char === ")" || char === "]") {
      depth -= 1;
    } else if (char === target && depth === 0) {
      return i;
    }
  }
  return -1;
}

function parseBaseType(raw: string): AbiType {
  const type = raw.trim();
  if (!type) {
    throw new CalldataError("空的参数类型");
  }
  if (type === "address") {
    return { kind: "address" };
  }
  if (type === "bool") {
    return { kind: "bool" };
  }
  if (type === "string") {
    return { kind: "string" };
  }
  if (type === "bytes") {
    return { kind: "bytes" };
  }
  if (type === "function") {
    return { kind: "function" };
  }
  const bytesMatch = type.match(/^bytes(\d+)$/);
  if (bytesMatch) {
    const size = Number.parseInt(bytesMatch[1], 10);
    if (size < 1 || size > 32) {
      throw new CalldataError(`bytesN 的 N 必须在 1-32 之间：${type}`);
    }
    return { kind: "fixedbytes", size };
  }
  const intMatch = type.match(/^(u?)int(\d*)$/);
  if (intMatch) {
    const bits = intMatch[2] === "" ? 256 : Number.parseInt(intMatch[2], 10);
    if (bits < 8 || bits > 256 || bits % 8 !== 0) {
      throw new CalldataError(`整数位宽必须是 8 的倍数且不超过 256：${type}`);
    }
    return intMatch[1] === "u" ? { kind: "uint", bits } : { kind: "int", bits };
  }
  if (type.startsWith("(") && type.endsWith(")")) {
    return { kind: "tuple", components: parseParamList(type.slice(1, -1)) };
  }
  if (type === "tuple") {
    throw new CalldataError("tuple 类型需要提供 components（请使用 ABI JSON 输入）");
  }
  throw new CalldataError(`无法识别的 ABI 类型：${type}`);
}

export function parseType(rawType: string): AbiType {
  const type = rawType.trim().replace(/\s+/g, "");
  if (!type) {
    throw new CalldataError("空的参数类型");
  }
  const { base, dims } = splitArraySuffix(type);
  let parsed = parseBaseType(base);
  for (const dim of dims) {
    parsed = { kind: "array", length: dim, inner: parsed };
  }
  return parsed;
}

/**
 * 解析“名字:类型”列表，例如 `to:address, amount:uint256, path:address[]`。
 * 同样用于 tuple 内部字段的解析（名字可省略）。
 */
export function parseParamList(compact: string): AbiParam[] {
  if (!compact.trim()) {
    return [];
  }
  return splitTopLevel(compact).map((part, index) => {
    const colon = indexOfTopLevel(part, ":");
    let name = `arg${index}`;
    let type = part.trim();
    if (colon >= 0) {
      const maybeName = part.slice(0, colon).trim();
      name = maybeName || name;
      type = part.slice(colon + 1).trim();
    }
    const typeInfo = parseType(type);
    return { name, type: typeToString(typeInfo), typeInfo };
  });
}

export const parseParams = parseParamList;

/** 把 Solidity 签名行解析成参数列表，例如 `transfer(address to, uint256 amount)`。 */
export function parseSignatureLine(line: string): { name: string; params: AbiParam[] } {
  const text = line.trim().replace(/^function\s+/i, "").replace(/;$/, "");
  const open = text.indexOf("(");
  if (open < 0) {
    throw new CalldataError(`无法解析函数签名：${line}`);
  }
  const name = text.slice(0, open).trim();
  const close = text.lastIndexOf(")");
  const inner = text.slice(open + 1, close < 0 ? text.length : close);
  const params = splitTopLevel(inner).map((part, index) => {
    const cleaned = part
      .replace(/\b(memory|calldata|storage|indexed|payable)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const tokens = cleaned.split(" ");
    let type = cleaned;
    let paramName = `arg${index}`;
    if (tokens.length > 1) {
      type = tokens[tokens.length - 1];
      paramName = tokens.slice(0, tokens.length - 1).join(" ") || paramName;
    }
    const typeInfo = parseType(type);
    return { name: paramName, type: typeToString(typeInfo), typeInfo };
  });
  if (!name) {
    throw new CalldataError(`无法解析函数名：${line}`);
  }
  return { name, params };
}

export function typeToString(type: AbiType): string {
  switch (type.kind) {
    case "uint":
      return `uint${type.bits}`;
    case "int":
      return `int${type.bits}`;
    case "address":
      return "address";
    case "bool":
      return "bool";
    case "fixedbytes":
      return `bytes${type.size}`;
    case "bytes":
      return "bytes";
    case "string":
      return "string";
    case "function":
      return "function";
    case "array":
      return `${typeToString(type.inner)}[${type.length === null ? "" : type.length}]`;
    case "tuple":
      return `(${type.components.map((component) => typeToString(component.typeInfo)).join(",")})`;
    default:
      throw new CalldataError("未知的 ABI 类型");
  }
}

/** 静态类型占用 head 的字节数；动态类型返回 null。 */
export function staticSizeOf(type: AbiType): number | null {
  switch (type.kind) {
    case "uint":
    case "int":
    case "address":
    case "bool":
    case "fixedbytes":
    case "function":
      return 32;
    case "bytes":
    case "string":
      return null;
    case "array": {
      if (type.length === null) {
        return null;
      }
      const inner = staticSizeOf(type.inner);
      return inner === null ? null : inner * type.length;
    }
    case "tuple": {
      let total = 0;
      for (const component of type.components) {
        const size = staticSizeOf(component.typeInfo);
        if (size === null) {
          return null;
        }
        total += size;
      }
      return total;
    }
    default:
      return null;
  }
}

export function isDynamicType(type: AbiType): boolean {
  return staticSizeOf(type) === null;
}

function toSigned(raw: bigint, bits: number): bigint {
  const limit = 1n << BigInt(bits - 1);
  return raw >= limit ? raw - (1n << BigInt(bits)) : raw;
}

function decodeStatic(
  type: AbiType,
  data: Uint8Array,
  offset: number,
  depth: number
): DecodedValue {
  if (depth > MAX_DEPTH) {
    throw new CalldataError("嵌套层级过深，可能存在异常数据");
  }
  switch (type.kind) {
    case "uint":
      return { kind: "uint", value: readBigIntBE(data, offset, 32) };
    case "int":
      return { kind: "int", value: toSigned(readBigIntBE(data, offset, 32), type.bits) };
    case "address": {
      ensureLength(data, offset, 32, "address 参数");
      const raw = data.slice(offset + 12, offset + 32);
      return { kind: "address", value: toChecksumAddress(bytesToHex(raw)) };
    }
    case "bool": {
      const raw = readBigIntBE(data, offset, 32);
      return { kind: "bool", value: raw !== 0n };
    }
    case "fixedbytes":
      return { kind: "bytes", value: data.slice(offset, offset + type.size) };
    case "function":
      return { kind: "function", value: data.slice(offset, offset + 24) };
    case "array": {
      const items: DecodedValue[] = [];
      const innerSize = staticSizeOf(type.inner);
      if (innerSize === null || type.length === null) {
        throw new CalldataError("动态数组不应走静态解码分支");
      }
      for (let i = 0; i < type.length; i += 1) {
        items.push(decodeStatic(type.inner, data, offset + i * innerSize, depth + 1));
      }
      return { kind: "array", items };
    }
    case "tuple": {
      const fields = decodeSequence(type.components, data, offset, depth + 1);
      return { kind: "tuple", fields };
    }
    default:
      throw new CalldataError("动态类型不应走静态解码分支");
  }
}

function decodeDynamic(
  type: AbiType,
  data: Uint8Array,
  offset: number,
  depth: number
): DecodedValue {
  if (depth > MAX_DEPTH) {
    throw new CalldataError("嵌套层级过深，可能存在异常数据");
  }
  switch (type.kind) {
    case "bytes": {
      const length = readBigIntBE(data, offset, 32);
      if (length > BigInt(data.length)) {
        throw new CalldataError("bytes 长度越界");
      }
      const size = Number(length);
      ensureLength(data, offset + 32, size, "bytes 内容");
      return { kind: "bytes", value: data.slice(offset + 32, offset + 32 + size) };
    }
    case "string": {
      const length = readBigIntBE(data, offset, 32);
      if (length > BigInt(data.length)) {
        throw new CalldataError("string 长度越界");
      }
      const size = Number(length);
      ensureLength(data, offset + 32, size, "string 内容");
      return { kind: "string", value: utf8Decode(data.slice(offset + 32, offset + 32 + size)) };
    }
    case "array": {
      if (type.length === null) {
        const declared = readBigIntBE(data, offset, 32);
        if (declared > BigInt(MAX_ARRAY_LENGTH)) {
          throw new CalldataError(`数组长度异常：${declared.toString()}`);
        }
        const length = Number(declared);
        return {
          kind: "array",
          items: decodeElements(type.inner, data, offset + 32, length, depth + 1),
        };
      }
      return {
        kind: "array",
        items: decodeElements(type.inner, data, offset, type.length, depth + 1),
      };
    }
    case "tuple": {
      const fields = decodeSequence(type.components, data, offset, depth + 1);
      return { kind: "tuple", fields };
    }
    default:
      return decodeStatic(type, data, offset, depth);
  }
}

function decodeElements(
  inner: AbiType,
  data: Uint8Array,
  base: number,
  length: number,
  depth: number
): DecodedValue[] {
  const items: DecodedValue[] = [];
  const innerSize = staticSizeOf(inner);
  if (innerSize === null) {
    for (let i = 0; i < length; i += 1) {
      const elementOffset = readBigIntBE(data, base + i * 32, 32);
      if (elementOffset > BigInt(data.length)) {
        throw new CalldataError("数组元素偏移量越界");
      }
      items.push(decodeDynamic(inner, data, base + Number(elementOffset), depth));
    }
    return items;
  }
  for (let i = 0; i < length; i += 1) {
    items.push(decodeStatic(inner, data, base + i * innerSize, depth));
  }
  return items;
}

function decodeSequence(
  params: AbiParam[],
  data: Uint8Array,
  base: number,
  depth: number
): DecodedParam[] {
  if (depth > MAX_DEPTH) {
    throw new CalldataError("嵌套层级过深，可能存在异常数据");
  }
  const out: DecodedParam[] = [];
  let head = 0;
  for (const param of params) {
    const size = staticSizeOf(param.typeInfo);
    if (size === null) {
      const relative = readBigIntBE(data, base + head, 32);
      if (relative > BigInt(data.length)) {
        throw new CalldataError(`参数 ${param.name} 的偏移量越界`);
      }
      out.push({
        name: param.name,
        type: param.type,
        value: decodeDynamic(param.typeInfo, data, base + Number(relative), depth + 1),
      });
      head += 32;
    } else {
      out.push({
        name: param.name,
        type: param.type,
        value: decodeStatic(param.typeInfo, data, base + head, depth + 1),
      });
      head += size;
    }
  }
  return out;
}

export function decodeParams(params: AbiParam[], data: Uint8Array): DecodedParam[] {
  ensureLength(data, 0, 0, "参数数据");
  return decodeSequence(params, data, 0, 0);
}

export function valueToJson(value: DecodedValue): unknown {
  switch (value.kind) {
    case "uint":
    case "int":
      return value.value.toString();
    case "address":
    case "string":
      return value.value;
    case "bool":
      return value.value;
    case "bytes":
    case "function":
      return bytesToHex(value.value);
    case "array":
      return value.items.map(valueToJson);
    case "tuple": {
      const obj: Record<string, unknown> = {};
      value.fields.forEach((field, index) => {
        obj[field.name || `arg${index}`] = valueToJson(field.value);
      });
      return obj;
    }
    default:
      return null;
  }
}

export function paramsToJson(params: DecodedParam[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  params.forEach((param, index) => {
    obj[param.name || `arg${index}`] = valueToJson(param.value);
  });
  return obj;
}

export function valueToString(value: DecodedValue, decimals = 18, maxFraction = 8): string {
  switch (value.kind) {
    case "uint":
      return value.value.toString();
    case "int":
      return value.value.toString();
    case "address":
      return value.value;
    case "bool":
      return value.value ? "true" : "false";
    case "bytes": {
      const hex = bytesToHex(value.value);
      if (value.value.length > 0 && isPrintableText(value.value)) {
        return `${hex} ("${utf8Decode(value.value)}")`;
      }
      return hex;
    }
    case "function":
      return bytesToHex(value.value);
    case "string":
      return value.value;
    case "array":
      return `[${value.items.map((item) => valueToString(item, decimals, maxFraction)).join(", ")}]`;
    case "tuple":
      return `{${value.fields
        .map((field) => `${field.name}: ${valueToString(field.value, decimals, maxFraction)}`)
        .join(", ")}}`;
    default:
      return "";
  }
}

/** 把 uint 值渲染成带精度换算的人民币/代币数量展示。 */
export function formatUint(value: DecodedValue, decimals: number): string {
  if (value.kind !== "uint" && value.kind !== "int") {
    return valueToString(value);
  }
  const raw = value.value;
  const formatted = formatUnits(raw, decimals);
  return `${formatted}（raw ${raw.toString()}）`;
}

export function findParam(params: DecodedParam[], name: string): DecodedParam | undefined {
  return params.find((param) => param.name === name);
}

export function findUint(params: DecodedParam[], name: string): bigint | undefined {
  const param = findParam(params, name);
  if (!param) {
    return undefined;
  }
  if (param.value.kind === "uint" || param.value.kind === "int") {
    return param.value.value;
  }
  return undefined;
}

export function findAddress(params: DecodedParam[], name: string): string | undefined {
  const param = findParam(params, name);
  return param && param.value.kind === "address" ? param.value.value : undefined;
}

export function findBool(params: DecodedParam[], name: string): boolean | undefined {
  const param = findParam(params, name);
  return param && param.value.kind === "bool" ? param.value.value : undefined;
}

export function findString(params: DecodedParam[], name: string): string | undefined {
  const param = findParam(params, name);
  return param && param.value.kind === "string" ? param.value.value : undefined;
}

export function findBytes(params: DecodedParam[], name: string): Uint8Array | undefined {
  const param = findParam(params, name);
  return param && (param.value.kind === "bytes" || param.value.kind === "function")
    ? param.value.value
    : undefined;
}

export function findArray(params: DecodedParam[], name: string): DecodedValue[] | undefined {
  const param = findParam(params, name);
  return param && param.value.kind === "array" ? param.value.items : undefined;
}

export function findTuple(params: DecodedParam[], name: string): DecodedParam[] | undefined {
  const param = findParam(params, name);
  return param && param.value.kind === "tuple" ? param.value.fields : undefined;
}

export function findAddressArray(params: DecodedParam[], name: string): string[] {
  const items = findArray(params, name) ?? [];
  return items
    .filter((item) => item.kind === "address")
    .map((item) => (item.kind === "address" ? item.value : ""));
}

export function isEmptyAddress(address: string): boolean {
  return /^0x0{40}$/i.test(address);
}

function pad32(size: number): number {
  return Math.ceil(size / 32) * 32;
}

/**
 * 计算动态类型在缓冲区中的结束位置（相对数据起点），用于判断 calldata 是否有多余尾部数据。
 */
function measureDynamic(
  type: AbiType,
  data: Uint8Array,
  offset: number,
  depth = 0
): number {
  if (depth > MAX_DEPTH) {
    return data.length;
  }
  switch (type.kind) {
    case "bytes":
    case "string": {
      const length = Number(readBigIntBE(data, offset, 32));
      return offset + 32 + pad32(length);
    }
    case "array": {
      const innerSize = staticSizeOf(type.inner);
      if (type.length === null) {
        const length = Number(readBigIntBE(data, offset, 32));
        const base = offset + 32;
        if (innerSize !== null) {
          return base + length * innerSize;
        }
        let end = base + length * 32;
        for (let i = 0; i < length; i += 1) {
          const relative = Number(readBigIntBE(data, base + i * 32, 32));
          end = Math.max(end, measureDynamic(type.inner, data, base + relative, depth + 1));
        }
        return end;
      }
      if (innerSize !== null) {
        return offset + type.length * innerSize;
      }
      let end = offset + type.length * 32;
      for (let i = 0; i < type.length; i += 1) {
        const relative = Number(readBigIntBE(data, offset + i * 32, 32));
        end = Math.max(end, measureDynamic(type.inner, data, offset + relative, depth + 1));
      }
      return end;
    }
    case "tuple":
      return offset + measureParams(type.components, data, offset);
    default:
      return offset + 32;
  }
}

/** 返回参数序列占用的总字节数（含 head 与动态区）。 */
export function measureParams(params: AbiParam[], data: Uint8Array, base = 0): number {
  let head = 0;
  let end = base;
  for (const param of params) {
    const size = staticSizeOf(param.typeInfo);
    if (size === null) {
      const relative = Number(readBigIntBE(data, base + head, 32));
      end = Math.max(end, measureDynamic(param.typeInfo, data, base + relative));
      head += 32;
    } else {
      head += size;
      end = Math.max(end, base + head);
    }
  }
  return Math.max(end, base + head) - base;
}

export { splitArraySuffix };

export interface AbiJsonParam {
  name?: string;
  type: string;
  components?: AbiJsonParam[];
}

/** 把 ABI JSON 的 inputs 数组转换成内部参数结构（支持 tuple 嵌套）。 */
export function abiJsonParams(inputs: AbiJsonParam[] | undefined): AbiParam[] {
  return (inputs ?? []).map((input, index) => {
    const rawType = (input.type || "tuple").trim();
    const { base, dims } = splitArraySuffix(rawType);
    let typeInfo: AbiType;
    if (base === "tuple") {
      typeInfo = { kind: "tuple", components: abiJsonParams(input.components) };
    } else {
      typeInfo = parseType(base);
    }
    for (const dim of dims) {
      typeInfo = { kind: "array", length: dim, inner: typeInfo };
    }
    return {
      name: input.name || `arg${index}`,
      type: typeToString(typeInfo),
      typeInfo,
    };
  });
}

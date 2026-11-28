import {
  CalldataError,
  bytesToBase58,
  bytesToHex,
  ensureLength,
  readUint16LE,
  readUint32LE,
  readUint64LE,
  readUintLE,
  utf8Decode,
} from "../bytes";

export type IdlType =
  | string
  | { vec: IdlType }
  | { option: IdlType }
  | { coption: IdlType }
  | { array: [IdlType, number] }
  | { defined: string | { name: string } };

export interface IdlField {
  name: string;
  type: IdlType;
}

export interface IdlTypeDef {
  name: string;
  type:
    | { kind: "struct"; fields: IdlField[] }
    | { kind: "enum"; variants: { name: string; fields?: IdlField[] }[] };
}

export interface IdlAccountMeta {
  name: string;
  isMut?: boolean;
  isSigner?: boolean;
  writable?: boolean;
  signer?: boolean;
  accounts?: IdlAccountMeta[];
}

export interface IdlInstruction {
  name: string;
  discriminator?: number[];
  accounts?: IdlAccountMeta[];
  args: IdlField[];
}

export interface Idl {
  address?: string;
  metadata?: { address?: string };
  name?: string;
  instructions: IdlInstruction[];
  types?: IdlTypeDef[];
}

export class BorshReader {
  offset = 0;

  constructor(readonly bytes: Uint8Array) {}

  get remaining(): number {
    return this.bytes.length - this.offset;
  }

  private advance(size: number): number {
    ensureLength(this.bytes, this.offset, size, "Borsh 数据");
    const at = this.offset;
    this.offset += size;
    return at;
  }

  take(size: number): Uint8Array {
    const at = this.advance(size);
    return this.bytes.slice(at, at + size);
  }

  u8(): number {
    return this.bytes[this.advance(1)];
  }

  u16(): number {
    return readUint16LE(this.bytes, this.advance(2));
  }

  u32(): number {
    return readUint32LE(this.bytes, this.advance(4));
  }

  u64(): bigint {
    return readUint64LE(this.bytes, this.advance(8));
  }

  u128(): bigint {
    return readUintLE(this.bytes, this.advance(16), 16);
  }

  signed(size: number): bigint {
    const raw = readUintLE(this.bytes, this.advance(size), size);
    const limit = 1n << BigInt(size * 8 - 1);
    return raw >= limit ? raw - (1n << BigInt(size * 8)) : raw;
  }

  f32(): number {
    const at = this.advance(4);
    return new DataView(this.bytes.buffer, this.bytes.byteOffset + at, 4).getFloat32(0, true);
  }

  f64(): number {
    const at = this.advance(8);
    return new DataView(this.bytes.buffer, this.bytes.byteOffset + at, 8).getFloat64(0, true);
  }

  bool(): boolean {
    return this.u8() !== 0;
  }

  string(): string {
    const length = this.u32();
    if (length > this.remaining) {
      throw new CalldataError("Borsh 字符串长度越界");
    }
    return utf8Decode(this.take(length));
  }

  publicKey(): string {
    return bytesToBase58(this.take(32));
  }

  vecBytes(): Uint8Array {
    const length = this.u32();
    if (length > this.remaining) {
      throw new CalldataError("Borsh 字节数组长度越界");
    }
    return this.take(length);
  }
}

interface DecodeEnv {
  types: Map<string, IdlTypeDef>;
  depth: number;
}

const MAX_IDL_DEPTH = 16;

export function buildIdlEnv(idl: Idl): DecodeEnv {
  const types = new Map<string, IdlTypeDef>();
  for (const def of idl.types ?? []) {
    if (def && def.name) {
      types.set(def.name, def);
    }
  }
  return { types, depth: 0 };
}

function definedName(type: string | { name: string }): string {
  return typeof type === "string" ? type : type.name;
}

export function decodeBorshValue(
  reader: BorshReader,
  type: IdlType,
  env: DecodeEnv
): unknown {
  if (env.depth > MAX_IDL_DEPTH) {
    throw new CalldataError("IDL 类型嵌套过深");
  }
  env.depth += 1;
  try {
    if (typeof type === "string") {
      return decodePrimitive(reader, type);
    }
    if ("vec" in type) {
      const length = reader.u32();
      if (length > 1024) {
        throw new CalldataError(`数组长度异常：${length}`);
      }
      const items: unknown[] = [];
      for (let i = 0; i < length; i += 1) {
        items.push(decodeBorshValue(reader, type.vec, env));
      }
      return items;
    }
    if ("option" in type || "coption" in type) {
      const inner = "option" in type ? type.option : (type as { coption: IdlType }).coption;
      const tag = reader.u8();
      return tag === 1 ? decodeBorshValue(reader, inner, env) : null;
    }
    if ("array" in type) {
      const [inner, length] = type.array;
      const items: unknown[] = [];
      for (let i = 0; i < length; i += 1) {
        items.push(decodeBorshValue(reader, inner, env));
      }
      return items;
    }
    if ("defined" in type) {
      const name = definedName(type.defined);
      const def = env.types.get(name);
      if (!def) {
        throw new CalldataError(`IDL 中找不到类型定义：${name}`);
      }
      if (def.type.kind === "struct") {
        const out: Record<string, unknown> = {};
        for (const field of def.type.fields) {
          out[field.name] = decodeBorshValue(reader, field.type, env);
        }
        return out;
      }
      const variantIndex = reader.u8();
      const variant = def.type.variants[variantIndex];
      if (!variant) {
        throw new CalldataError(`枚举 ${name} 没有第 ${variantIndex} 个变体`);
      }
      if (!variant.fields || variant.fields.length === 0) {
        return { variant: variant.name };
      }
      const out: Record<string, unknown> = { variant: variant.name };
      for (const field of variant.fields) {
        out[field.name] = decodeBorshValue(reader, field.type, env);
      }
      return out;
    }
    throw new CalldataError(`不支持的 IDL 类型：${JSON.stringify(type)}`);
  } finally {
    env.depth -= 1;
  }
}

function decodePrimitive(reader: BorshReader, type: string): unknown {
  switch (type) {
    case "bool":
      return reader.bool();
    case "u8":
      return reader.u8().toString();
    case "u16":
      return reader.u16().toString();
    case "u32":
      return reader.u32().toString();
    case "u64":
      return reader.u64().toString();
    case "u128":
      return reader.u128().toString();
    case "i8":
      return reader.signed(1).toString();
    case "i16":
      return reader.signed(2).toString();
    case "i32":
      return reader.signed(4).toString();
    case "i64":
      return reader.signed(8).toString();
    case "i128":
      return reader.signed(16).toString();
    case "f32":
      return reader.f32().toString();
    case "f64":
      return reader.f64().toString();
    case "string":
      return reader.string();
    case "publicKey":
      return reader.publicKey();
    case "bytes":
      return bytesToHex(reader.vecBytes());
    default: {
      const fixed = type.match(/^\[u8;\s*(\d+)\]$/);
      if (fixed) {
        return bytesToHex(reader.take(Number.parseInt(fixed[1], 10)));
      }
      const hex = type.match(/^bytes(\d+)$/);
      if (hex) {
        return bytesToHex(reader.take(Number.parseInt(hex[1], 10)));
      }
      if (type === "u256" || type === "i256") {
        const size = 32;
        const raw = readUintLE(reader.take(size), 0, size);
        return raw.toString();
      }
      throw new CalldataError(`不支持的 IDL 基础类型：${type}`);
    }
  }
}

/** 把 Borsh 解码结果渲染成单行字符串。 */
export function stringifyBorshValue(value: unknown, maxLength = 220): string {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    const text = value.map((item) => stringifyBorshValue(item, maxLength)).join(", ");
    return `[${text}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => `${key}: ${stringifyBorshValue(item, maxLength)}`
    );
    return `{${entries.join(", ")}}`;
  }
  const text = String(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

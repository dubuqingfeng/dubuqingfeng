import Base58 from "base-58";

/**
 * 解码失败时抛出的统一错误类型，页面层只需要展示 message。
 */
export class CalldataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalldataError";
  }
}

const HEX_RE = /^[0-9a-fA-F]*$/;
const B64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function cleanHex(value: string): string {
  return value
    .trim()
    .replace(/^0x/i, "")
    .replace(/[\s\r\n]/g, "");
}

export function isHexString(value: string): boolean {
  const hex = cleanHex(value);
  return hex.length > 0 && hex.length % 2 === 0 && HEX_RE.test(hex);
}

export function hexToBytes(value: string): Uint8Array {
  const hex = cleanHex(value);
  if (!hex) {
    throw new CalldataError("十六进制内容为空");
  }
  if (!HEX_RE.test(hex)) {
    throw new CalldataError("包含非十六进制字符");
  }
  if (hex.length % 2 !== 0) {
    throw new CalldataError("十六进制字符串长度必须为偶数");
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array, prefix = true): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return prefix ? `0x${hex}` : hex;
}

export function bytesToBase58(bytes: Uint8Array): string {
  return Base58.encode(bytes);
}

export function base58ToBytes(value: string): Uint8Array {
  const input = value.trim();
  if (!input) {
    throw new CalldataError("Base58 内容为空");
  }
  let decoded: Uint8Array;
  try {
    decoded = Uint8Array.from(Base58.decode(input));
  } catch (err) {
    throw new CalldataError(`Base58 解码失败：${(err as Error).message}`);
  }
  // base-58 对部分非法字符比较宽容，用回写比对来严格校验。
  if (bytesToBase58(decoded) !== input) {
    throw new CalldataError("不是合法的 Base58 字符串");
  }
  return decoded;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += hasB1 ? B64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    out += hasB2 ? B64_ALPHABET[b2 & 0x3f] : "=";
  }
  return out;
}

export function base64ToBytes(value: string): Uint8Array {
  const input = value.trim().replace(/[\s\r\n]/g, "");
  if (!input) {
    throw new CalldataError("Base64 内容为空");
  }
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(input)) {
    throw new CalldataError("不是合法的 Base64 字符串");
  }
  const normalized = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/=+$/, "");
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of normalized) {
    const index = B64_ALPHABET.indexOf(char);
    if (index < 0) {
      throw new CalldataError(`非法的 Base64 字符：${char}`);
    }
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

export function utf8Encode(value: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value);
  }
  return Uint8Array.from(Buffer.from(value, "utf8"));
}

export function utf8Decode(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return new TextDecoder("utf-8").decode(bytes);
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

export function isPrintableText(bytes: Uint8Array): boolean {
  if (bytes.length === 0) {
    return false;
  }
  let printable = 0;
  for (const byte of bytes) {
    if (byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e)) {
      printable += 1;
    }
  }
  return printable / bytes.length > 0.85;
}

export function ensureLength(
  bytes: Uint8Array,
  offset: number,
  size: number,
  label = "数据"
): void {
  if (offset < 0 || size < 0 || offset + size > bytes.length) {
    throw new CalldataError(
      `${label}长度不足：需要 ${offset + size} 字节，实际只有 ${bytes.length} 字节`
    );
  }
}

export function sliceBytes(
  bytes: Uint8Array,
  start: number,
  end?: number
): Uint8Array {
  return bytes.slice(start, end === undefined ? bytes.length : end);
}

export function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export function readUintBE(
  bytes: Uint8Array,
  offset: number,
  size: number,
  label?: string
): bigint {
  ensureLength(bytes, offset, size, label);
  let value = 0n;
  for (let i = 0; i < size; i += 1) {
    value = (value << 8n) | BigInt(bytes[offset + i]);
  }
  return value;
}

export function readUintLE(
  bytes: Uint8Array,
  offset: number,
  size: number,
  label?: string
): bigint {
  ensureLength(bytes, offset, size, label);
  let value = 0n;
  for (let i = size - 1; i >= 0; i -= 1) {
    value = (value << 8n) | BigInt(bytes[offset + i]);
  }
  return value;
}

export function readUint8(bytes: Uint8Array, offset: number, label?: string): number {
  ensureLength(bytes, offset, 1, label);
  return bytes[offset];
}

export function readUint16LE(bytes: Uint8Array, offset: number): number {
  return Number(readUintLE(bytes, offset, 2));
}

export function readUint32LE(bytes: Uint8Array, offset: number): number {
  return Number(readUintLE(bytes, offset, 4));
}

export function readUint64LE(bytes: Uint8Array, offset: number): bigint {
  return readUintLE(bytes, offset, 8);
}

export function readUint128LE(bytes: Uint8Array, offset: number): bigint {
  return readUintLE(bytes, offset, 16);
}

export function hexWords(bytes: Uint8Array): string[] {
  const words: string[] = [];
  for (let offset = 0; offset + 32 <= bytes.length; offset += 32) {
    words.push(bytesToHex(bytes.slice(offset, offset + 32), false));
  }
  return words;
}

export function formatUnits(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const safeDecimals = Math.max(0, Math.min(decimals, 80));
  const base = 10n ** BigInt(safeDecimals);
  const whole = abs / base;
  let fraction = safeDecimals > 0 ? (abs % base).toString().padStart(safeDecimals, "0") : "";
  fraction = fraction.replace(/0+$/, "");
  const body = fraction ? `${whole.toString()}.${fraction}` : whole.toString();
  return negative ? `-${body}` : body;
}

export function formatAmount(value: bigint, decimals: number, maxFraction = 8): string {
  const text = formatUnits(value, decimals);
  const [whole, fraction] = text.split(".");
  if (!fraction) {
    return whole;
  }
  if (fraction.length <= maxFraction) {
    return text;
  }
  return `${whole}.${fraction.slice(0, maxFraction)}`;
}

export function shorten(value: string, head = 6, tail = 4): string {
  if (!value) {
    return value;
  }
  if (value.length <= head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}

export function formatLamports(lamports: bigint): string {
  return `${formatAmount(lamports, 9, 9)} SOL`;
}

export function toSafeNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Number(value);
}

export function isAllZero(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}

export function decodeAnyEncoding(input: string): { bytes: Uint8Array; encoding: "hex" | "base58" | "base64" } {
  const text = input.trim();
  if (!text) {
    throw new CalldataError("请输入待解码内容");
  }
  if (/^0x/i.test(text) || isHexString(text)) {
    try {
      return { bytes: hexToBytes(text), encoding: "hex" };
    } catch {
      // 继续尝试其它编码
    }
  }
  if (/[+/=]/.test(text)) {
    return { bytes: base64ToBytes(text), encoding: "base64" };
  }
  try {
    return { bytes: base58ToBytes(text), encoding: "base58" };
  } catch {
    return { bytes: base64ToBytes(text), encoding: "base64" };
  }
}

/** readUintBE 的别名，语义上用于按大端读取整数。 */
export const readBigIntBE = readUintBE;

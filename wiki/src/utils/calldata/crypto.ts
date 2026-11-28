import { keccak256 as keccak256Bytes } from "ethereum-cryptography/keccak";
import { sha256 as sha256Bytes } from "ethereum-cryptography/sha256";
import { bytesToHex, utf8Encode } from "./bytes";

export function keccak256Hex(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? utf8Encode(input) : input;
  return bytesToHex(keccak256Bytes(bytes), false);
}

export function sha256(input: Uint8Array | string): Uint8Array {
  const bytes = typeof input === "string" ? utf8Encode(input) : input;
  return sha256Bytes(bytes);
}

export function sha256Hex(input: Uint8Array | string): string {
  return bytesToHex(sha256(input), false);
}

/** 由函数签名计算 4 字节选择器，返回 0x 前缀形式。 */
export function selectorOf(signature: string): string {
  return `0x${keccak256Hex(signature).slice(0, 8)}`;
}

/** 8 字节 Anchor 指令鉴别器（discriminator）。 */
export function anchorDiscriminator(name: string, namespace = "global"): Uint8Array {
  return sha256(utf8Encode(`${namespace}:${name}`)).slice(0, 8);
}

/** EIP-55 校验和地址。 */
export function toChecksumAddress(address: string): string {
  const lower = address.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{40}$/.test(lower)) {
    return address;
  }
  const hash = keccak256Hex(lower);
  let out = "0x";
  for (let i = 0; i < 40; i += 1) {
    out += Number.parseInt(hash[i], 16) >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return out;
}

export function isChecksumAddress(address: string): boolean {
  return toChecksumAddress(address) === address;
}

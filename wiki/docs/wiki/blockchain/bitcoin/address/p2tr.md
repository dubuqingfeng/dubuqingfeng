## p2tr

Pay to Taproot（支付到 Taproot）

P2TR 是 Taproot 引入的隔离见证 v1（witness version 1）输出类型。地址为 Bech32m 编码，主网以 `bc1p…` 开头，测试网以 `tb1p…` 开头，Regtest 以 `bcrt1p…` 开头。

核心概念：
- 内部公钥（internal key）`P`：x-only 公钥（仅 32 字节 x 坐标）。
- 脚本树（taptree）：可选的 Merkle 树，根为 `merkle_root`。
- 调整（tweak）：`t = int(tagged_hash("TapTweak", bytes(P) || merkle_root)) mod n`
- 输出公钥（output key）`Q = P + t·G`（x-only 表示为 32 字节 `Qx`）。
- 见证版本：`v = 1`；见证程序（witness program）：`prog = Qx`（32 字节）。

### 地址与脚本

- scriptPubKey：`OP_1 <32-byte Qx>`
- 地址：Bech32m 编码，HRP 随网络：
  - 主网 `bc` → `bc1p…`
  - 测试网 `tb` → `tb1p…`
  - Regtest `bcrt` → `bcrt1p…`

注意：Taproot 使用 Bech32m（BIP-350），与早期的 P2WPKH/P2WSH 的 Bech32 不同。

### 从私钥到 P2TR 地址（Key-Path，仅密钥支路）

1) 私钥 `k`（32 字节）→ 内部公钥 `P`
   - 计算 `P = k·G`，取 x-only 表示 `Px`（32 字节）。
2) 选择是否有脚本树
   - 仅 key-path（无脚本树）：`merkle_root = b''`
   - 有脚本树：`merkle_root = MerkleRoot(TapLeaves)`（见“脚本支路”）
3) 计算 tweak：`t = int(TapTweak(Px, merkle_root)) mod n`
4) 计算输出公钥：`Q = P + t·G`，取 `Qx`（x-only）
5) 生成地址：见证版本 `1` + 程序 `Qx`，用 Bech32m 编码为 `bc1p…/tb1p…`

小结：P2TR 地址携带的是“调整后的输出公钥”的 x-only 值，而不是哈希。

### 交易花费

- Key-path 花费（无脚本）：
  - witness stack：`<64-byte schnorr sig [+1-byte sighash]>`（BIP-340 签名，默认 SIGHASH_ALL 可省略 1 字节）
  - 校验：使用 `Q` 验证 Schnorr 签名。

- Script-path 花费（使用脚本叶子）：
  - witness stack：`<stack items to satisfy script> <script leaf> <control block>`
  - 控制块（control block）包含：奇偶位 + 内部公钥 `P` + Merkle 路径等，用于重构 `Q` 并验证脚本有效性（BIP-341）。

### Taptree 与 TapLeaf 概要

- TapLeaf：`tagged_hash("TapLeaf", version || compact_size(len(script)) || script)`，默认 `version=0xC0`（叶子版本 0，最高位标记）。
- 两两组合：`tagged_hash("TapBranch", min(a,b) || max(a,b))` 得到父节点。
- 将所有叶子按固定规则组合为二叉 Merkle 树，最终得到 `merkle_root`。
- 若无脚本叶子，则 `merkle_root = b''`。

### 哈希与编码细节

- Tagged hash（BIP-340）：`tagged_hash(tag, msg) = SHA256(SHA256(tag)||SHA256(tag)||msg)`
- TapTweak：`tagged_hash("TapTweak", Px || merkle_root)`（无脚本时仅 `Px`）
- Schnorr 公钥使用 x-only 表示；签名也遵循 BIP-340 规则。
- Bech32m（BIP-350）：见证版本 1 的地址必须使用 Bech32m 常量进行校验。

### Python 参考片段（简化：TapTweak 与 Bech32m）

如下代码演示 Tagged hash、TapTweak 以及 Bech32m 编码要点。未包含 secp256k1 点运算与 Schnorr 实现，可使用 `secp256k1`/`coincurve`/`bitcoinlib` 等库。

```python
import hashlib

def sha256(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()

def tagged_hash(tag: str, msg: bytes) -> bytes:
    t = sha256(tag.encode())
    return sha256(t + t + msg)

def tap_tweak(Px: bytes, merkle_root: bytes = b"") -> bytes:
    assert len(Px) == 32
    return tagged_hash("TapTweak", Px + merkle_root)

# ---- Bech32m 编码（见 BIP-350，简化示意）----
CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

def bech32_polymod(values):
    GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    chk = 1
    for v in values:
        b = (chk >> 25) & 0xff
        chk = ((chk & 0x1ffffff) << 5) ^ v
        for i in range(5):
            chk ^= GEN[i] if ((b >> i) & 1) else 0
    return chk

def bech32_hrp_expand(hrp):
    return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]

def bech32_create_checksum(hrp, data, bech32m=True):
    const = 0x2bc830a3 if bech32m else 1
    values = bech32_hrp_expand(hrp) + data
    polymod = bech32_polymod(values + [0, 0, 0, 0, 0, 0]) ^ const
    return [(polymod >> 5 * (5 - i)) & 31 for i in range(6)]

def bech32_encode(hrp, data, bech32m=True):
    combined = data + bech32_create_checksum(hrp, data, bech32m)
    return hrp + '1' + ''.join([CHARSET[d] for d in combined])

def convertbits(data, from_bits, to_bits, pad=True):
    acc = 0
    bits = 0
    ret = []
    maxv = (1 << to_bits) - 1
    for value in data:
        if value < 0 or (value >> from_bits):
            return None
        acc = (acc << from_bits) | value
        bits += from_bits
        while bits >= to_bits:
            bits -= to_bits
            ret.append((acc >> bits) & maxv)
    if pad:
        if bits:
            ret.append((acc << (to_bits - bits)) & maxv)
    elif bits >= from_bits or ((acc << (to_bits - bits)) & maxv):
        return None
    return ret

def encode_p2tr_address(hrp: str, Qx: bytes) -> str:
    assert len(Qx) == 32
    version = 1  # witness v1
    data = [version] + convertbits(Qx, 8, 5)
    return bech32_encode(hrp, data, bech32m=True)
```

使用时：
- 通过库计算 `P` 与 `Q`，取 `Qx`（32 字节）
- 主网：`encode_p2tr_address('bc', Qx)`；测试网：`'tb'`；Regtest：`'bcrt'`

### 常见错误与排查

- 使用 Bech32 而非 Bech32m（导致地址无效）。
- 见证版本错误（必须为 `1`）或见证程序长度错误（必须 32 字节）。
- 把压缩公钥（33 字节）或完整公钥（65 字节）误当作见证程序；正确的是 x-only 32 字节的 `Qx`。
- 忽略 TapTweak：直接将内部公钥 `P` 编码成地址是错误的。
- 脚本支路花费时，控制块/路径顺序或叶子版本处理错误。

### 相关 BIP

- BIP-340：Schnorr 签名（x-only 公钥）
- BIP-341：Taproot（输出、公钥调整、脚本路径）
- BIP-342：Tapscript（脚本语义）
- BIP-350：Bech32m（地址编码）


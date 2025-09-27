## p2pkh

Pay to Public Key Hash（支付到公钥哈希）

P2PKH 是比特币最经典的地址类型：主网地址以 `1` 开头，测试网以 `m` 或 `n` 开头。其本质是在脚本中要求“提供与某个公钥哈希匹配的公钥和签名”。

### 地址生成流程（从私钥到地址）

以下流程适用于压缩或非压缩公钥，压缩与否会导致得到的地址不同（哈希输入不同）。

1) 私钥（WIF 或 32 字节 raw）→ 取出原始私钥
- WIF 主网前缀 `0x80`，测试网前缀 `0xEF`；若标记压缩公钥，会在私钥后附加 `0x01` 再参与 Base58Check。
- 先 Base58Check 解码得到 payload，再去掉前缀与可选的 `0x01`，可得到 32 字节私钥。

2) 椭圆曲线 secp256k1 推导公钥：`pub = priv * G`
- 压缩公钥：33 字节，`0x02/0x03 + X`（根据 Y 的奇偶性选择 0x02/0x03）
- 非压缩公钥：65 字节，`0x04 + X + Y`

3) 计算公钥哈希：`HASH160(pubkey) = RIPEMD160(SHA256(pubkey))`（20 字节）

4) 组装地址 payload：`version || pubKeyHash`
- 主网 P2PKH 版本前缀：`0x00`
- 测试网 P2PKH 版本前缀：`0x6f`

5) 计算校验和：`checksum = SHA256(SHA256(payload))[0:4]`

6) 拼接并 Base58Check 编码：`Base58Encode(payload || checksum)`
- 结果即 P2PKH 地址。主网通常以 `1` 开头；测试网以 `m` 或 `n` 开头。

小结：正确顺序是“HASH160 → 加前缀(version) → 双 SHA256 取前 4 校验和 → 拼接 → Base58Check 编码”。

### 脚本形式

- 输出脚本（scriptPubKey）：
  `OP_DUP OP_HASH160 <20-byte pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG`
- 解锁脚本（scriptSig）：
  `<DER-encoded signature + sighash> <pubkey>`

交易验证时，脚本把 scriptSig 与 scriptPubKey 拼接执行，检查提供的公钥的 HASH160 是否等于锁定脚本内的 pubKeyHash，并使用该公钥验证签名。

### WIF 私钥要点

- 主网 WIF 前缀：`0x80`；测试网 WIF 前缀：`0xEF`
- 若为“压缩公钥”私钥，则在原始 32 字节私钥末尾附加 `0x01` 再参与 Base58Check（仅作为标记，不参与椭圆曲线计算）。
- 常见前缀特征（Base58 字符串首字母，仅作经验规律）：
  - 主网未压缩 WIF 以 `5` 开头
  - 主网压缩 WIF 以 `K` 或 `L` 开头
  - 测试网未压缩 WIF 常以 `9` 开头
  - 测试网压缩 WIF 以 `c` 开头

注意：同一私钥，使用压缩公钥与非压缩公钥会得到不同的 P2PKH 地址（因为公钥不同 → HASH160 不同）。

### 简短示例（从公钥到地址）

若已知压缩公钥 `pub`（十六进制）：

1. 计算 `h160 = RIPEMD160(SHA256(pub))`
2. 组装 `payload = 0x00 || h160`（主网）
3. 计算 `checksum = SHA256(SHA256(payload))[:4]`
4. Base58 编码 `payload || checksum` 得到地址（以 `1` 开头）

### 参考 Python 片段（Base58Check 与 WIF 解析）

仅演示 Base58Check 与 WIF 解析，未包含椭圆曲线公钥推导（可用 `secp256k1`/`coincurve`/`ecdsa` 等库实现）。

```python
from hashlib import sha256, new as hashlib_new

ALPHABET = b'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
ALPHABET_IDX = {ALPHABET[i]: i for i in range(58)}

def b58encode(b: bytes) -> str:
    n = int.from_bytes(b, 'big')
    chars = []
    while n > 0:
        n, r = divmod(n, 58)
        chars.append(ALPHABET[r])
    pad = len(b) - len(b.lstrip(b'\0'))
    return (ALPHABET[:1] * pad + bytes(reversed(chars or [ALPHABET[0]]))).decode()

def b58decode(s: str) -> bytes:
    n = 0
    for c in s.encode():
        n = n * 58 + ALPHABET_IDX[c]
    full = n.to_bytes((n.bit_length() + 7) // 8, 'big') or b'\0'
    pad = len(s) - len(s.lstrip('1'))
    return b'\0' * pad + full

def b58check_encode(payload: bytes) -> str:
    checksum = sha256(sha256(payload).digest()).digest()[:4]
    return b58encode(payload + checksum)

def b58check_decode(s: str) -> bytes:
    raw = b58decode(s)
    payload, checksum = raw[:-4], raw[-4:]
    if sha256(sha256(payload).digest()).digest()[:4] != checksum:
        raise ValueError('Bad Base58Check checksum')
    return payload

def hash160(data: bytes) -> bytes:
    return hashlib_new('ripemd160', sha256(data).digest()).digest()

def wif_to_privkey(wif: str):
    payload = b58check_decode(wif)
    if payload[0] not in (0x80, 0xEF):
        raise ValueError('Not a WIF payload')
    version = payload[0]
    if len(payload) == 34 and payload[-1] == 0x01:
        compressed = True
        priv = payload[1:-1]
    elif len(payload) == 33:
        compressed = False
        priv = payload[1:]
    else:
        raise ValueError('Invalid WIF length')
    network = 'mainnet' if version == 0x80 else 'testnet'
    return priv, compressed, network

# 示例：从公钥生成主网 P2PKH 地址
def pubkey_to_p2pkh_address(pubkey_hex: str) -> str:
    pub = bytes.fromhex(pubkey_hex)
    h160 = hash160(pub)
    payload = b'\x00' + h160  # mainnet version 0x00
    return b58check_encode(payload)
```

### 常见错误与排查

- 将“加前缀 0x00”的步骤放在 Base58Check 编码之后（顺序错误）。
- 忘记对“版本前缀 + 哈希”整体做双 SHA256 取前 4 字节作为校验和。
- 使用了错误的版本前缀（主网 `0x00`、测试网 `0x6f`）。
- 混用压缩/非压缩公钥：同一私钥两种公钥不同，地址不同。
- 将 Bech32（如 `bc1…` 的 P2WPKH）或 P2SH（`3…`）与 P2PKH 混淆。

### 相关

- P2SH（Pay to Script Hash）：主网以 `3` 开头
- P2WPKH（Bech32）：主网以 `bc1q` 开头
- P2TR（Bech32m）：主网以 `bc1p` 开头


## p2sh

Pay to Script Hash（支付到脚本哈希）

P2SH 将“复杂的锁定条件”隐藏在地址背后。地址本身仅携带 redeemScript 的 HASH160，主网地址以 `3` 开头，测试网以 `2` 开头。

### 地址与脚本

- scriptPubKey：`OP_HASH160 <20-byte scriptHash> OP_EQUAL`
- 地址编码：Base58Check
  - 版本前缀（version）：主网 `0x05`，测试网 `0xC4`
  - payload：`version || HASH160(redeemScript)`（共 21 字节）
  - 校验和：`SHA256(SHA256(payload))[0:4]`
  - Base58Check(payload || checksum) → 地址（主网以 `3`，测试网以 `2` 开头）

注意：scriptHash 是对“redeemScript 原始字节”的 HASH160，而不是对公钥或地址的哈希。

### 花费流程（解锁）

- 普通 P2SH：
  - scriptSig：`<...满足 redeemScript 的数据...> <redeemScript>`
  - 执行顺序：先把 scriptSig 与 scriptPubKey 拼接执行，最终将压栈的 redeemScript 作为新的脚本执行。

- P2SH 包装隔离见证（Nested SegWit）常见两类：
  - P2SH-P2WPKH（BIP-141/143）：
    - redeemScript：`0 <20-byte HASH160(pubkey)>`（十六进制形态为 `0014{20字节}`）
    - scriptSig：`<redeemScript>`（仅推入 redeemScript）
    - 见证栈 witness：`<signature> <pubkey>`
  - P2SH-P2WSH：
    - redeemScript：`0 <32-byte SHA256(witnessScript)>`
    - scriptSig：`<redeemScript>`
    - 见证栈 witness：`<...满足 witnessScript 的数据...> <witnessScript>`

### 从 redeemScript 到地址（流程）

1) 计算 `scriptHash = RIPEMD160(SHA256(redeemScript))`（20 字节）
2) 组装 payload：`0x05 || scriptHash`（主网；测试网用 `0xC4`）
3) checksum：双 SHA256 取前 4 字节
4) Base58Check 编码得到地址

### 示例 redeemScript（2-of-3 多签）

结构：`OP_2 <P1> <P2> <P3> OP_3 OP_CHECKMULTISIG`

若 3 个压缩公钥 `P1/P2/P3` 为 33 字节：
- `OP_2 = 0x52`，`OP_3 = 0x53`，`OP_CHECKMULTISIG = 0xAE`
- 每个公钥前放长度前缀 `0x21`（33 十进制）

redeemScript 十六进制大致为：
`52 21 <P1> 21 <P2> 21 <P3> 53 AE`

执行 HASH160 后按上文规则编码成地址即可。

提示：为生成稳定的多签地址，推荐按 BIP-67 对公钥进行字典序排序。

### Python 片段（从 redeemScript 生成 P2SH 地址）

仅演示 Base58Check 与 HASH160，对应构造 redeemScript 的逻辑自行实现。

```python
from hashlib import sha256, new as hashlib_new

ALPHABET = b'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
ALPHABET_IDX = {ALPHABET[i]: i for i in range(58)}

def b58encode(b: bytes) -> str:
    n = int.from_bytes(b, 'big')
    out = []
    while n:
        n, r = divmod(n, 58)
        out.append(ALPHABET[r])
    pad = len(b) - len(b.lstrip(b'\0'))
    return (ALPHABET[:1] * pad + bytes(reversed(out or [ALPHABET[0]]))).decode()

def b58check(payload: bytes) -> str:
    checksum = sha256(sha256(payload).digest()).digest()[:4]
    return b58encode(payload + checksum)

def hash160(b: bytes) -> bytes:
    return hashlib_new('ripemd160', sha256(b).digest()).digest()

def p2sh_address_from_redeem_script(redeem_script_hex: str, mainnet: bool = True) -> str:
    rs = bytes.fromhex(redeem_script_hex)
    script_hash = hash160(rs)
    version = b'\x05' if mainnet else b'\xC4'
    payload = version + script_hash
    return b58check(payload)

# 示例：P2SH-P2WPKH redeemScript（v0，20字节）
def redeem_script_p2wpkh(pubkey_hex: str) -> str:
    pub = bytes.fromhex(pubkey_hex)
    h160 = hash160(pub)
    return (b'\x00' + b'\x14' + h160).hex()  # 0x00 + push20 + h160
```

### 常见错误与排查

- 将公钥哈希当作 scriptHash：P2SH 的哈希对象是 redeemScript（脚本），不是公钥。
- 版本字节错误：主网 `0x05`、测试网 `0xC4`；不要与 P2PKH 的 `0x00/0x6f` 混淆。
- 忘记在 scriptSig 中附带 redeemScript（非嵌套隔离见证场景）。
- P2SH-P2WPKH/P2WSH 混淆 witness 与 scriptSig 的放置位置。
- 对 redeemScript 先做 Base58 或错误编码后再哈希（应直接对原始字节做 HASH160）。

### 相关

- P2PKH（`1…/m|n…`）：基于公钥哈希
- P2WPKH/P2WSH（`bc1q…/tb1q…`）：Bech32（v0 witness）
- P2TR（`bc1p…`）：Bech32m（v1 witness）
- BIP-16（P2SH 激活）、BIP-13（P2SH 地址格式）、BIP-141（隔离见证）

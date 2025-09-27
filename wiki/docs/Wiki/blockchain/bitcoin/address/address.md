## 地址概览

Bitcoin 地址是锁定脚本的“人类可读”表达，常见三类：

- Base58Check（传统）：P2PKH、P2SH
- Bech32（SegWit v0）：P2WPKH、P2WSH（`bc1q…/tb1q…`）
- Bech32m（SegWit v1+）：P2TR（Taproot，`bc1p…/tb1p…`）

地址不是账户，链上仍以脚本与 UTXO 为核心。地址只是特定脚本模板的编码。

### Base58Check 概览

- 结构：`payload || checksum`
- payload：`version || data`
  - P2PKH：`version=0x00(main)/0x6f(test)`，`data=HASH160(pubkey)`（20B）
  - P2SH：`version=0x05(main)/0xC4(test)`，`data=HASH160(redeemScript)`（20B）
- checksum：`SHA256(SHA256(payload))[:4]`
- 编码：Base58，不含 0/O/I/l 等易混字符

### Bech32 与 Bech32m

- 组成：`hrp '1' data+checksum`
  - hrp：主网 `bc`，测试网 `tb`，regtest `bcrt`
  - data：`witness_version(5-bit) || program(convertbits(8→5))`
- Bech32（BIP173）：用于 v0 地址（P2WPKH 20B、P2WSH 32B）
- Bech32m（BIP350）：用于 v1+ 地址（Taproot P2TR 32B）
- 常见陷阱：v1 地址必须使用 Bech32m 校验常量

### Witness program 长度

- v0：长度只能为 20（WPKH）或 32（WSH）
- v1（Taproot）：长度 32（x-only 公钥）
- 其它版本留作未来扩展

### 参考实现要点（Go 伪代码）

```go
// Base58Check
func Base58Check(version byte, data []byte) string {
    payload := append([]byte{version}, data...)
    sum := Hash256(payload)[:4]
    return b58encode(append(payload, sum...))
}

// Bech32(m)（仅展示框架）
func EncodeSegwit(hrp string, ver byte, program []byte, bech32m bool) (string, error) {
    if ver == 0 && !(len(program) == 20 || len(program) == 32) { return "", Err }
    if ver > 0 && !bech32m { return "", Err }
    data := append([]byte{ver}, convertBits(program, 8, 5, true)...)
    return bech32Encode(hrp, data, bech32m), nil
}
```

### 选型建议

- 钱包外发：首选 v0 P2WPKH（Bech32）或 v1 P2TR（Bech32m）
- 兼容性考虑（老钱包）：可用 P2SH-P2WPKH（以 `3` 开头）
- 多签：优先 WSH/Tapscript，配合描述符与 Miniscript 以便审计

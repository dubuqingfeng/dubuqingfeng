## 签名与 y-parity/链 ID（EIP-155）

交易签名使用 secp256k1（Keccak-256 摘要）。

### v 值与链 ID

- 早期（无 EIP-155）：`v` 为 27/28（y-parity + 27）
- EIP-155：`v = {27,28} + chainId*2 + 8`，防跨链重放
- Typed tx（2930/1559）：将 `chainId` 独立，`v` 仅为 y-parity（0/1）

### 公钥恢复与地址

- 从 `(r,s,v)` 恢复公钥，地址为 `keccak(pubkey[1:])[12:]`（后 20 字节）
- 合约地址：`keccak(rlp(sender, nonce))[12:]`；CREATE2：`keccak(0xff || sender || salt || keccak(init_code))[12:]`

### Go 伪代码（地址推导）

```go
func AddressFromPubkey(pub []byte) [20]byte {
    h := keccak256(pub[1:]) // 去掉未压缩公钥前缀 0x04
    var a [20]byte
    copy(a[:], h[12:])
    return a
}
```


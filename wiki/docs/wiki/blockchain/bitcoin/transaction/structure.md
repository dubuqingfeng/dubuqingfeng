## 交易结构与序列化

典型交易（非 SegWit）：

```text
version | tx_in_count | [txin...] | tx_out_count | [txout...] | locktime
```

SegWit 交易多出两字节：`marker=0x00, flag=0x01`，并在尾部附带 `witness`。

### 输入与输出

- 输入（TxIn）：`outpoint(txid,vout) | scriptSig | sequence`
- 输出（TxOut）：`value(int64) | scriptPubKey`

UTXO 模型：输出不可变，通过输入精确引用 `outpoint=(txid,vout)` 来“花费”指定输出。

### txid 与 wtxid

- txid：对“基础序列化（不含 witness）”的双 SHA256
- wtxid：对“完整序列化（含 witness）”的双 SHA256
- 隔离见证后，第三方更改 scriptSig 不会改变 txid（消除 malleability）

### VarInt 与端序

- 变长整数（VarInt）：
  - `< 0xFD`：单字节
  - `0xFD` 后跟 `uint16 (LE)`
  - `0xFE` 后跟 `uint32 (LE)`
  - `0xFF` 后跟 `uint64 (LE)`
- 注意混合端序：字段多为小端序列化，但哈希显示常以“反转字节序”的形式展示

### SegWit 序列化（v0）

```text
version | 0x00 | 0x01 | tx_in_count | [txin...] | tx_out_count | [txout...] | witness | locktime
```

每个输入对应一个 witness 栈（stack items），用于携带签名、公钥或脚本等见证数据。

### Go 伪代码：Hash256 与 VarInt

```go
func Hash256(b []byte) [32]byte {
    h1 := sha256.Sum256(b)
    h2 := sha256.Sum256(h1[:])
    return h2
}

func ReadVarInt(r io.Reader) (uint64, error) {
    var p [1]byte
    if _, err := io.ReadFull(r, p[:]); err != nil { return 0, err }
    switch p[0] {
    case 0xfd:
        var x uint16; _ = binary.Read(r, binary.LittleEndian, &x); return uint64(x), nil
    case 0xfe:
        var x uint32; _ = binary.Read(r, binary.LittleEndian, &x); return uint64(x), nil
    case 0xff:
        var x uint64; _ = binary.Read(r, binary.LittleEndian, &x); return x, nil
    default:
        return uint64(p[0]), nil
    }
}
```

### 常见陷阱

- 将 marker/flag 错当作输入数量（导致解析错位）
- 误用 wtxid 作为交易引用（链上 outpoint 使用 txid）
- scriptSig 与 witness 放置位置混淆（尤其是 P2SH-P2WPKH）


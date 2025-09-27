## Merkle 树与见证承诺

Merkle 树用于将交易集合压缩为 32 字节的根（merkle_root），便于轻客户端验证交易是否包含于区块。

### 交易 Merkle 树

- 叶子：`txid`（不含见证）
- 奇数复制：若层级节点数为奇数，复制最后一个节点
- 根写入区块头 `merkle_root`

### Witness Commitment（BIP141）

- 见证数据不参与交易 Merkle；为锚定见证，coinbase 的 `OP_RETURN` 写入 commitment：
  - `wtxid_merkle_root` 与随机前缀组合
  - 节点验证见证承诺与区块见证数据一致性

### Go 伪代码：Merkle Root

```go
func MerkleRoot(leaves [][32]byte) [32]byte {
    if len(leaves) == 0 { return [32]byte{} }
    cur := leaves
    for len(cur) > 1 {
        var next [][32]byte
        for i := 0; i < len(cur); i += 2 {
            a := cur[i][:]
            j := i + 1
            if j >= len(cur) { j = len(cur) - 1 }
            b := cur[j][:]
            h := Hash256(append(a, b...))
            next = append(next, h)
        }
        cur = next
    }
    return cur[0]
}
```


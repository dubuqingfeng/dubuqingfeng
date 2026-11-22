## 区块头与目标难度

区块头结构：

```text
version | prev_block | merkle_root | time | bits | nonce
```

校验条件：`Hash256(header) <= target(bits)`。

### nBits 与目标（target）

- `nBits` 为紧凑表示：`target = mantissa * 256^(exponent-3)`
- 每 2016 块根据实际耗时调整难度，使区块平均 10 分钟
- 调整系数限制在原目标的 [0.25x, 4x] 区间

### MTP（Median-Time-Past）

- 多处时间相关校验（如锁定时间）基于过去 11 个区块时间戳的中位数
- 抑制矿工操纵本地时钟的影响

### Merkle Root（交易根）

- 以交易 txid 为叶子构建二叉树，奇数复制末尾
- witness 数据通过 coinbase 的见证承诺另行锚定

### Go 伪代码：CompactToTarget 与 PoW 校验

```go
func CompactToTarget(bits uint32) *big.Int {
    exp := int(bits >> 24)
    mant := bits & 0x007fffff
    n := new(big.Int).SetUint64(uint64(mant))
    shift := exp - 3
    if shift > 0 { n = n.Lsh(n, uint(8*shift)) } else { n = n.Rsh(n, uint(8*(-shift))) }
    return n
}

func CheckPoW(header []byte, bits uint32) bool {
    h := Hash256(header)             // 32B，小端展示
    // 翻转小端字节用于数值比较
    rev := make([]byte, 32)
    for i := 0; i < 32; i++ { rev[i] = h[31-i] }
    hv := new(big.Int).SetBytes(rev)
    tgt := CompactToTarget(bits)
    return hv.Cmp(tgt) <= 0
}
```


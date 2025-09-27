## 紧凑区块（BIP152）

紧凑区块通过“短 ID + 缺失交易按需拉取”的方式加速新区块传播，降低带宽并减少孤块概率。

### 基本流程

1) 新区块生成后，节点发送 `cmpctblock`：
   - 包含区块头、prefilled_tx（少量完整交易，如 coinbase）、短 ID 列表（其余交易）
2) 对端根据 mempool 尝试重构完整区块：
   - 根据短 ID 在本地 mempool 命中交易
   - 未命中则以 `getblocktxn` 请求缺失交易
3) 发送方以 `blocktxn` 回应缺失交易

### 短 ID 计算

- 使用 SipHash-2-4 对交易哈希（wtxid 或 txid，实际使用 txid；BIP152 v2 可选 wtxid）做 6 字节截断
- SipHash key 基于区块头与 nonce（每个块不同）
- 短 ID 冲突概率低，但仍通过 prefilled 与索引校验规避

### 优势与权衡

- 优势：
  - 降低带宽：仅少量交易需要完整传输
  - 降低延迟：更快达到“足够重构”的状态
- 权衡：
  - 依赖 mempool 命中率；不同节点 mempool 差异导致缺失率波动
  - 需要额外的请求/响应往返（getblocktxn/blocktxn）

### 启用与协商

- 通过 `sendcmpct`/`sendheaders` 等消息协商
- 节点可宣告是否支持紧凑区块，以及偏好的公告模式

### 实现提示（Go 伪代码）

```go
type CmpctBlock struct {
    Header    BlockHeader
    Nonce     uint64
    Prefilled []TxWithIndex   // 包含 coinbase 等
    ShortIDs  [][]byte        // 每个 6 字节
}

func ShortID(txid [32]byte, key [16]byte) [6]byte {
    // SipHash-2-4(txid) 截断到 6 字节
}

func Reconstruct(cb CmpctBlock, mempool map[[32]byte]*Tx) (*Block, MissingList) {
    // 1) 放入 prefilled
    // 2) 用短 ID 在 mempool 中命中交易
    // 3) 记录未命中索引用于 getblocktxn
}
```

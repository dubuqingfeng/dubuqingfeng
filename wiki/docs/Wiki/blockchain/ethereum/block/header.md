## 区块头与执行负载（后 Merge）

执行层区块头关键域：

- `parentHash`、`stateRoot`、`transactionsRoot`、`receiptsRoot`
- `logsBloom`（2048-bit）
- `beneficiary`（coinbase 提议者地址）
- `prevRandao`（EIP-4399）
- `gasLimit`、`gasUsed`、`timestamp`、`baseFeePerGas`
- `extraData`

PoW 字段保留形式兼容但不参与共识（`difficulty=0`，`nonce` 无实际意义）。

### BaseFee 调整（EIP-1559）

目标气量为 `gasLimit/2`，单块调节步长上限为 baseFee/8：

```text
baseFee' = baseFee + floor(baseFee * (gasUsed - target) / target / 8)
```

### Trie 根

- `stateRoot`：全局账户状态根（MPT）
- `transactionsRoot`：交易列表的 Merkle-Patricia 根
- `receiptsRoot`：收据列表的 Merkle-Patricia 根


## 执行层/共识层与 The Merge（PoS）

以太坊已从 PoW 迁移至 PoS。网络分为：

- 共识层（CL, Beacon）：出块者/验证者、投票与终结性（Casper FFG + LMD-GHOST）
- 执行层（EL）：交易执行、EVM、状态转换、收据与日志

### The Merge（EIP-3675）

- 执行层区块由共识层驱动，区块头中引入 `prevRandao`（EIP-4399）替代 PoW `mixHash`；不再使用 `nonce` 与实际难度
- 区块奖励/叔块奖励等 PoW 逻辑废弃；手续费（priority fee）归提议者

### Withdrawals（EIP-4895）

- 共识层触发提款，执行层携带 `withdrawals` 字段并更新账户余额

### Proto-danksharding（EIP-4844，可选）

- 引入 blob 载荷、KZG 承诺与单独的 blob gas 市场（与执行层 tx 分离）

参考：EIP-3675、EIP-4399、EIP-4895、EIP-4844


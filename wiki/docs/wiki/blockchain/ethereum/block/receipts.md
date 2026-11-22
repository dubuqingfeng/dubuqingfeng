## 收据与日志 Bloom

每笔交易执行结束会生成收据（receipt），包含：

- `status` 或 `stateRoot`（早期）
- `cumulativeGasUsed`（到当前交易为止总 gas 消耗）
- `logsBloom`（2048-bit Bloom，索引本笔交易日志）
- `logs`（事件日志数组）：`address`、`topics[]`、`data`

区块级 `receiptsRoot` 是所有收据的 MPT 根；区块头 `logsBloom` 是所有交易日志 Bloom 的或运算结果。

事件筛选依赖：`eth_getLogs` 基于地址/主题在节点索引中筛选；客户端可用 Bloom 先行粗过滤。


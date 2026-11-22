## 事件与日志（Events & Logs）

Solidity 的 `event` 会在链上生成日志：

- `address`：日志发出者（合约地址）
- `topics[]`：最多 4 个主题，其中 `topic0 = keccak(EventSignature)`（匿名事件除外）
- `data`：按 ABI 打包的非 indexed 参数

### 过滤与索引

- `eth_getLogs` 支持基于地址/主题的过滤与区块范围筛选
- `logsBloom` 用于粗过滤；客户端需对候选日志再做精确匹配

### 小贴士

- 谨慎使用字符串/动态数组作为 indexed（会被哈希）；检索需要一致的编码方式
- 事件仅用于链下索引/通知，不参与状态；不要依赖事件作为合约逻辑的可信输入


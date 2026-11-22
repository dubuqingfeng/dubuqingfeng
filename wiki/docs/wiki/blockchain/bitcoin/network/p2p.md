## P2P 协议与消息

Bitcoin P2P 使用 TCP，消息封装为：`magic | command[12] | length | checksum | payload`。

### 握手与能力

- `version`/`verack`：交换版本、服务位（NODE_NETWORK 等）、网络地址（BIP155 支持 v2/tor v3）
- `sendheaders`：请求以 `headers` 而非 `inv` 方式通告新区块
- `sendcmpct`：协商紧凑区块（BIP152）

### 同步与中继

- 头同步：`getheaders/headers`，headers-first 再拉区块
- 区块/交易中继：`inv -> getdata -> tx/block`
- 保活与延迟：`ping/pong`

### 提升效率

- 紧凑区块（BIP152）：短 ID + 缺失交易按需拉取
- wtxid 中继（BIP339）：以 wtxid 为单位，配合见证策略更稳定
- 轻客户端过滤器（BIP157/158, Neutrino）：以 Golomb-Rice 过滤器替代 Bloom

### 抗攻击策略

- 中继策略限制非标准交易，限制脚本复杂度与 mempool 资源
- 孤儿池大小限制与优先级处理，防止 DoS
- 地址管理与多出站连接，降低女巫/日蚀攻击风险


## devp2p 与同步（eth/66、snap）

以太坊网络基于 devp2p（RLPx），在其上叠加 `eth/*` 协议族：

- 握手：交换 `protocolVersion`、`networkId`、链上 head、总难度（PoW 时期）或 fork 信息
- `eth/66`：交易、区块、状态等消息的版本化载体

### 同步模式

- Full/Archive：下载并执行全部区块（Archive 额外保留历史状态）
- Fast/Snap：
  - Fast（历史）：跳过早期执行，下载状态快照
  - Snap（现代）：基于分段的状态快照与按需证明，显著提速（geth 的 snap sync）

### 广播与中继

- 交易池 gossip，区块广播；基于评分/带宽限制防止滥用

参考：devp2p、RLPx、eth/66、snap 协议说明


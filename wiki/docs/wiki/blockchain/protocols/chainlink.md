---
title: "Chainlink：预言机、CCIP 与 VRF 的信任边界"
slug: "/Wiki/blockchain/protocols/chainlink"
description: "区分 Data Feeds、CCIP、VRF 与 Automation 各自解决什么问题，以及节点、DON、RMN 和多签分别在信任链的哪一层。"
---

# Chainlink：预言机、CCIP 与 VRF 的信任边界

> **一句话：** Chainlink 不是“把真实世界数据上链”的单一服务，而是几套不同的去中心化服务：Data Feeds 聚合价格，CCIP 做跨链消息/资产，VRF 提供可验证随机数，Automation 触发链上任务。每套的信任边界不同。

读 Chainlink 最常见的错误，是把“去中心化预言机”当成“无需信任”。正确的问题是：**这一条数据/消息由谁签名、多少人合谋才能作恶、失败时合约怎么办。**

## 1. 角色与资产流 {#roles}

| 服务 | 角色 | 产出 |
| --- | --- | --- |
| Data Feeds | 节点运营商、OCR 聚合器、Proxy | 价格/数据 round |
| CCIP | Router、OnRamp/OffRamp、CommitStore、RMN、DON | 跨链消息与 token 转移 |
| VRF | 订阅账户、Coordinator、节点 | 随机数 + 证明 |
| Automation | Upkeep、keeper 网络 | 条件触发的交易 |
| 消费者合约 | 读 feed、发 CCIP 消息、请求随机数 | 业务逻辑 |

资产流（CCIP）：

```text
用户 ──ccipSend──> Router ──> OnRamp ──> 源链 CommitStore
                                      │
                                      ▼
                               RMN / DON 观察
                                      │
                                      ▼
目标链 OffRamp ──> Router ──> 接收方（或 token 池）
```

## 2. 核心状态 {#state}

| 服务 | 状态 | 关键字段 |
| --- | --- | --- |
| Data Feeds | Aggregator/Proxy | `latestRoundData`、`decimals`、`updatedAt`、roundId、节点答案 |
| CCIP | 消息/通道 | `messageId`、lane、nonce、fee、gasLimit、confirmations、RMN 状态 |
| CCIP Token Pool | 锁/销毁池 | 支持的 token、流动性、rate limit |
| VRF | 订阅/请求 | subscriptionId、requestId、randomWords、confirmations |
| Automation | Upkeep | target、checkData、gasLimit、lastUpkeep |

## 3. 关键机制 {#mechanism}

### 3.1 Data Feeds：OCR 聚合 + 心跳/偏差阈值

- 多个节点从数据源取价，通过 OCR（Off-Chain Reporting）在链下聚合，再由一个节点提交聚合结果。
- 链上 Proxy 指向当前 Aggregator，消费者通过 `AggregatorV3Interface` 读取。
- 更新触发条件通常是 **heartbeat（时间）** 或 **deviation threshold（价格偏差）**，两者取先到。
- L2 上还要看 **Sequencer Uptime Feed**： sequencer 停机期间价格可能过期，借贷协议应暂停或加保护。

读价格时至少检查：`answer > 0`、`updatedAt` 未过期、`answeredInRound >= roundId`、decimals 正确。

### 3.2 CCIP：源链提交、目标链执行、RMN 兜底

CCIP 的跨链流程可以拆成：

1. 用户在源链调用 Router 的 `ccipSend`，支付 fee，指定目标链、接收方、数据和 token。
2. OnRamp 组装消息；部分版本/通道使用 CommitStore 记录 merkle root，新架构以官方文档为准。
3. DON 观察源链，目标链 OffRamp 执行；token 由 Token Pool 锁定/释放或销毁/铸造。
4. RMN（Risk Management Network）可以独立验证并延迟/阻止异常消息。

信任点包括：DON 阈值、RMN、Router/OffRamp 合约、Token Pool 的流动性与 rate limit。**跨链消息不是“原子”的**：源链成功、目标链可能延迟或失败，需要处理重试/手动执行。

### 3.3 VRF：请求-响应与确认数

VRF v2/v2.5 的流程：

- 合约创建/充值 subscription，发起请求并指定 confirmations、callback gas、word 数量。
- Coordinator 在达到确认数后，由节点返回随机数和证明；合约在 callback 中校验。
- 费用从 subscription 扣；gas 不足会导致 callback 失败，需要重试。

随机数的安全性依赖：请求的 confirmations、节点承诺、callback gas 和订阅余额。**不要在同一交易里请求并假设立即拿到随机数。**

### 3.4 Automation：条件检查与 keeper 执行

Automation 的 Upkeep 由 keeper 网络按条件触发：

- `checkUpkeep` 返回是否需要执行；`performUpkeep` 执行实际逻辑。
- 需要保证 `performUpkeep` 可被重复调用而不破坏状态（幂等/防重）。
- gas limit、checkData、预算和优先级都会影响是否被及时执行。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| 合约仓库 | [`smartcontractkit/chainlink`](https://github.com/smartcontractkit/chainlink)（HEAD `c10b4f254223b75f2ab4406fb4f8b1a19248ff64`） |
| Solidity 接口 | [`smartcontractkit/chainlink` contracts](https://github.com/smartcontractkit/chainlink/tree/develop/contracts) |
| Data Feeds 文档 | [docs.chain.link/data-feeds](https://docs.chain.link/data-feeds) |
| CCIP 文档 | [docs.chain.link/ccip](https://docs.chain.link/ccip) |
| VRF 文档 | [docs.chain.link/vrf](https://docs.chain.link/vrf) |
| 链上地址 | 以 [docs.chain.link](https://docs.chain.link/) 的地址页和区块浏览器为准；每条链不同 |

> **证据边界：** 本文核对的是 Chainlink 公开仓库 HEAD 与官方文档的服务划分，没有调用生产 feed、没有发送 CCIP 消息、没有请求 VRF。节点集合、阈值、RMN 配置和地址会变，读官方地址页与链上状态为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 价格过期 | heartbeat 未到、节点故障、L2 停机 | `updatedAt`、sequencer uptime、deviation |
| 价格偏差 | 数据源异常、市场操纵 | 多源对比、round 历史、偏差阈值 |
|  decimals 误用 | 把 8 位当 18 位 | `decimals()`、计算单位 |
| CCIP 目标链失败 | gas 不足、接收方 revert、rate limit | `messageId`、手动执行、Token Pool 状态 |
| RMN 延迟 | 风险网络介入 | RMN 状态、lane 配置 |
| VRF callback 失败 | gas 不足、订阅余额不足 | requestId、callback 状态、重试 |
| Automation 不执行 | 预算不足、条件不满足、拥堵 | upkeep 余额、checkData、执行历史 |
| 多签/管理员 | 升级、改配置、提取资金 | owner/admin、多签阈值、时间锁 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认用的是 Data Feeds、CCIP、VRF 还是 Automation，不要混用信任模型。
- [ ] 读 feed：`decimals`、`latestRoundData`、`updatedAt`、round 完整性。
- [ ] L2 上检查 Sequencer Uptime Feed，设计停机保护。
- [ ] CCIP：记录 `messageId`、lane、fee、gasLimit、confirmations 和目标链执行状态。
- [ ] 对 token 跨链，检查 Token Pool 类型（lock/release vs burn/mint）和 rate limit。
- [ ] VRF：确认 subscription 余额、confirmations、callback gas 和请求状态。
- [ ] Automation：确认 `performUpkeep` 幂等、预算充足、权限正确。
- [ ] 查 owner/admin/多签和时间锁，别把“去中心化”当成“无管理员”。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave](./aave.md)、[Morpho](./morpho.md)：价格源如何进入借贷风险
- [Polymarket](./polymarket.md)：UMA 乐观预言机的另一种解析信任

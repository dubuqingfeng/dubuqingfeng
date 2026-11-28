---
title: "Polymarket：YES/NO 份额、CLOB 与 UMA 解析"
slug: "/Wiki/blockchain/protocols/polymarket"
description: "拆解 Polymarket 的 Conditional Token Framework、CTF Exchange 订单簿、NegRisk 转换与 UMA Optimistic Oracle 解析流程，并给出失败模式与读数据清单。"
---

# Polymarket：YES/NO 份额、CLOB 与 UMA 解析

> **一句话：** Polymarket 把“事件结果”拆成两种 ERC-1155 份额（YES/NO），用链下订单簿撮合、链上 CTF Exchange 结算，再用 UMA 的乐观预言机决定哪一侧可以赎回 1 美元。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 交易者 | 用抵押品 split 成 YES/NO，或直接在订单簿买卖 | ERC-1155 结果份额 |
| 做市商 / 挂单者 | 在 CLOB 报价，签 EIP-712 订单 | 成交后的份额或抵押品 |
| CTF Exchange | 验证签名、撮合结算、转移份额/抵押品 | 手续费（如适用） |
| UMA Proposer | 提出结果并缴纳保证金 | 正确时拿回保证金 + 奖励 |
| UMA Disputer | 质疑错误结果 | 正确时拿回保证金 + 部分对方保证金 |
| UMA DVM | 争议投票的最终仲裁 | 协议治理/质押经济 |
| Polymarket Adapter | 把 UMA 结果写回 CTF condition | 解析后的 payout |

资产流可以简化为：

```text
抵押品 pUSD ──split──> YES + NO
YES + NO ───merge───> 抵押品
事件发生 ──UMA resolve──> 赢家份额 ──redeem──> 1 pUSD / 份
```

> 文档当前使用 **pUSD** 作为 Polygon 上的结算抵押品；历史市场/接口可能仍写 USDC。读链上数据时以市场实际 `collateralToken` 为准。

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| Condition | CTF `ConditionalTokens` | `oracle`、`questionId`、`outcomeSlotCount`、`payoutNumerators` |
| Collection | CTF | `conditionId` + `indexSet`（YES=1，NO=2） |
| Position | ERC-1155 | `positionId = getPositionId(collateral, collectionId)` |
| Order | 链下 CLOB + 链上结算 | maker/taker、tokenId、价格、数量、过期、签名 |
| NegRisk 市场 | NegRisk CTF Exchange | 多结果之间的 NO→其他 YES 转换 |
| Resolution | UMA Adapter | 请求时间、ancillary data、保证金、挑战期、解析价格 |

`conditionId` 的计算：

```text
conditionId = keccak256(oracle, questionId, outcomeSlotCount)
collectionId = getCollectionId(0, conditionId, indexSet)
positionId = getPositionId(collateralToken, collectionId)
```

这意味着：**同一个问题、不同 oracle 或不同 outcome 数量，会是不同的 condition**；不要把市场标题当成主键。

## 3. 关键机制 {#mechanism}

### 3.1 CTF：完全抵押的二元份额

- 1 份抵押品可以 split 成 1 YES + 1 NO；反过来 merge。
- 市场解析后，赢家份额可 redeem 1 份抵押品，输家为 0；50/50 解析时各 0.5。
- YES/NO 始终由 CTF 合约托管，交易的是 ERC-1155 余额，不是“平台积分”。

### 3.2 CLOB：链下撮合，链上结算

- 订单在链下订单簿撮合，成交时由 CTF Exchange 验证 maker 的 EIP-712 签名并结算。
- 用户不直接把币打进“平台账户”；非托管签名 + 链上转移是核心。
- 因此要区分：**订单是否被撮合**（链下）与**结算是否上链**（链上事件）。

### 3.3 NegRisk：多结果市场的转换

- 对“谁将赢得选举”这类互斥多结果市场，NegRisk 允许把某个结果的 NO 转换成其他所有结果的 YES。
- 好处是资金效率；代价是转换路径、手续费和结算顺序更复杂，读账本时不能按普通二元市场处理。

### 3.4 UMA 解析：2 小时挑战 + DVM 兜底

典型流程（以官方文档为准）：

1. 任何人提出结果，缴纳保证金（文档示例约 750 pUSD）。
2. 2 小时挑战期；无人争议则接受。
3. 第一次争议会触发新一轮提议；第二次争议进入 UMA DVM，由 UMA 质押者投票，通常 48–72 小时。
4. Adapter 把结果写回 CTF；赢家 redeem。

Adapter 还保留少量管理功能（reset、pause、emergency resolve），这是必须纳入信任模型的部分。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| CTF Exchange | [`Polymarket/ctf-exchange`](https://github.com/Polymarket/ctf-exchange)（HEAD `ed5c7708b7be3aa98bf5f0c6602b57cc498e2ef4`） |
| CTF 标准 | [`gnosis/conditional-tokens-contracts`](https://github.com/gnosis/conditional-tokens-contracts/tree/v1.0.3)（v1.0.3） |
| UMA Adapter | [`Polymarket/uma-ctf-adapter`](https://github.com/Polymarket/uma-ctf-adapter) |
| UMA 协议 | [`UMAprotocol/protocol`](https://github.com/UMAprotocol/protocol)（HEAD `f878572fad3b0a6d9973ed701cbd69800b39b9f5`） |
| 文档 | [CTF 概览](https://docs.polymarket.com/trading/ctf/overview)、[Resolution](https://docs.polymarket.com/concepts/resolution) |

> 合约地址以 Polymarket 官方 Contracts 页面和 Polygon 浏览器为准；本文不把第三方文章里的地址当作固定事实。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 解析争议 | 结果规则模糊、提议错误、争议升级到 DVM | proposal/dispute 事件、DVM 投票、adapter 状态 |
| Oracle/管理权 | adapter admin pause/reset/emergency resolve | 管理员地址、延迟、是否多签/时间锁 |
| 订单簿信任 | 链下撮合服务停机、审查、排序 | 订单状态、成交事件、是否有其他入口 |
| NegRisk 转换 | 多结果转换路径/费用计算错误 | 转换事件、各结果份额余额 |
| 抵押品迁移 | USDC→pUSD 或跨链版本差异 | 市场 `collateralToken`、redeem 资产 |
| 规则与标题不一致 | 标题像“必赢”，规则写“无效/50-50” | 逐字读 resolution rules、end date、edge cases |
| 流动性与滑点 | 深度不足、临近解析 | 订单簿深度、点差、最近成交 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先用 `conditionId` / `positionId` 定位市场，不要只用标题。
- [ ] 核对 `collateralToken`、`outcomeSlotCount`、`negRisk` 标志。
- [ ] 读 resolution rules 的 resolution source、end date、edge cases。
- [ ] 查 UMA request 的 proposer、bond、challenge 状态、是否进入 DVM。
- [ ] 查 Adapter 的 admin/延迟，确认 emergency 权限。
- [ ] 对 CLOB：区分“订单已签/已撮合/已结算”，分别看链下状态和链上事件。
- [ ] 计算 redeem 金额时用解析后的 payout numerators，不假设必然 1/0。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave](./aave.md)、[Morpho](./morpho.md)：另一种“份额/债务”账本
- [Chainlink](./chainlink.md)：预言机信任边界
- [预测市场与条件份额](https://docs.polymarket.com/trading/ctf/overview)

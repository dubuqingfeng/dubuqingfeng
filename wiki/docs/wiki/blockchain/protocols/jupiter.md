---
title: "Jupiter：聚合器把“最优价格”拆成哪些信任"
slug: "/Wiki/blockchain/protocols/jupiter"
description: "拆解 Jupiter 的 Metis 链上路由、JupiterZ RFQ、Meta-Aggregator 与 Router 两条路径，以及报价、滑点、落地和费用边界。"
---

# Jupiter：聚合器把“最优价格”拆成哪些信任

> **一句话：** Jupiter 不是在链上维护一个池子，而是把 Metis 链上路由、JupiterZ 做市商报价、Dflow、OKX 等来源放在一起竞价，再把“报价 + 可签名交易”交给用户；**价格在链下/服务端形成，结算在 Solana 上完成**。

理解 Jupiter 的关键，是区分两条路径：

- **Meta-Aggregator**（`/order` + `/execute`）：所有路由引擎竞价，Jupiter 托管落地，收平台费。
- **Router**（`/build` + 自己发或 `/submit`）：只走 Metis 链上路由，返回原始指令，不收 Jupiter swap fee，可 CPI/改交易。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 用户 / 集成方 | 请求报价、签名、发送 | 成交后的输出 token |
| Jupiter API | 聚合报价、组装交易、管理落地 | 平台费 / 集成方 referral |
| Metis | 链上多跳、拆分路由 | 被路由的 DEX 池成交 |
| JupiterZ 做市商 | RFQ 报价，承诺 off-chain 流动性 | 成交与点差 |
| Dflow / OKX | 第三方路由/流动性 | 被选中的成交 |
| Solana DEX | 实际池子与结算 | swap 手续费 |
| 落地管线 | 优先费、重试、打包 | 交易确认 |

资产流：

```text
用户 ──/order──> Jupiter 聚合报价 ──> 选中来源（Metis / RFQ / Dflow / OKX）
     <──可签名交易──
用户签名 ──/execute──> Jupiter 落地 ──> Solana 上结算
```

Router 路径则是：`/build` 返回 Metis 的原始指令，用户自己组装、签名、发送。

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| Quote | 链下/接口响应 | `inAmount`、`outAmount`、`router`、`feeBps`、price impact、`requestId` |
| Route plan | 链下 | 多跳/拆分的 DEX、池、比例 |
| Transaction | 接口返回 | 指令、账户、lookup table、blockhash、优先费 |
| 链上余额 | Solana token accounts | 用户输入/输出 token、fee account |
| RFQ 承诺 | 做市商侧 | 报价有效期、last-look、结算方式 |
| 落地状态 | Jupiter/区块浏览器 | 签名、slot、确认、失败码 |

**报价不是链上状态。** 它可能在一秒内失效；把 `outAmount` 当成保证值，是集成里最常见的错误。

## 3. 关键机制 {#mechanism}

### 3.1 Metis：链上多跳与拆分

Metis 是 Jupiter 的链上路由引擎：在多个 Solana DEX 之间寻找多跳路径，并可以把一笔订单拆到多个池子，以降低单池价格冲击。它也可以作为独立公共品使用。

对分析者的含义：

- 一笔 swap 可能包含多个 DEX 程序和多条指令，不是“一个池子一次成交”。
- 路由结果依赖池子实时状态；池子被抽干、暂停或费用变化都会让报价失效。
- 拆单提高价格，但也增加 compute unit、账户数量和失败面。

### 3.2 JupiterZ RFQ：做市商报价与 last-look

JupiterZ 是做市商 RFQ 系统：做市商在链下报价，Jupiter 把最优报价和链上路由比较。文档明确：

- RFQ 报价通常在大币对上比链上路由好 5–20 bps。
- 做市商拥有 **last-look execution rights**（最后看一眼是否成交），因此返回的交易不能被修改。
- 需要 CPI、自定义指令或改交易时，必须走 Router，不能用 JupiterZ。

这意味着 Meta-Aggregator 的“最优价”包含一个**对手方信任**：你依赖做市商按报价结算，而 last-look 是这套机制的一部分。

### 3.3 两条路径的费用与可控性

| 维度 | Meta-Aggregator | Router |
| --- | --- | --- |
| 端点 | `/order` + `/execute` | `/build` + 自发 / `/submit` |
| 路由 | Metis + JupiterZ + Dflow + OKX | Metis only |
| 交易 | 已组装，不可修改 | 原始指令，可 CPI/改 |
| 落地 | Jupiter 托管 | 自己的 RPC / Jupiter landing |
| Jupiter swap fee | 有（按交易对） | 无 |
| 适合 | 大多数钱包/机器人 | 协议集成、自定义交易 |

文档给出的平台费示例：pegged 资产/Jupiter token 0 bps，SOL→稳定币 2 bps，LST→稳定币 5 bps，大多数交易对 10 bps，上线不足 24 小时的 token 50 bps；`/order` 响应里的 `feeBps` 才是当次实际值。

### 3.4 滑点、优先费与落地

- `/order` 使用 RTSE（Real-Time Slippage Estimator），根据 token 类别、近期滑点和失败率设置滑点；`/build` 可传 `slippageBps=rtse` 或固定值。
- `/order` + `/execute` 由 Jupiter 设置优先费并轮询确认；`/build` 返回 compute unit price，自己控制。
- 失败可能发生在报价、组装、签名、发送、落地任一环；`/order` 可能返回 `transaction: ""` 和 `errorCode`。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| 官方文档 | [Solana Swap API](https://developers.jup.ag/docs/swap)、[Order & Execute](https://developers.jup.ag/docs/swap/order-and-execute)、[Build](https://developers.jup.ag/docs/swap/build) |
| SDK / 示例 | [`jup-ag` GitHub](https://github.com/jup-ag)（`jupiter-cpi`、`jupiter-quote-api`、示例项目） |
| 核心 swap 程序 | 未找到与生产路由逐字对应的公开仓库；以官方文档和链上程序为准 |
| 链上程序 | 以 Jupiter 官方文档/浏览器为准；不同版本程序地址不同 |
| Metis | [metis.builders](https://metis.builders)（独立公共路由） |

> **证据边界：** 本文核对的是 Jupiter 官方文档（页面标注 2026-10-19 更新）与公开 GitHub 组织，没有调用生产 API、没有复现路由或落地。报价、费率、路由可用性会随服务端变化；不要把本文的费用示例当成当前报价。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 报价过期 | 池子状态变化、网络延迟 | `requestId`、报价时间、重新报价 |
| 滑点不足 | 波动大、路由深度差 | `slippageBps`、实际 outAmount、失败码 |
| RFQ 对手方 | 做市商 last-look、报价撤回 | `router` 字段、是否能改交易 |
| 路由依赖 | 某个 DEX 暂停/被攻击 | route plan、各跳池状态 |
| 落地失败 | 优先费低、blockhash 过期、拥堵 | 签名、slot、确认状态、重试 |
| API/限流 | keyless 0.5 RPS、套餐限额 | 429、x-api-key、退避 |
| Token 扩展 | Token-2022 transfer hook/冻结 | mint 扩展、模拟交易 |
| 假币/骗局 | 同名 mint、恶意 transfer hook | mint 地址、社区验证 |
| MEV | 交易被夹、滑点被吃 | 私有落地、优先费、实际成交 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认走 Meta-Aggregator 还是 Router，两者的信任与费用不同。
- [ ] 核对 `inputMint` / `outputMint` 的完整地址，不只看 symbol。
- [ ] 记录报价时间、`router`、`feeBps`、price impact 和 `requestId`。
- [ ] 检查滑点设置与最小输出，不用默认值覆盖高风险 token。
- [ ] 对 RFQ 成交，确认交易不可修改且由 Jupiter 落地。
- [ ] 对 Router，自己模拟 compute unit、优先费、blockhash 和账户数。
- [ ] 交易前后对比 token 余额，不只看接口返回的 `outAmount`。
- [ ] 对 Token-2022，检查 transfer hook、冻结权限和额外账户。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Raydium](./raydium.md)：Jupiter 路由常经过的 Solana AMM/CLMM
- [Meteora](./meteora.md)：DLMM 流动性与动态费用
- [Kamino](./kamino.md)：Solana 借贷账户模型

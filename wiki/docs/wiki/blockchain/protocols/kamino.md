---
title: "Kamino：Solana 借贷的 Reserve 与 Obligation"
slug: "/Wiki/blockchain/protocols/kamino"
description: "拆解 Kamino KLend 的 LendingMarket/Reserve/Obligation 账户、LTV/清算阈值、elevation group 与自动去杠杆。"
---

# Kamino：Solana 借贷的 Reserve 与 Obligation

> **一句话：** Kamino KLend 把借贷拆成三类账户：LendingMarket（市场与预言机）、Reserve（每种资产的流动性/抵押配置）、Obligation（用户的存款、借款与风险组）；清算按阈值、close factor 和 bonus 执行。

Solana 的账户模型让“读仓位”比 EVM 更直观也更啰嗦：**一个 Obligation 账户里列出所有 collateral 和 borrow**，每个 Reserve 有自己的参数。分析时不要只看某个 token 余额。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 存款人 | 向 Reserve 存入流动性 | cToken/存款凭证 + 利息 |
| 借款人 | 用 collateral 抵押借款 | 债务 + 利息 |
| 清算人 | 代还债务，拿走抵押品 | 清算 bonus |
| 市场 owner/curator | 创建市场、调风险参数 | 管理权限 |
| Oracle | 提供价格 | Scope/Pyth/Switchboard 价格 |
| 自动去杠杆 | 处理坏账 | 减少协议损失 |

资产流：

```text
存款人 ──deposit──> Reserve liquidity ──> 借款人
借款人 ──repay──> Reserve ──> 存款人（利息）
清算人 ──repay debt──> 拿走 collateral（含 bonus）
```

## 2. 核心状态 {#state}

| 账户 | 关键字段 |
| --- | --- |
| LendingMarket | owner、quote currency、oracle、elevation groups |
| Reserve | liquidity mint/vault、collateral mint、config（LTV、清算阈值、bonus、protocol fee、caps、status）、利率 |
| Obligation | owner、deposits（collateral）、borrows（debt）、elevation group、last update |
| Reserve config | `loan_to_value_pct`、`liquidation_threshold_pct`、`liquidation_bonus_bps`、`protocol_liquidation_fee_pct`、deposit/borrow limit |

读仓位时要遍历 Obligation 的 deposits/borrows，分别乘 oracle 价格，再按各 Reserve 的阈值计算健康度。

## 3. 关键机制 {#mechanism}

### 3.1 Reserve：每种资产的风险参数

每个 Reserve 是独立配置的：

- LTV 决定能借多少；liquidation threshold 决定何时清算。
- liquidation bonus 给清算人；protocol liquidation fee 抽成。
- deposit/borrow limit 控制敞口。
- 利率模型按利用率变化。
- status 可以暂停/限制某种操作。

不同 Reserve 的参数不同，**不能用统一的 LTV 套所有资产**。

### 3.2 Obligation：用户的抵押与债务

Obligation 记录：

- 哪些 Reserve 作为 collateral、数量多少。
- 哪些 Reserve 被借入、债务多少。
- elevation group（相关性资产组）和 last update。

健康度通常是：

```text
weightedCollateral = Σ(collateral_i × price_i × threshold_i)
debt = Σ(borrow_j × price_j)
liquidatable if weightedCollateral < debt
```

清算时，清算人偿还部分债务，按 bonus 拿走 collateral；close factor 限制一次能还多少。

### 3.3 Elevation group：相关性资产的高 LTV

elevation group 把价格相关的资产放在一起，允许更高的 LTV/阈值。相关性失效（如 LST 脱锚）时，这个组会放大风险；读仓位时要确认是否在组内。

### 3.4 Oracle 与自动去杠杆

- Kamino 使用 Scope（以及 Pyth/Switchboard 等）价格源；不同市场配置不同。
- 自动去杠杆（auto-deleverage）用于在坏账/极端行情下处理仓位，减少协议损失；具体触发和顺序以文档/合约参数为准。
- 清算机器人依赖 Compute Unit、账户数量和优先费；拥堵时清算可能延迟。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| KLend 程序 | [`Kamino-Finance/klend`](https://github.com/Kamino-Finance/klend)（HEAD `686913ee421e0c5f3dc44c4c8344461ee0e4fb89`） |
| 主网程序 | `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD`（README） |
| Devnet 程序 | `KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD`（README） |
| 状态定义 | 仓库 `programs/klend/src/state/`（Reserve、Obligation、LendingMarket） |
| 文档 | [Kamino Docs](https://kamino.com/docs) |
| 链上账户 | 以 Kamino 官方 app/API 和 Solana 浏览器为准 |

> **证据边界：** 本文核对的是 README 的程序 ID 与仓库状态结构，没有部署、复现或运行清算。参数、oracle、elevation group 和自动去杠杆规则会变，读链上账户为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| Oracle 错误/延迟 | 价格源异常、EMA 滞后 | oracle、价格、更新时间 |
| 参数治理 | LTV/阈值/bonus 调整 | Reserve config、治理记录 |
| Elevation group 相关性失效 | LST 脱锚、稳定币脱锚 | group、资产价格、HF |
| 清算拥堵 | CU/账户多、优先费低 | 清算交易、slot、失败率 |
| 坏账 | 抵押品流动性不足、价格跳空 | 清算历史、自动去杠杆 |
| Caps | deposit/borrow limit 触顶 | Reserve config、利用率 |
| 利率模型 | 利用率飙升、借款成本 | 利率曲线、利用率 |
| 账户复杂度 | 一个 Obligation 多资产 | deposits/borrows 数量、CU |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先定位 LendingMarket 和 Oracle，再读 Reserve 配置。
- [ ] 遍历 Obligation 的 deposits/borrows，逐个乘价格和阈值。
- [ ] 区分 LTV 与 liquidation threshold，确认是否在 elevation group。
- [ ] 读 liquidation bonus、protocol fee、close factor 和 caps。
- [ ] 检查 oracle 类型、更新时间和操纵成本。
- [ ] 清算前模拟 CU、账户数和优先费。
- [ ] 查自动去杠杆规则和坏账处理路径。
- [ ] 不把单个 Reserve 的 TVL 当成可借流动性。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave](./aave.md)、[Morpho](./morpho.md)：EVM 借贷的对照
- [Raydium](./raydium.md)、[Meteora](./meteora.md)：Solana 流动性与价格源
- [Jupiter](./jupiter.md)：清算/交易落地依赖

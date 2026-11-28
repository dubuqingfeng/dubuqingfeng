---
title: "Aave V3：存款、债务指数与清算"
slug: "/Wiki/blockchain/protocols/aave"
description: "从角色、储备状态、aToken/债务指数、健康因子和清算规则理解 Aave V3.7.0，并区分 LTV、清算阈值与治理参数。"
---

# Aave V3：存款、债务指数与清算

> **一句话：** Aave 把每种资产的存款和借款记成“份额 × 指数”：存款人持有 aToken，借款人欠 scaled debt；利息通过 liquidityIndex / variableBorrowIndex 累积，健康因子决定仓位何时可被清算。

本文是协议级地图。借款、计息和风险失败的逐步复算已写在 [Aave V3 借款与健康因子](../defi/aave/v3-borrow-health-factor.md)；这里补上角色、状态、参数边界和失败模式。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 存款人 | 存入资产，获得 aToken | 本金 + 利息（aToken 余额随指数增长） |
| 借款人 | 抵押资产并借出另一种资产 | 债务（scaled variable debt）与利息 |
| 清算人 | 代还债务，折价拿走抵押品 | 清算奖励（liquidation bonus） |
| aToken / debtToken | 记录份额与指数 | 不是独立资金池，而是 Pool 的账本凭证 |
| Pool / PoolConfigurator | 执行供借、清算、改参数 | 由治理/ guardian 控制 |
| Oracle | 提供资产价格 | 健康因子与清算的估值基础 |
| 治理 / ACL | 设置 LTV、阈值、利率模型、上限、eMode | 参数风险的主要来源 |

资产流可以简化为：

```text
存款人 ──supply──> Pool ──mint aToken──> 存款人
借款人 ──borrow──> Pool ──转移资产──> 借款人，同时记 scaled debt
清算人 ──repay──> Pool ──seize aToken/抵押品──> 清算人
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| Reserve | Pool 的储备配置 | `liquidityIndex`、`variableBorrowIndex`、`currentLiquidityRate`、`currentVariableBorrowRate`、aToken/debtToken 地址、配置位图 |
| UserConfiguration | 用户位图 | 哪些储备被用作抵押、哪些被借入 |
| Scaled balance | aToken/debtToken | 实际余额 = scaled balance × 当前指数 |
| eMode | 用户/储备 | 相关性资产的统一 LTV/阈值/清算奖励 |
| Isolation | 储备配置 | 隔离资产只能借稳定币、债务上限等限制 |
| Caps | 储备配置 | supply cap / borrow cap |
| Oracle | 价格源 | 价格、更新时间、fallback |

读 Aave 时最容易混淆的三件事：

- **aToken 余额不是“存款时的数量”**，而是随 `liquidityIndex` 增长的份额结果。
- **债务余额不是“借出的数量”**，而是 scaled debt × `variableBorrowIndex`。
- **LTV 与 liquidation threshold 不是同一个数**：LTV 限制“能借多少”，threshold 决定“何时清算”。

## 3. 关键机制 {#mechanism}

### 3.1 指数计息

Aave 不为每个用户逐块更新余额，而是维护全局指数：

```text
scaledAmount = amount / index_at_deposit
currentAmount = scaledAmount * index_now
```

借款利息进入 `variableBorrowIndex`，存款利息进入 `liquidityIndex`；利差的一部分作为 reserve factor 归协议。这样 gas 成本与用户数无关，但读余额时必须先取当前指数。

### 3.2 健康因子与两种阈值

健康因子可以写成：

```text
HF = Σ(collateral_i × price_i × liquidationThreshold_i)
     / Σ(debt_j × price_j)
```

- `HF > 1`：未触及清算线。
- `HF < 1`：可被清算。
- LTV 只用于借款时的上限检查；即使 LTV 没超，价格下跌也可能让 HF 跌破 1。

V3.7.0 中还有 eMode、隔离模式和 siloed borrowing：它们会改变哪些资产能一起抵押、能借什么、用哪套阈值。不要用一条全局公式覆盖所有模式。

### 3.3 清算：close factor 与 bonus

- 一般情况下，清算人最多代还债务的 **50%**（`DEFAULT_LIQUIDATION_CLOSE_FACTOR = 0.5e4`）。
- 当 `HF < 0.95` 时，可清算比例可提高到 100%；V3.7 还支持对大额仓位动态调整 close factor。
- 清算人按 liquidation bonus 折价获得抵押品，其中一部分可能作为 protocol liquidation fee。
- 清算后仓位应回到阈值以上；如果抵押品流动性不足，可能留下坏账。

### 3.4 eMode、隔离模式与上限

- **eMode**：把价格相关的资产（如稳定币、ETH 衍生品）放进同一类别，使用更高的 LTV/阈值和统一的清算规则。相关性失效时，eMode 会放大风险。
- **Isolation**：新/低流动性资产可作为抵押，但限制可借资产和债务上限，防止风险扩散。
- **Caps**：supply/borrow cap 限制单一储备的敞口；上限内的参数仍由治理设置。

### 3.5 闪电贷与回调

Aave 的 flash loan 在同一交易内借出并归还，手续费进入储备。它不是“无风险套利”，而是把“资金必须在同一交易归还”的约束交给合约；回调逻辑写错，清算/套利合约自己会亏。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| 核心合约 | [`aave-dao/aave-v3-origin`](https://github.com/aave-dao/aave-v3-origin/tree/v3.7.0)（`v3.7.0`，提交 [`cff15de6`](https://github.com/aave-dao/aave-v3-origin/commit/cff15de6d1271b0c800fc001f4aea4c263e8a597)） |
| 清算逻辑 | [`LiquidationLogic.sol`](https://github.com/aave-dao/aave-v3-origin/blob/v3.7.0/src/contracts/protocol/libraries/logic/LiquidationLogic.sol) |
| 储备配置 | [`ReserveConfiguration.sol`](https://github.com/aave-dao/aave-v3-origin/blob/v3.7.0/src/contracts/protocol/libraries/configuration/ReserveConfiguration.sol) |
| 现有深度文 | [V3 借款、利息与健康因子](../defi/aave/v3-borrow-health-factor.md) |
| 链上地址 | 以 Aave 官方地址页和区块浏览器为准；不同链、不同版本不能混用 |

> **证据边界：** 上表固定的是 `v3.7.0` 源码标签；当前主网可能已通过治理升级到别的实现。源码版本不等于链上代理指向的实现，读参数要直接查链上 `getReserveData` / `getUserAccountData`。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 预言机错误/延迟 | 价格源异常、L2 sequencer 停机 | oracle 地址、更新时间、fallback、sequencer uptime feed |
| 参数治理 | LTV/阈值/奖励被调高或调低 | 治理提案、PoolConfigurator 事件、时间锁 |
| eMode 相关性失效 | 稳定币脱锚、LST 折价 | eMode 类别、各资产价格、HF 分布 |
| 清算流动性不足 | 抵押品深度差、清算人少 | 清算事件、DEX 深度、坏账 |
| Close factor 限制 | 大仓位一次清不完 | 债务规模、HF、清算历史 |
| 利率模型 | 利用率飙升、借款成本失控 | `currentVariableBorrowRate`、利用率 |
| 代理升级 | 实现合约被替换 | proxy admin、实现地址、治理记录 |
| 隔离/上限 | 新资产风险扩散或借款被卡 | isolation 标志、caps、可借资产 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 确认链、Pool 代理地址和当前实现版本，不要只读 GitHub 标签。
- [ ] 对每个储备读 `getReserveData`：指数、利率、aToken/debtToken、配置位图。
- [ ] 对用户读 `getUserAccountData`：总抵押、总债务、LTV、清算阈值、HF。
- [ ] 区分 LTV 与 liquidation threshold，并检查是否处于 eMode/隔离模式。
- [ ] 核对 oracle 地址、价格更新时间和 L2 sequencer uptime。
- [ ] 清算前算清 close factor、bonus、protocol fee 和实际可得抵押品。
- [ ] 查治理/guardian 权限和时间锁，确认参数可被谁、多快改掉。
- [ ] 不把 aToken 余额或债务余额直接当成本金/借款额，先乘指数。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave V3 借款、利息与健康因子](../defi/aave/v3-borrow-health-factor.md)：本地复算与失败分支
- [Morpho](./morpho.md)：更极简的“市场 = 参数 + 份额”借贷原语
- [Kamino](./kamino.md)：Solana 上的储备/义务账户模型

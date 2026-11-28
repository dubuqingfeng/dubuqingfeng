---
title: "Lido：stETH 份额、预言机报告与提款队列"
slug: "/Wiki/blockchain/protocols/lido"
description: "拆解 Lido 的 stETH/wstETH 份额、存款与验证者、Oracle 报告、提款队列和 Staking Router 的信任边界。"
---

# Lido：stETH 份额、预言机报告与提款队列

> **一句话：** Lido 把用户存入的 ETH 集中质押到一组验证者，用户拿到可转让的 stETH（ rebasing 份额）；每天由 Oracle 委员会报告验证者余额和奖励，提款则进入队列，按最终确定的报告领取 ETH。

读 Lido 的核心不是“质押收益率”，而是**份额、报告和队列三者如何对账**：stETH 余额会变、wstETH 不变、提款要等 finalization。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 存款人 | 存入 ETH | stETH（ rebasing）或 wstETH（包装） |
| 验证者 / 节点运营商 | 运行 beacon chain 验证者 | 质押奖励、手续费分成 |
| Oracle 委员会 | 报告验证者余额、奖励、提款 | 更新协议状态 |
| Staking Router | 管理质押模块和运营商 | 分配存款 |
| Withdrawal Queue | 记录提款请求、最终确定、领取 | ETH |
| 治理 / Dual Governance | 改参数、模块、费用 | 协议控制 |
| wstETH | 包装 stETH，份额不 rebase | 可组合的 ERC-20 |

资产流：

```text
用户 ──deposit ETH──> Lido ──> 验证者存款合约 ──> beacon chain
用户 <──stETH──
stETH ──wrap──> wstETH
用户 ──requestWithdrawals──> 队列 ──Oracle finalize──> 领取 ETH
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| stETH | Lido 合约 | `totalShares`、`totalPooledEther`、用户 shares |
| wstETH | 包装合约 | `stETHPerToken`、用户余额 |
| Validators | Beacon chain | 验证者余额、状态、运营商 |
| Oracle 报告 | AccountingOracle | 报告 epoch、CL balance、EL rewards、提款 |
| Withdrawal Queue | 队列合约 | 请求 id、amount、finalization 状态 |
| Staking Router | 模块注册表 | 模块权重、运营商、费用 |

stETH 的余额是 **shares × 每 share 的 ETH**，不是固定数量；转账/集成时要按 shares 计算，不能把某个时刻的余额当常量。

## 3. 关键机制 {#mechanism}

### 3.1 stETH 与 wstETH

- stETH 是 rebasing token：奖励/惩罚会改变所有持有者的余额。
- wstETH 把 stETH 包装成不 rebase 的 ERC-20，余额不变，但 `stETHPerToken` 会变。
- DeFi 集成通常用 wstETH，避免 rebasing 破坏记账；读价值时要乘 `stETHPerToken`。

### 3.2 Oracle 报告：每天一次的对账

Lido 的 AccountingOracle 由委员会提交报告：

- 报告 beacon chain 验证者余额、执行层奖励、提款和协议费用。
- 委员会成员对报告哈希达成共识；达到阈值后提交。
- 报告会更新 `totalPooledEther`、shares 价值、提款队列的最终化。

信任点：委员会成员、阈值（历史上 5/9，具体以链上 `HashConsensus` 为准）、报告频率和治理。**Oracle 报告是 stETH 价值的上游输入**；报告错误会直接反映到份额价格。

### 3.3 提款队列：请求、最终确定、领取

- 用户请求提款，stETH 被锁定，生成队列请求。
- 只有当协议有足够的 ETH（验证者退出/缓冲）且 Oracle 报告最终确定后，请求才能领取。
- 队列按顺序处理；拥堵时等待时间会变长。
- wstETH 也可以直接请求提款，合约会先 unwrap。

提款不是“随时 1:1 即时赎回”；**流动性取决于队列和协议可用 ETH**。

### 3.4 Staking Router 与节点运营商

Staking Router 把存款分配给不同质押模块（Curated、Simple DVT 等），每个模块有运营商和费用参数。模块权重、运营商质量和治理决定验证者风险。

### 3.5 Dual Governance

Lido 的 Dual Governance 让 stETH 持有者可以对治理提案进行 veto/延迟，降低治理被快速捕获的风险。具体流程和阈值以链上合约/文档为准。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| 核心合约 | [`lidofinance/lido-dao`](https://github.com/lidofinance/lido-dao)（`v4.1.0`，HEAD `2bd532298d85cdf520169fdc0c5fb0cc9baf03c3`） |
| WithdrawalQueue | [`contracts/0.8.9/WithdrawalQueue.sol`](https://github.com/lidofinance/lido-dao/blob/HEAD/contracts/0.8.9/WithdrawalQueue.sol) |
| Oracle | 以仓库 `contracts/*/oracle/` 与链上 `HashConsensus` 为准 |
| Lido Oracle 服务 | [`lidofinance/lido-oracle`](https://github.com/lidofinance/lido-oracle)（HEAD `7d772da0c5a05c284490a5e0962ae40b38d768ed`） |
| 链上地址 | 以 Lido 官方文档/地址页和 Etherscan 为准 |

> **证据边界：** 本文核对的是 `lido-dao` v4.1.0 的合约结构与公开机制，没有运行节点、没有复现 Oracle 报告或提款流程。委员会阈值、费率、模块权重和队列状态以链上为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 验证者惩罚/离线 | slashing、停机、运营商故障 | 验证者状态、Oracle 报告、运营商 |
| Oracle 错误/延迟 | 委员会故障、报告错误、共识失败 | 报告 epoch、成员、阈值 |
| 提款拥堵 | 验证者退出慢、队列积压 | 队列长度、可用 ETH、finalization |
| stETH 脱锚 | 市场恐慌、流动性不足 | 二级市场价格、Curve 池深度 |
| 治理捕获 | 提案快速通过、管理员权限 | Dual Governance、时间锁、投票 |
| 合约升级 | 代理/实现变更 | proxy admin、治理记录 |
| 模块风险 | 新模块/运营商质量 | Staking Router 权重、审计 |
| wstETH 定价 | `stETHPerToken` 误读、rebase 记账 | 包装合约、汇率 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 确认持有的是 stETH 还是 wstETH，两者记账方式不同。
- [ ] 读 `totalShares` / `totalPooledEther`，按 shares 计算实际 ETH 价值。
- [ ] 查最近 Oracle 报告的 epoch、时间、委员会和是否最终确定。
- [ ] 提款：读队列请求、finalization 状态、可用 ETH 和预计等待。
- [ ] 查验证者/运营商状态和 Staking Router 模块权重。
- [ ] 评估 stETH 二级市场价格与 Curve/其他池深度。
- [ ] 查治理/Dual Governance 流程、时间锁和管理员。
- [ ] 不把 stETH 市价直接当成 1 ETH 赎回价值。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Pendle](./pendle.md)：stETH 等生息资产如何被拆成 PT/YT
- [Curve](./curve.md)：stETH/ETH 池与脱锚交易
- [Aave](./aave.md)：LST 作为抵押品的风险

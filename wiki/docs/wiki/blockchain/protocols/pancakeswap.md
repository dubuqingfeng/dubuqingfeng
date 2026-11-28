---
title: "PancakeSwap：V2、V3 与 Infinity 的定价分层"
slug: "/Wiki/blockchain/protocols/pancakeswap"
description: "对比 PancakeSwap V2 恒定乘积、V3 集中流动性与 Infinity 单例 Vault/hooks 架构，并给出源码入口、失败模式与检查清单。"
---

# PancakeSwap：V2、V3 与 Infinity 的定价分层

> **一句话：** PancakeSwap 不是“一个 DEX”，而是三代不同结算模型：V2 的 Pair 恒定乘积、V3 的集中流动性 NFT 仓位、Infinity 的 singleton Vault + CL/Bin 池 + hooks。

读 PancakeSwap 最常见的错误，是把 V2 的 `x*y=k` 直接套到 V3 的 tick 流动性，或者把 Infinity 的 hook 当成普通 periphery。**先确认版本，再谈价格和风险。**

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 交易者 | 指定输入/输出、滑点、路径 | 扣除手续费后的输出资产 |
| LP | 向池子注入两种资产 | V2 LP token；V3 NFT 仓位；Infinity 仓位/份额 |
| Router / SmartRouter | 找路径、拆单、回调付款 | 不托管资金，负责编排 |
| Factory | 创建池、登记 fee tier | 池地址与事件 |
| Infinity Vault | 统一托管所有池的资产 | flash accounting 的结算中心 |
| Hook（Infinity） | 在 swap/liquidity 前后插入逻辑 | 可改变费用、限价、激励等 |
| 治理 / 农场 | 调 fee、排放、池白名单 | 参数与激励风险 |

## 2. 核心状态 {#state}

| 版本 | 状态模型 | 关键字段 |
| --- | --- | --- |
| V2 | 每个交易对一个 Pair | `reserve0/1`、`totalSupply`、LP 余额 |
| V3 | 每个池一套 tick/position | `sqrtPriceX96`、`tick`、`liquidity`、`ticks`、`positions`、fee growth |
| Infinity | 单例 PoolManager + Vault | `PoolKey`、`PoolId`、CL/bin 状态、Vault 储备、ERC-6909 claims、hook 权限 |

V3 与 Infinity 的仓位是“区间”而不是“池子份额”：同一个池里，不同 LP 可能只在某个价格区间提供流动性，所以 **池级 TVL 不能直接代表某个价格点的深度**。

## 3. 关键机制 {#mechanism}

### 3.1 V2：恒定乘积与 LP 份额

V2 沿用 `x*y=k`：

```text
amountOut = (amountIn * feeNumerator * reserveOut)
            / (reserveIn * feeDenominator + amountIn * feeNumerator)
```

- 交易费固定（PancakeSwap V2 为 0.25%，具体分配以文档/合约参数为准）。
- LP token 代表池子份额；加入/退出按储备比例结算。
- 价格完全由储备比例决定，没有 tick、没有区间。

### 3.2 V3：集中流动性与 fee tier

PancakeSwap V3 的 Factory 初始化了四档费率（源码 `PancakeV3Factory.sol`）：

| fee | 百分比 | tickSpacing |
| --- | --- | --- |
| 100 | 0.01% | 1 |
| 500 | 0.05% | 10 |
| 2500 | 0.25% | 50 |
| 10000 | 1% | 200 |

机制与 Uniswap V3 同类：

- 价格用 `sqrtPriceX96` 表示，流动性分布在 tick 区间。
- Swap 跨 tick 时逐段计算，可能改变当前 tick 和活跃流动性。
- LP 仓位是 NFT，包含区间、手续费增长等状态。
- 池子可提供 TWAP oracle，但**不是自动安全的价格源**，依赖观察窗口和操纵成本。

### 3.3 Infinity：singleton、Vault 与 hooks

Infinity 把“每个池一个合约”改成“一个 PoolManager + 一个 Vault”：

- `CLPoolManager` 管理集中流动性池，`BinPoolManager` 管理 bin 池（类似离散价格档位）。
- 所有资产集中在 `Vault`，swap 通过 flash accounting 记录 delta，交易结束再结算。
- `IHooks` / `ICLHooks` / `IBinHooks` 允许在关键生命周期插入逻辑：before/after initialize、add/remove liquidity、swap、donate 等。
- hook 可以改变费用、拒绝交易、限制地址、引入额外状态；**hook 代码是池安全模型的一部分**。

Infinity 的“单例 + hook”提高了资本效率和可组合性，但也把风险从“池合约”扩展到“hook 合约 + Vault 结算”。

### 3.4 路由与回调

V2/V3 的 swap 通常通过 Router 回调付款：池子先算出输出，再回调 `pancakeCall` 要求付款，最后校验余额。回调没付款或付款不足会回滚。Infinity 则用 Vault 的 lock/settle/take 流程完成同一件事。

读交易时，**不要把“Router 调用成功”当成“池子结算成功”**；要看池子事件、余额变化和回调是否满足。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| V3 合约 | [`pancakeswap/pancake-v3-contracts`](https://github.com/pancakeswap/pancake-v3-contracts)（HEAD `986847948755cba528324d41be19480731c36c2a`） |
| V3 Factory | [`PancakeV3Factory.sol`](https://github.com/pancakeswap/pancake-v3-contracts/blob/HEAD/projects/v3-core/contracts/PancakeV3Factory.sol) |
| Infinity Core | [`pancakeswap/infinity-core`](https://github.com/pancakeswap/infinity-core)（HEAD `3c5ef1be1f71442d8bc60cc6fd11f9c677b714df`） |
| Infinity Vault | [`src/Vault.sol`](https://github.com/pancakeswap/infinity-core/blob/HEAD/src/Vault.sol) |
| Infinity hooks 接口 | [`src/interfaces/IHooks.sol`](https://github.com/pancakeswap/infinity-core/blob/HEAD/src/interfaces/IHooks.sol) |
| 链上地址 | 以 PancakeSwap 官方部署页和 BscScan/Etherscan 为准；不同链版本不同 |

> **证据边界：** 本文核对的是上述仓库 HEAD 的源码结构，没有部署或复现主网池。V2 的费率分配、V3 的已启用 fee tier、Infinity 的 hook 白名单都可能随治理/部署变化，读链上为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 版本混用 | 用 V2 公式算 V3/Infinity 价格 | 池类型、PoolKey、fee tier |
| 无常损失 | 价格偏离区间/储备比例 | 仓位区间、历史价格、LP 收益 |
| Tick/bin 操纵 | 薄池里推价格、吃 TWAP | 活跃流动性、观察窗口、操纵成本 |
| Hook 风险 | 恶意/错误 hook 拒绝交易、改费用、盗取授权 | hook 地址、权限位、是否可升级 |
| Vault 结算 | flash accounting delta 未平、回调失败 | lock/settle/take 事件、余额 |
| 路由/滑点 | 路径过长、拆单失败、MEV | 路径、最小输出、实际成交 |
| 费用 tier 选择 | 高波动对用低费池，LP 被套利 | fee、tickSpacing、成交量 |
| 农场/排放 | 激励结束、池子迁移 | 排放计划、gauge 权重 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认是 V2、V3 还是 Infinity，并记录链和合约地址。
- [ ] V2：读 reserves、LP 总量、费率；用恒定乘积复算输出。
- [ ] V3：读 `slot0`、`liquidity`、目标 tick 附近的流动性，不要只看池级 TVL。
- [ ] Infinity：读 `PoolKey`（含 hooks）、PoolId、Vault 储备和 hook 权限。
- [ ] 对 hook 池，单独审 hook 源码、权限和是否可升级。
- [ ] 检查 Router 路径、最小输出、deadline 和实际回调付款。
- [ ] 用小额交易或 `eth_call` 模拟，比较报价与真实余额变化。
- [ ] 把 LP 收益拆成手续费、排放和价格风险，不把 APR 当净收益。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Uniswap V4](./uniswap-v4.md)：同样的 singleton/hooks 思路，对比实现差异
- [four.meme](./four-meme.md)：毕业后把流动性迁到 PancakeSwap 的发射台
- [Raydium](./raydium.md)：Solana 上的 AMM/CLMM 对照

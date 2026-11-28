---
title: "Uniswap V4：singleton、hooks 与 flash accounting"
slug: "/Wiki/blockchain/protocols/uniswap-v4"
description: "拆解 Uniswap V4 的 PoolKey、hook 权限、EIP-1153 flash accounting 与 ERC-6909 claims，并说明 hook 如何进入池子的安全模型。"
---

# Uniswap V4：singleton、hooks 与 flash accounting

> **一句话：** V4 把“每个池一个合约”改成“一个 PoolManager 管所有池”，用 `PoolKey` 标识池子、用 hooks 插入自定义逻辑、用 transient storage 做 flash accounting，从而把 swap 的结算推迟到交易结束。

这不是“V3 加几个功能”，而是结算架构的变化：**池子是 PoolManager 里的一个 key，资产在 Vault 里统一记账，hook 可以在关键生命周期改变行为。**

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 交易者 | 调用 swap，指定 PoolKey 和 hook 数据 | 输出资产，结算 delta |
| LP | 在 tick 区间提供流动性 | Position（NFT/仓位） |
| PoolManager | 管理所有池、记账、调用 hook | 池状态与 delta |
| Hook | 在 initialize/add/remove/swap/donate 前后插入逻辑 | 可改费用、拒绝交易、返回 delta |
| PositionManager / Router | 组装交易、管理仓位、回调结算 | 不托管池子资产 |
| 协议/治理 | 设 protocol fee、升级 periphery（core 不可升级） | 参数权限 |

资产流：

```text
用户 ──swap──> PoolManager ──调用 hook──> 池状态更新
                     │
                     └── flash accounting：记录 currency delta
交易结束 ──settle/take──> Vault 实际转账 / ERC-6909 claims
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| PoolKey | 调用参数/事件 | `currency0`、`currency1`、`fee`、`tickSpacing`、`hooks` |
| PoolId | `keccak256(PoolKey)` | 池的唯一标识 |
| Pool.State | PoolManager | `sqrtPriceX96`、`tick`、`liquidity`、fee growth、protocol fee |
| Position | PositionManager | tick 区间、流动性、手续费 |
| Delta | transient storage | 交易内各 currency 的应付/应收 |
| Claims | ERC-6909 | 非原生资产的内部余额凭证 |

`PoolKey` 里的 `fee` 最高位为 1 表示动态费用（必须等于 `0x800000`），此时实际费率由 hook 决定。**同一个交易对，不同 fee/tickSpacing/hooks 就是不同池。**

## 3. 关键机制 {#mechanism}

### 3.1 Singleton：一个 PoolManager 管所有池

- 所有池的状态集中在 PoolManager，创建池只是初始化一个 PoolId。
- 好处：多池 swap 可以在一个交易内完成，gas 更低，结算统一。
- 代价：PoolManager 是不可升级的核心合约，任何 core 级 bug 影响所有池；hook 的风险也会传导到使用它的池。

### 3.2 Hooks：权限位决定能做什么

Hook 地址的低 14 位是权限位（源码 `Hooks.sol`）：

- `beforeInitialize` / `afterInitialize`
- `beforeAddLiquidity` / `afterAddLiquidity`
- `beforeRemoveLiquidity` / `afterRemoveLiquidity`
- `beforeSwap` / `afterSwap`
- `beforeDonate` / `afterDonate`
- 以及 `beforeSwapReturnsDelta` / `afterSwapReturnsDelta` 等“可返回 delta”的权限。

hook 可以做：动态费用、限价单、TWAP、KYC/白名单、MEV 捕获、流动性激励、拒绝交易等。**读一个 V4 池，必须同时读它的 hook 源码和权限。**

### 3.3 Flash accounting 与 EIP-1153

V4 用 transient storage 记录交易内的 currency delta：

- swap 过程中不立即转账，只更新“谁欠谁多少”。
- 交易结束前必须 `settle`（付清）或 `take`（取出），否则回滚。
- 非原生资产可以用 ERC-6909 claims 表示内部余额，减少 ERC-20 转账。

这让多跳/多池 swap 更高效，但也意味着**“调用成功”不等于“资产已转手”**；要看结算是否完成。

### 3.4 动态费用、donate 与 protocol fee

- 动态费用池的 `fee` 由 hook 在 swap 时决定，可能随波动/时间变化。
- `donate` 允许向池子捐赠，直接增加 LP 的手续费收益，不改变价格。
- protocol fee 由治理设置，从 LP 费用中抽取；不同池/链可能不同。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| v4-core | [`Uniswap/v4-core`](https://github.com/Uniswap/v4-core/tree/v4.0.0)（`v4.0.0`，提交 [`e50237c4`](https://github.com/Uniswap/v4-core/commit/e50237c43811bd9b526eff40f26772152a42daba)） |
| PoolKey | [`src/types/PoolKey.sol`](https://github.com/Uniswap/v4-core/blob/v4.0.0/src/types/PoolKey.sol) |
| Hook 权限 | [`src/libraries/Hooks.sol`](https://github.com/Uniswap/v4-core/blob/v4.0.0/src/libraries/Hooks.sol) |
| v4-periphery | [`Uniswap/v4-periphery`](https://github.com/Uniswap/v4-periphery)（HEAD `c6e4754dab11bd38c6f08ac51c3c868569e93d64`） |
| 链上地址 | 以 Uniswap 官方部署页和区块浏览器为准；不同链不同 |

> **证据边界：** 本文核对的是 `v4.0.0` 标签的 core 源码与 periphery HEAD，没有部署、复现或审计任何 hook。hook 是第三方代码，不能因为“用了 Uniswap V4”就默认安全。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 恶意/错误 hook | 拒绝交易、改费用、盗取授权、返回异常 delta | hook 地址、权限位、源码、是否可升级 |
| 动态费用 | 费率突变、LP 被套利 | `fee` 最高位、hook 逻辑、历史费率 |
| 结算未完成 | delta 未平、settle/take 失败 | 交易内 delta、Vault 余额 |
| PoolKey 混淆 | 同 pair 不同 fee/hook | PoolId、PoolKey 全字段 |
| Tick 操纵 | 薄池推价格、TWAP 被吃 | 活跃流动性、观察窗口 |
| 原生 ETH | 发送/接收 ETH 的 hook 处理错误 | `currency0/1` 是否为原生、receive 逻辑 |
| 核心不可升级 | core bug 影响所有池 | 版本、审计、治理 |
| 协议费/治理 | protocol fee 变化 | 治理提案、PoolManager owner |

## 6. 读数据与检查清单 {#checklist}

- [ ] 用完整 `PoolKey`（含 hooks）定位池子，不只看 token pair。
- [ ] 读 PoolId、`slot0`、liquidity、当前 tick 和目标区间流动性。
- [ ] 单独审 hook：权限位、源码、是否可升级、是否有特权地址。
- [ ] 确认是静态费用还是动态费用，实际费率由谁决定。
- [ ] 检查交易内 delta 是否在结束前 settle/take。
- [ ] 区分原生 ETH 与 ERC-20，确认 receive/transfer 路径。
- [ ] 对 LP，计算区间外风险、手续费和 hook 激励。
- [ ] 不把“Uniswap V4”当成安全背书；hook 池的风险由 hook + core 共同决定。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [PancakeSwap](./pancakeswap.md)：Infinity 的 singleton/hooks 对照
- [Uniswap V3 跨 Tick Swap](../defi/uniswap/v3-swap.md)：集中流动性的基础
- [Curve](./curve.md)：另一种稳定资产定价曲线

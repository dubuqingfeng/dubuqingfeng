---
title: "Curve：StableSwap 与 crvUSD 的软清算"
slug: "/Wiki/blockchain/protocols/curve"
description: "拆解 StableSwap 的放大不变量、crvUSD 的 LLAMMA 分带做市与软清算，以及 PegKeeper/货币政策如何影响锚定。"
---

# Curve：StableSwap 与 crvUSD 的软清算

> **一句话：** Curve 有两条主线：StableSwap 用“放大不变量 + 低滑点”给稳定资产定价；crvUSD 用 LLAMMA 把抵押品放进价格分带，价格下跌时逐步把抵押品换成 crvUSD（软清算），而不是一次性清算。

读 Curve 要区分：**StableSwap 是交易曲线，LLAMMA 是借贷/清算曲线。** 两者都叫 AMM，但解决的问题不同。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| StableSwap 交易者 | 在稳定资产池互换 | 低滑点输出 + 手续费 |
| StableSwap LP | 注入稳定资产 | LP token + 手续费/CRV 排放 |
| crvUSD 借款人 | 抵押资产，铸造 crvUSD | 债务（crvUSD） |
| LLAMMA | 分带持有抵押品/crvUSD，随价格转换 | 软清算结果 |
| PegKeeper | 在锚定附近 mint/burn crvUSD | 稳定费/套利 |
| 货币政策 | 根据锚定设置利率 | 借款利率 |
| 治理 | 参数、池、排放、管理员 | 协议控制 |

资产流（crvUSD）：

```text
借款人 ──deposit collateral──> LLAMMA ──mint──> crvUSD 给借款人
价格下跌 ──LLAMMA 把 collateral 换成 crvUSD──> 债务被部分偿还
价格回升 ──LLAMMA 把 crvUSD 换回 collateral
价格跌破所有 band ──> 硬清算
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| StableSwap 池 | Pool 合约 | `A`、balances、fee、LP supply、admin fee |
| crvUSD Controller | `controller.vy` | 用户 collateral/debt、健康度、AMM 地址、oracle |
| LLAMMA | `AMM.vy` | band 数量、每带价格/流动性、collateral/crvUSD 余额、active band |
| Stablecoin | `Stablecoin.vy` | crvUSD 总量、minter 权限 |
| PegKeeper | PegKeeper 合约 | 锚定价格、池子、债务 |
| 货币政策 | `mpolicies/*.vy` | 利率曲线、锚定偏差 |

## 3. 关键机制 {#mechanism}

### 3.1 StableSwap：放大不变量

StableSwap 在恒定和与恒定乘积之间插值：

```text
A · n^n · Σx_i + D = A · D · n^n + D^(n+1) / (n^n · Πx_i)
```

其中 `A` 是放大系数、`n` 是资产数量、`D` 是不变量。不同池子实现（plain/meta/factory）可能有等价变形。

- `A` 越大，曲线越接近恒定和，稳定资产之间滑点越低。
- `A` 越小，越接近恒定乘积，脱锚时保护 LP。
- 交易费、admin fee 和池子类型（plain pool、meta pool、factory pool）会影响实际成本。

StableSwap 适合“应该等值”的资产；如果资产真的脱锚，低滑点曲线会让套利者把池子抽干，`A` 和池子参数是风险控制的一部分。

### 3.2 LLAMMA：分带与软清算

crvUSD 的抵押品不是放在一个清算线，而是放进一组价格 band：

- 每个 band 有自己的价格区间和 collateral/crvUSD 组合。
- 价格下跌时，LLAMMA 在 band 内把 collateral 逐步卖成 crvUSD，用于偿还债务（软清算）。
- 价格回升时，LLAMMA 再把 crvUSD 买回 collateral。
- 如果价格跌破所有 band，才进入硬清算。

软清算的好处是避免一次性砸盘；代价是**借款人会承受“卖了又买回”的路径损失**，且极端行情下仍可能资不抵债。

### 3.3 PegKeeper 与货币政策

- PegKeeper 在 crvUSD 高于/低于锚定时，通过 mint/burn 和池子交易把价格拉回。
- 货币政策根据锚定偏差调整借款利率：脱锚时提高利率，抑制借款、鼓励还款。
- 这些机制依赖池子流动性、预言机和治理参数；不是无限兜底。

### 3.4 预言机与多链

crvUSD 的 Controller 使用价格预言机（Curve 池 TWAP、aggregate price、EMA 等）。不同市场的 oracle 组合不同；多链部署还要考虑桥接资产和链间价格差。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| crvUSD / Llamalend | [`curvefi/curve-stablecoin`](https://github.com/curvefi/curve-stablecoin)（HEAD `53f36d00c0f6938bb8c0cf6c746ba51c2e5e8b2c`） |
| LLAMMA | [`curve_stablecoin/AMM.vy`](https://github.com/curvefi/curve-stablecoin/blob/HEAD/curve_stablecoin/AMM.vy) |
| Controller | [`curve_stablecoin/controller.vy`](https://github.com/curvefi/curve-stablecoin/blob/HEAD/curve_stablecoin/controller.vy) |
| 货币政策 | [`curve_stablecoin/mpolicies/`](https://github.com/curvefi/curve-stablecoin/tree/HEAD/curve_stablecoin/mpolicies) |
| StableSwap | [`curvefi/curve-contract`](https://github.com/curvefi/curve-contract)（HEAD `574f44027d089de0eac765f5a74ea5ae96aba968`） |
| 链上地址 | 以 Curve 官方文档/地址页和区块浏览器为准；不同链不同 |

> **证据边界：** 本文核对的是仓库 HEAD 的合约结构，没有部署、复现或模拟 LLAMMA 的清算路径。`A`、band 参数、oracle 和货币政策会随治理/市场变化，读链上为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 稳定资产脱锚 | 发行方违约、桥风险、市场恐慌 | 池子余额、价格、`A`、脱锚历史 |
| 软清算路径损失 | 价格反复、band 内买卖 | band 参数、历史成交、借款人 health |
| 硬清算 | 价格跌破所有 band | active band、collateral、债务 |
| Oracle 操纵/延迟 | 薄池 TWAP、EMA 滞后 | oracle 源、窗口、操纵成本 |
| 货币政策 | 利率调整过慢/过猛 | 锚定偏差、利率、借款需求 |
| PegKeeper 流动性 | 池子深度不足、债务上限 | PegKeeper 余额、池子深度 |
| 治理/管理员 | 改参数、暂停、升级 | owner/admin、治理提案 |
| 多链/桥 | 桥接资产脱锚、链间价差 | 链、桥、资产来源 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认是 StableSwap 池还是 crvUSD 市场，两者定价逻辑不同。
- [ ] StableSwap：读 `A`、balances、fee、LP 总量和资产类型。
- [ ] crvUSD：读 Controller 的 collateral/debt、health、oracle 和 AMM 地址。
- [ ] LLAMMA：读 band 数量、active band、各带 collateral/crvUSD 和价格区间。
- [ ] 模拟价格下跌/回升，计算软清算路径损失和硬清算点。
- [ ] 查 oracle 类型、TWAP 窗口和操纵成本。
- [ ] 查 PegKeeper 余额、货币政策利率和治理权限。
- [ ] 多链资产要单独评估桥和发行方风险。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave](./aave.md)、[Morpho](./morpho.md)：传统清算线 vs 软清算
- [Uniswap V4](./uniswap-v4.md)：集中流动性与 hook 架构
- [Lido](./lido.md)：stETH 作为抵押/交易资产的脱锚风险

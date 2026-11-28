---
title: "Morpho：不可变市场原语与 MetaMorpho 金库"
slug: "/Wiki/blockchain/protocols/morpho"
description: "拆解 Morpho Blue 的市场参数、份额会计、LLTV/LIF 清算，以及 MetaMorpho 的 curator/allocator 角色与风险分层。"
---

# Morpho：不可变市场原语与 MetaMorpho 金库

> **一句话：** Morpho Blue 把借贷压缩成一个不可变的 singleton：每个市场只由 `loanToken / collateralToken / oracle / IRM / LLTV` 五个参数定义；MetaMorpho 则在它上面叠一层 ERC-4626 金库，把“选市场、配额度”的工作交给 curator/allocator。

这套设计的核心是**把风险参数的选择权下放**：协议本身不决定哪个抵押品好，创建者/金库管理者决定；代价是用户必须自己判断 oracle、LLTV 和 curator。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 存款人 | 向某个市场供应 loan token | supply shares |
| 借款人 | 抵押 collateral，借出 loan token | borrow shares + 债务 |
| 清算人 | 代还债务，折价拿走抵押品 | 清算奖励 |
| 市场创建者 | 选择五个参数创建市场 | 市场 ID 与后续费用（若被设） |
| Morpho owner | 启用 IRM/LLTV、设 fee/feeRecipient | 协议级参数权限 |
| MetaMorpho 存款人 | 存入 loan asset，获得 vault shares | 跨市场收益 |
| Curator / Allocator | 选市场、设 supply cap、调配额度 | 管理费/绩效费（按金库规则） |

资产流：

```text
存款人 ──supply──> Morpho 市场 ──> 借款人
借款人 ──repay──> 市场 ──> 存款人（按 shares 分利息）
清算人 ──repay──> 市场 ──seize collateral──> 清算人
MetaMorpho 存款人 ──deposit──> Vault ──allocate──> 多个 Morpho 市场
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| MarketParams | `idToMarketParams` | `loanToken`、`collateralToken`、`oracle`、`irm`、`lltv` |
| Market | `market[Id]` | `totalSupplyAssets/Shares`、`totalBorrowAssets/Shares`、`lastUpdate`、`fee` |
| Position | `position[Id][user]` | `supplyShares`、`borrowShares`、`collateral` |
| 授权 | `isAuthorized` | 可代用户操作的地址 |
| MetaMorpho Vault | ERC-4626 | `totalAssets`、`totalSupply`、`supplyCap`、`market` 列表、roles |
| Oracle | 外部合约 | 价格与 `ORACLE_PRICE_SCALE = 1e36` |

市场 ID 是 `keccak256(abi.encode(MarketParams))`；**改任何一个参数都是另一个市场**，不要把同一对 token 的不同 LLTV 市场混在一起。

## 3. 关键机制 {#mechanism}

### 3.1 份额会计与利息

Morpho 用 shares 而不是逐用户余额：

```text
supplyShares = assets * totalSupplyShares / totalSupplyAssets
borrowShares = assets * totalBorrowShares / totalBorrowAssets
```

利息通过 `totalBorrowAssets` 增长、并可按 `fee` 抽成给 `feeRecipient`。读余额时要先看 `lastUpdate` 和当前 totals；`market` 里的 totals **不包含**自上次计息以来的新增利息。

### 3.2 LLTV、清算与 LIF

每个市场的 `lltv` 是清算阈值（不是借款 LTV 的单独参数；Morpho 用同一个 LLTV 约束借款和清算）。清算激励因子：

```text
LIF = min(1.15, 1 / (1 - 0.3 * (1 - LLTV)))
```

源码常量：`LIQUIDATION_CURSOR = 0.3e18`、`MAX_LIQUIDATION_INCENTIVE_FACTOR = 1.15e18`。LLTV 越高，LIF 越接近 1（清算激励越小）；LLTV 越低，激励越大但上限 1.15。

清算时，清算人可选择偿还部分或全部债务，但清算后仓位必须满足 LLTV；可 seize 的抵押品由 oracle 价格和 LIF 决定。**oracle 价格和 LLTV 直接决定清算是否有利可图。**

### 3.3 不可变性 vs owner 权限

Morpho Blue 的核心市场逻辑不可升级，但 `owner` 仍可以：

- 启用 IRM 和 LLTV（源码注释：可以启用，但不能禁用已启用的项）。
- 设置市场 `fee`（上限 25%）和 `feeRecipient`。
- 转移 owner。

因此“immutable”指的是**合约逻辑不可改**，不是“没有任何参数权限”。读风险时要同时看 owner 和 fee。

### 3.4 MetaMorpho：把选择权交给 curator

MetaMorpho 是 ERC-4626 金库：

- 一个金库对应一个 loan asset，可启用最多 30 个 Morpho 市场。
- 每个市场有 supply cap，默认 0；allocator 在限额内调配。
- 角色：owner、curator、guardian、allocator；owner 可设最高 50% 的 performance fee。
- `Public Allocator` 允许任何人在 owner 设定的限额内重新分配流动性。

这意味着存款人面对的是**两层风险**：底层 Morpho 市场的 oracle/LLTV/流动性，以及 curator 的选择与额度管理。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| Morpho Blue | [`morpho-org/morpho-blue`](https://github.com/morpho-org/morpho-blue)（HEAD `f8631a27a2ee76ccd63abb945014d31d9efb0aca`；`v1.0.0` 标签为 [`55d2d993`](https://github.com/morpho-org/morpho-blue/commit/55d2d99304fb3fb930c688462ae2ccabb1d533ad)） |
| 核心合约 | [`src/Morpho.sol`](https://github.com/morpho-org/morpho-blue/blob/HEAD/src/Morpho.sol) |
| 常量 | [`src/libraries/ConstantsLib.sol`](https://github.com/morpho-org/morpho-blue/blob/HEAD/src/libraries/ConstantsLib.sol) |
| MetaMorpho | [`morpho-org/metamorpho`](https://github.com/morpho-org/metamorpho)（HEAD `f25b5877fbeaf77ff52d113625bf7eec18127265`） |
| 链上地址 | 以 Morpho 官方部署页和 Etherscan 为准；不同链地址不同 |

> **证据边界：** 本文核对的是上述仓库 HEAD 的合约结构与常量，没有部署或复现主网市场。LLTV 白名单、fee、oracle 和 curator 参数都以链上为准；`v1.0.0` 标签与 HEAD 可能不同。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| Oracle 错误 | 价格源异常、延迟、可操纵 | oracle 地址、价格、更新频率、流动性 |
| LLTV 过高 | 抵押品波动大但阈值接近 1 | `lltv`、历史波动、清算深度 |
| 清算不足 | 抵押品无流动性、LIF 不够 | 清算事件、DEX 深度、坏账 |
| 市场碎片化 | 同一对 token 多个 LLTV 市场 | market ID、参数、TVL 分布 |
| Curator 风险 | 选错市场、额度集中 | vault 的 market 列表、supply cap、allocator |
| 费用 | performance fee、market fee | vault fee、`feeRecipient`、`fee` |
| 不可变≠无权限 | owner 启用 IRM/LLTV、设 fee | owner 地址、治理记录 |
| 预言机操控 | 薄池价格被推高后借款 | oracle 类型、TWAP、操纵成本 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 用 `MarketParams` 的五个字段定位市场，不只用 token pair。
- [ ] 读 `market[Id]` 的 totals、`lastUpdate`、`fee`，先确认利息是否已计提。
- [ ] 读 `position[Id][user]` 的 shares 和 collateral，换算成 assets。
- [ ] 核对 `lltv`、oracle 地址/价格、IRM 和 owner/feeRecipient。
- [ ] 清算前算 LIF、可偿还债务和实际抵押品数量。
- [ ] 对 MetaMorpho，读 market 列表、supply cap、roles 和 performance fee。
- [ ] 区分“合约不可升级”和“参数不可变”；owner 仍可改 fee/启用参数。
- [ ] 不把 vault 的 TVL 当成某个底层市场的可用流动性。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Aave](./aave.md)：池化借贷与 eMode/隔离模式的对照
- [Kamino](./kamino.md)：Solana 上的 reserve/obligation 借贷
- [Pendle](./pendle.md)：把收益资产拆成本金与收益的另一种账本

---
title: "Pendle：把收益拆成 PT 与 YT"
slug: "/Wiki/blockchain/protocols/pendle"
description: "拆解 Pendle 的 SY/PT/YT 结构、到期收敛、AMM 定价与费用，并区分本金、收益和底层协议风险。"
---

# Pendle：把收益拆成 PT 与 YT

> **一句话：** Pendle 把一个生息资产拆成两部分：**PT（本金）** 在到期时赎回本金，**YT（收益）** 收取到期前的收益；两者在 Pendle AMM 里各自定价，从而把“未来收益”变成可交易的资产。

理解 Pendle 的关键不是“又一个 DEX”，而是**同一份底层资产被拆成两种现金流**。PT 和 YT 的价格、风险和到期行为完全不同。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 存款人 / 收益交易者 | 存入生息资产，铸造 SY，再拆成 PT+YT | PT + YT |
| PT 买家 | 折价买入 PT，到期赎回本金 | 固定收益（隐含 APY） |
| YT 买家 | 买入 YT，收取到期前收益 | 浮动收益（杠杆化） |
| 流动性提供者 | 向 PT/SY 或 YT/SY 市场提供流动性 | LP 手续费 + 排放 |
| Pendle Router | 处理 mint/redeem/swap/zap | 不托管资金 |
| 底层协议 | 产生真实收益（质押、借贷、LST 等） | 收益来源与风险 |

资产流：

```text
生息资产 ──deposit──> SY ──split──> PT + YT
PT ──到期──> 本金（1:1 底层资产，按 SY 汇率）
YT ──到期前──> 收益；到期后归零
PT/YT <──swap──> Pendle AMM
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| SY | Standardized Yield 合约 | 底层资产、exchange rate、shares、收益来源 |
| PT | ERC-20 | 到期日、底层资产、1 PT 的可赎回量 |
| YT | ERC-20 | 到期日、收益索引、已领取收益 |
| Market | PendleMarket | PT/SY 或 YT/SY 储备、AMM 参数、到期日、fee、oracle/TWAP |
| Gauge | 激励合约 | LP 质押、排放权重 |
| Router | 路由合约 | mint/redeem/swap 的编排 |

PT 和 YT 是**成对铸造**的：1 份 SY 拆成 1 PT + 1 YT（按当时汇率/指数）；到期后 YT 不再产生收益，PT 可赎回本金。

## 3. 关键机制 {#mechanism}

### 3.1 SY：把不同收益源标准化

SY 是对底层生息资产的包装：

- 对 wstETH、sDAI、GLP 等不同资产，SY 提供统一的 `deposit`/`redeem`/`exchangeRate` 接口。
- SY 的 exchange rate 反映底层资产随时间累积的收益。
- PT/YT 的结算以 SY 为中间层，因此底层协议的风险会穿透到 PT/YT。

读 Pendle 时，先看 **SY 背后到底是什么**：是 LST、 lending 头寸、还是结构化产品？收益来源决定风险。

### 3.2 PT：折价买入，到期收敛到本金

- PT 在到期前以低于 1 的价格交易，折价对应“隐含 APY”。
- 随着到期临近，PT 价格向 1 收敛（假设没有底层损失）。
- 到期后 PT 可按协议规则赎回底层资产（通常按 1 PT 对应 1 单位底层资产；具体以 SY/PT 合约和到期汇率为准）。

PT 的主要风险是**底层资产违约/脱锚**和**到期流动性**，而不是短期价格波动。

### 3.3 YT：杠杆化收益与到期归零

- YT 代表到期前的收益权；买入 YT 相当于用较少本金放大收益。
- 如果底层收益率高于 YT 价格隐含的收益，YT 买家获利；反之亏损。
- 到期后 YT 价值归零，不能再收取收益。

YT 的风险更高：收益不及预期、底层收益暂停、到期前流动性差，都可能让 YT 大幅亏损。

### 3.4 AMM 与到期收敛

Pendle 的 AMM 不是普通恒定乘积：

- 市场围绕 PT/SY 或 YT/SY 定价，曲线会随到期日临近而调整。
- PT 价格向 1 收敛，YT 价格向 0 收敛；越接近到期，时间价值越小。
- 手续费、协议费和 LP 激励都会影响实际成交。

因此，**用 Uniswap 的 `x*y=k` 去复算 Pendle 价格会得到错误结果**；要读市场参数和到期日。

### 3.5 费用与激励

- Swap 有手续费（以市场参数为准），部分归 LP、部分归协议/vePENDLE。
- LP 可能获得 PENDLE 排放和其他 token 奖励。
- 提前退出、mint/redeem、zap 都可能产生额外费用或滑点。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| 核心合约 | [`pendle-finance/pendle-core-v2-public`](https://github.com/pendle-finance/pendle-core-v2-public)（HEAD `82e69f0b2279c85f250a87cb0fe16a2b432ebb72`） |
| Market | [`contracts/core/Market/PendleMarketV7.sol`](https://github.com/pendle-finance/pendle-core-v2-public/blob/HEAD/contracts/core/Market/PendleMarketV7.sol) |
| PT/YT | [`contracts/core/YieldContracts/`](https://github.com/pendle-finance/pendle-core-v2-public/tree/HEAD/contracts/core/YieldContracts) |
| SY | [`contracts/core/StandardizedYield/`](https://github.com/pendle-finance/pendle-core-v2-public/tree/HEAD/contracts/core/StandardizedYield) |
| 文档 | [Pendle Docs](https://docs.pendle.finance/) |
| 链上地址 | 以 Pendle 官方 app/文档和区块浏览器为准；不同链、不同市场不同 |

> **证据边界：** 本文核对的是仓库 HEAD 的合约目录与 Pendle 公开机制描述，没有部署、复现或计算某个市场的隐含 APY。费率、到期日、SY 底层和排放都会变，读链上市场参数为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| 底层协议风险 | LST 脱锚、借贷坏账、收益暂停 | SY 底层、协议状态、汇率 |
| 到期流动性 | 临近到期深度下降、退出拥挤 | 市场储备、LP 集中度、滑点 |
| YT 杠杆亏损 | 收益低于隐含、YT 价格下跌 | 隐含 APY、实际收益、到期日 |
| AMM 曲线误读 | 用恒定乘积复算价格 | 市场参数、TWAP、到期时间 |
| Oracle/TWAP | 价格被操纵、观察窗口不足 | oracle 源、窗口、操纵成本 |
| 费用/滑点 | mint/redeem/zap 路径复杂 | 实际收到数量、路由 |
| 合约升级 | 市场/工厂可升级 | proxy admin、实现地址 |
| 激励错配 | 排放结束、gauge 权重变化 | 排放计划、vePENDLE 投票 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认 SY 背后是什么资产、收益从哪里来。
- [ ] 读 PT/YT 的到期日、底层资产和兑换比率。
- [ ] 区分 PT 的“折价/隐含 APY”和 YT 的“杠杆收益”。
- [ ] 读市场储备、AMM 参数、fee 和 TWAP，不要套恒定乘积。
- [ ] 计算到期时 PT 的赎回量和 YT 的归零风险。
- [ ] 查底层协议状态（脱锚、坏账、暂停）和 SY 汇率。
- [ ] 对 LP，拆分手续费、排放和价格/到期风险。
- [ ] 核对合约是否可升级、admin 是谁。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Morpho](./morpho.md)：另一种“份额/收益”账本
- [Aave](./aave.md)：生息资产的来源之一
- [Lido](./lido.md)：stETH 作为 Pendle 底层资产的例子

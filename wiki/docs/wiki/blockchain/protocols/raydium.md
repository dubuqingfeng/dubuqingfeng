---
title: "Raydium：AMM、CLMM 与 LaunchLab 的三套流动性"
slug: "/Wiki/blockchain/protocols/raydium"
description: "拆解 Raydium AMM v4 的恒定乘积与 OpenBook 联动、CLMM 的 tick 仓位，以及 LaunchLab 的发射与迁移边界。"
---

# Raydium：AMM、CLMM 与 LaunchLab 的三套流动性

> **一句话：** Raydium 在 Solana 上同时提供三代流动性：AMM v4 的恒定乘积池（并与 OpenBook 订单簿共享流动性）、CLMM 的集中流动性区间，以及 LaunchLab 的发射曲线与毕业后迁移。

三者不是同一个池子的不同界面，而是**不同的程序、不同的账户、不同的定价方式**。分析前先确认池子属于哪一类。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 交易者 | 用输入 token 换输出 token | 扣除费用后的输出 |
| AMM LP | 按比例注入两种资产 | SPL LP token |
| CLMM LP | 在价格区间注入流动性 | Position NFT + 手续费/奖励 |
| LaunchLab 创建者 | 发行 token、设置曲线参数 | 发射进度与毕业后流动性 |
| OpenBook | 提供中央限价订单簿 | AMM 的限价单流动性 |
| 程序 admin | 创建池、调参数、暂停（以链上权限为准） | 治理/运维能力 |

资产流：

```text
AMM:      用户 ──swap──> Pool vaults ──> 用户；LP token 代表份额
CLMM:     用户 ──swap──> 跨 tick 的池子 ──> 用户；LP 持有 Position NFT
LaunchLab: 用户 ──buy/sell──> 曲线池 ──> 毕业后迁移到 AMM/CPMM
```

## 2. 核心状态 {#state}

| 类型 | 主要账户 | 关键字段 |
| --- | --- | --- |
| AMM v4 | `AmmInfo` + 两个 vault + LP mint + OpenBook market | `baseVault`、`quoteVault`、`lpMint`、`marketId`、`status`、费用参数 |
| CLMM | `PoolState` + tick arrays + position NFT | `sqrtPriceX96`、`tick`、`liquidity`、`tickSpacing`、fee growth、reward infos |
| LaunchLab | 曲线池/全局配置/毕业状态 | 曲线参数、进度、毕业阈值、迁移目标池 |
| OpenBook | market/bids/asks/event queue | 订单簿状态与成交 |

Solana 上“池子”不是一个合约里的 mapping，而是**一组账户**。读池子时要同时拿 vault 余额、池状态、LP/position 和（AMM v4）OpenBook market，否则容易把“池子 TVL”算错。

## 3. 关键机制 {#mechanism}

### 3.1 AMM v4：恒定乘积 + OpenBook 限价单

Raydium AMM v4 是恒定乘积池：

```text
x * y = k
amountOut = (amountIn * feeNumerator * reserveOut)
            / (reserveIn * feeDenominator + amountIn * feeNumerator)
```

它的特点是**把部分流动性以 Fibonacci 序列拆成 OpenBook 上的限价单**，让 AMM 和订单簿共享深度。因此：

- 成交可能来自池子，也可能来自 OpenBook 订单簿。
- OpenBook market 暂停/异常会影响 AMM 的流动性表现。
- 读价格时要区分“池子储备价格”和“订单簿最优价”。

AMM 的交易费以链上池参数为准（历史上约 0.25%，其中一部分用于 RAY 回购/财库）；不同池/版本可能不同。

### 3.2 CLMM：区间流动性与 tick array

Raydium CLMM（Amm v3）与 Uniswap V3 同类：

- 价格用 `sqrtPriceX96`，流动性分布在 tick 区间。
- Swap 跨 tick 时逐段计算，活跃流动性随价格移动。
- LP 仓位是 NFT，记录区间、手续费增长和奖励。
- tick array 是 Solana 上的分页账户，跨越多页时要加载多个账户。

CLMM 的资本效率更高，但**池级 TVL 不能代表当前价格附近的深度**；薄区间里的大额交易滑点可能远高于预期。

### 3.3 LaunchLab：曲线发射与毕业迁移

LaunchLab 把“发币 + 曲线定价 + 毕业后建池”做成流水线：

- 创建者部署 token 并选择曲线参数。
- 用户在曲线池买入/卖出，价格随进度变化。
- 达到毕业条件后，流动性迁移到 Raydium 的 AMM/CPMM 池。

需要核对的是：毕业阈值、迁移比例、LP 归属/锁定、迁移失败时的回退。**毕业前进度和毕业后 AMM 深度是两件事。**

### 3.4 费用与奖励

- AMM/CLMM 的 swap fee 进入池子，按 LP 份额/仓位分配。
- CLMM 可能额外有 reward emissions，按仓位和时间分配。
- LaunchLab 的交易费、迁移费、创建费以平台当前规则为准。

读收益时，把手续费、奖励和价格风险分开；高 APR 可能主要来自排放，而不是真实成交费。

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| AMM v4 | [`raydium-io/raydium-amm`](https://github.com/raydium-io/raydium-amm)（HEAD `9c54069c6bd86d52cd6622705b98c274ee33ba4a`）；主网程序 `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` |
| CLMM | [`raydium-io/raydium-clmm`](https://github.com/raydium-io/raydium-clmm)（HEAD `6d7a0f82d2f293c553c69aaf943377367c6c4cc6`）；主网程序 `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK` |
| LaunchLab | 以 [Raydium 文档](https://docs.raydium.io/) 和链上程序为准；未找到与生产逐字对应的公开核心仓库 |
| OpenBook | [`openbook-dex/program`](https://github.com/openbook-dex/program) |
| 链上账户 | 以 Raydium 官方 API/文档和 Solana 浏览器为准 |

> **证据边界：** 程序地址来自仓库 `declare_id!` 与 README；本文没有部署或复现主网池，也没有验证 LaunchLab 当前生产程序与公开代码的对应关系。费率和迁移规则会变，读链上参数为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| OpenBook 依赖 | market 暂停、订单簿异常 | `marketId`、订单簿状态、AMM 成交来源 |
| Tick 操纵 | 薄池推价格、吃 TWAP | 活跃流动性、tick array、操纵成本 |
| 区间外仓位 | 价格离开 LP 区间，只剩单边资产 | 仓位区间、当前 tick |
| 毕业迁移 | 曲线毕业失败、LP 未锁定 | 毕业事件、迁移目标池、LP 持有者 |
| 奖励错配 | 排放结束、reward 账户不足 | reward info、排放计划 |
| 管理员权限 | 创建/暂停/改参数 | admin/owner、治理记录 |
| 假池/仿盘 | 同名 token、非官方池 | 池地址、程序 ID、官方列表 |
| MEV/滑点 | 大额交易被夹 | 路由、最小输出、实际成交 |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认池类型：AMM v4、CLMM 还是 LaunchLab。
- [ ] 核对程序 ID、池地址、vault、LP mint/position NFT。
- [ ] AMM v4：读 reserves、OpenBook market、费用参数和池状态。
- [ ] CLMM：读 `sqrtPriceX96`、当前 tick、目标区间流动性和 tick array。
- [ ] LaunchLab：读曲线进度、毕业阈值、迁移目标和 LP 归属。
- [ ] 用小额模拟比较报价与真实余额变化。
- [ ] 把手续费、排放和价格风险分开计算 LP 收益。
- [ ] 不把池级 TVL 直接当成当前价格附近的可用深度。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Jupiter](./jupiter.md)：聚合器如何把 Raydium 池纳入路由
- [Meteora](./meteora.md)：另一种 Solana DLMM/bin 流动性
- [PancakeSwap](./pancakeswap.md)：EVM 上的 AMM/CLMM 对照

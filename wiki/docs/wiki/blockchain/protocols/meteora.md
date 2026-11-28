---
title: "Meteora DLMM：bin 流动性与动态费用"
slug: "/Wiki/blockchain/protocols/meteora"
description: "拆解 Meteora DLMM 的离散价格 bin、active bin、bin step、基础费与可变费，以及仓位和 swap 的边界。"
---

# Meteora DLMM：bin 流动性与动态费用

> **一句话：** Meteora DLMM 把价格切成离散的 bin，每个 bin 内按恒定和定价；swap 会把 active bin 推来推去，费用由基础费 + 随波动变化的可变费组成。

它和 Uniswap V3 的“连续 tick”不同：**DLMM 是离散价格档位**。这让做市策略更像“在价格网格上挂单”，也让“池级 TVL”更不代表当前价格附近的深度。

## 1. 角色与资产流 {#roles}

| 角色 | 做什么 | 拿到什么 |
| --- | --- | --- |
| 交易者 | 在 bin 之间 swap | 输出资产，扣除基础费+可变费 |
| LP | 在若干 bin 存入流动性 | Position（NFT/仓位），手续费 |
| Position owner | 调整区间、领取费用 | 仓位价值 |
| 协议 | 设 bin step、费用参数、激励 | 协议费/排放 |
| 聚合器 | 把 DLMM 纳入路由 | 成交 |

资产流：

```text
LP ──deposit──> bins ──> swap 在 bin 内/间移动
交易者 ──swap──> active bin 及相邻 bin ──> 输出
```

## 2. 核心状态 {#state}

| 状态 | 存在哪里 | 关键字段 |
| --- | --- | --- |
| LbPair | 池账户 | token mints、bin step、active bin、fee 参数、status |
| Bin | 每个价格档 | 价格、x/y 储备、流动性 |
| Position | 仓位账户/NFT | 区间、各 bin 的份额、fee owed |
| 费用 | 池/协议 | base fee、variable fee、protocol fee |
| 激励 | 农场/池 | reward 排放 |

DLMM 的“价格”不是单一 `sqrtPrice`，而是 **active bin + bin step**。读价格要先读 active bin，再按 bin step 换算。

## 3. 关键机制 {#mechanism}

### 3.1 Bin：离散价格与恒定和

每个 bin 是一个价格档位：

- bin 内用恒定和（`x + y = const`）定价，价格固定。
- bin 之间按 `bin step` 跳跃，`bin step` 通常以 basis points 表示。
- `bin step` 越小，价格越细、资金效率越高，但 bin 数量更多、gas/账户更多。
- `bin step` 越大，档位越粗，适合高波动资产。

Swap 会从 active bin 开始，吃掉当前 bin 的流动性，再移动到相邻 bin；大额交易可能跨很多 bin。

### 3.2 基础费 + 可变费

DLMM 的费用通常由两部分组成：

- **base fee**：固定的交易费。
- **variable fee**：根据市场波动/价格移动动态调整，波动大时更高，用于补偿 LP。

实际费率取决于池参数和当前状态；读报价时要看池子的 fee 配置，而不是套一个固定百分比。

### 3.3 Position：跨 bin 的流动性

LP 可以选择一个 bin 区间存入：

- 区间内每个 bin 分配流动性。
- 价格移动时，仓位可能变成单边资产（类似区间外）。
- 手续费按 bin/份额累积，领取时结算。
- 仓位可能是 NFT，便于转让/组合。

### 3.4 与 CLMM 的差异

| 维度 | DLMM | CLMM（如 Raydium CLMM） |
| --- | --- | --- |
| 价格 | 离散 bin | 连续 tick |
| bin/tick 内定价 | 恒定和 | 连续曲线 |
| 费用 | base + variable | fee tier + 可能的动态费 |
| 适合 | 网格/高波动做市 | 集中流动性做市 |
| 读深度 | 看相邻 bin | 看 tick 附近流动性 |

## 4. 源码与链上入口 {#source}

| 组件 | 入口 |
| --- | --- |
| DLMM SDK | [`MeteoraAg/dlmm-sdk`](https://github.com/MeteoraAg/dlmm-sdk)（HEAD `1532e540db41ac405dbf4c5bb2ddfceaa1f98ff1`） |
| 文档 | [Meteora DLMM](https://docs.meteora.ag/core-products/dlmm/what-is-dlmm) |
| 主网程序 | 以 Meteora 官方文档/地址页为准（常见 DLMM 程序地址以官方为准） |
| 链上账户 | 以 Meteora app/API 和 Solana 浏览器为准 |

> **证据边界：** 本文核对的是 `dlmm-sdk` HEAD 与 Meteora 文档目录，没有部署、复现或计算某个池的 bin 深度。`bin step`、费用参数、激励和程序地址会变，读链上池账户为准。

## 5. 失败模式 {#failures}

| 失败 | 触发方式 | 观察点 |
| --- | --- | --- |
| bin step 选择不当 | 太细导致 bin 多/gas 高，太粗导致滑点大 | `bin step`、bin 数量、波动 |
| 可变费飙升 | 波动大、费用参数敏感 | fee 配置、历史费率 |
| 区间外仓位 | 价格离开区间，只剩单边资产 | active bin、仓位区间 |
| 薄 bin 操纵 | 相邻 bin 流动性不足 | bin 储备、深度 |
| 聚合器路由 | 报价未考虑跨 bin 滑点 | 路由、实际成交 |
| 激励错配 | 排放结束、reward 不足 | reward 账户、排放计划 |
| 程序/账户复杂度 | 跨多 bin 交易 CU 高 | 账户数、CU、优先费 |
| 假池/仿盘 | 同名 token、非官方池 | 池地址、程序 ID |

## 6. 读数据与检查清单 {#checklist}

- [ ] 先确认池是 DLMM 还是 DAMM/其他 Meteora 产品。
- [ ] 读 `bin step`、active bin、池 status 和 fee 配置。
- [ ] 读 active bin 及相邻 bin 的储备，估算实际滑点。
- [ ] 对 LP，确认仓位区间、各 bin 份额和未领取费用。
- [ ] 比较 base fee + variable fee 与报价，不套固定费率。
- [ ] 检查激励账户/排放是否仍在发放。
- [ ] 大额交易模拟跨 bin 路径和 CU。
- [ ] 核对池地址与程序 ID，避免假池。

## 相关阅读 {#related}

- [协议分析索引](./README.md)
- [Raydium](./raydium.md)：CLMM 的连续 tick 对照
- [Jupiter](./jupiter.md)：DLMM 如何进入聚合路由
- [Kamino](./kamino.md)：Solana 借贷与流动性

---
id: "index"
slug: "/wiki/blockchain/defi/"
title: DeFi
description: 以交易、债务和仓位的状态变化选择源码阅读路线。
---

# DeFi

<span id="defi结算借款与永续仓位"></span>

同样是一次用户操作，Swap 改变池与代币余额，借款增加债务并检查账户风险，永续成交则改变仓位和费用记账。先明确要核对哪类状态，再选择专题。

| 阅读目标 | 前置与导读 | 源码主文 | 实验 |
| --- | --- | --- | --- |
| 交易价格、跨 tick 与付款结算 | [智能合约](../ethereum/contract/contract.md)、[Uniswap 版本路线](./uniswap/README.md) | [Uniswap V3 Swap](./uniswap/v3-swap.md) | [本地 EVM 与回调失败](./uniswap/v3-swap.md#experiment) |
| 债务、利息与健康因子 | [Aave 阅读路线](./aave/README.md) | [Aave V3 借款与风险](./aave/v3-borrow-health-factor.md) | [本地借款、风险失败与清算](./aave/v3-borrow-health-factor.md#experiment) |
| 成交、资金费与仓位风险 | [永续合约术语](./perps/README.md)、[Solana 账户基础](../solana/README.md) | [Drift 仓位生命周期](./perps/drift-position-lifecycle.md) | [原生 Rust 与事件复算](./perps/drift-position-lifecycle.md#reproduce) |

Aave 的借贷健康因子与永续合约保证金各有自己的账户与估值规则；Drift 的风险函数不能直接用于 Hyperliquid。需要研究签名、订单未知结果与连接恢复时，从 [Hyperliquid](../hyperliquid/README.md) 进入 SDK 与合成对账样板。

各篇提供固定版本、实际实验和未测边界，导读不将本地实现推广为当前生产部署。返回[区块链总导读](../README.md)选择其他问题。


## 本级目录 {#directory-index}

### 子目录 {#directory-children}

- [DeFi：Aave](./aave/README.md)
- [DeFi：Uniswap](./uniswap/README.md)
- [DeFi：永续合约](./perps/README.md)

返回[上一级：区块链](./../README.md)。

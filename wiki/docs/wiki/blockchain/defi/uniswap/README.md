---
id: "index"
slug: "/wiki/blockchain/defi/uniswap/"
title: Uniswap：从交易意图到池结算
description: 区分协议版本，进入 V3 跨 Tick Swap、回调付款和本地实验。
---

# Uniswap：从交易意图到池结算

先读[智能合约基础](../../ethereum/contract/contract.md)和[原有 Uniswap 版本入口](../../ethereum/contract/uniswap.md)，区分 V2 的 Pair 储备、V3 的集中流动性与 V4 的结算架构。这里的深度主线限定 V3，不把不同版本的调用链拼接起来。

进入 [V3 跨 Tick Swap 与结算](./v3-swap.md)：先看代币顺序、价格与流动性，再追踪分段计算、tick 跨越、回调付款及余额校验；最后用[本地 EVM 与独立整数复算](./v3-swap.md#experiment)核对正常成交、价格限制、锁和少付付款失败。版本、锁和原始结果均在主文实验节。

本地实验验证池及测试夹具；Router 仅源码核查，未做部署集成，也不是主网/fork 验证。比较交易之后的债务与风险，可接着读 [Aave](./../aave/README.md)；返回 [DeFi 导读](./../README.md)或[区块链总导读](../../README.md)。


## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

- [Uniswap V3：跨 Tick Swap 与回调结算](./v3-swap.md)

返回[上一级：DeFi](./../README.md)。

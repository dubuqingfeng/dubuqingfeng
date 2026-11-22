---
id: "index"
slug: "/wiki/blockchain/defi/aave/"
title: Aave 阅读路线
description: 按固定版本理解抵押借款、利息与账户风险。
---

# Aave 阅读路线

[Aave V3：借款、利息与健康因子](./v3-borrow-health-factor.md) 从双抵押供给开始，实际运行 V3.7.0 的借款、180 天计息、价格变化、风险回滚和清算。正文包含固定源码、可复算整数、本地 EVM 夹具及未验证边界。

先区分三个问题：LTV 决定是否允许新增借款；健康因子衡量清算风险；储备状态、模式、上限和价格源共同决定交易能否执行。阅读时保留版本边界，V3.7 的 isolated eMode 与已删除的旧储备隔离模式不能混用。

前置可读[以太坊智能合约](../../ethereum/contract/contract.md)；对照交易协议的资金结算可读 [Uniswap V3](../uniswap/v3-swap.md)。本目录后续专题尚未展开，不把待验证机制列成已完成指南。

## 实验与其他阅读路径

从主文的[本地复现实验](./v3-borrow-health-factor.md#experiment)获取固定依赖、输入、原始状态与独立整数复算。实验的代币、预言机及管理员为 Mock/EOA 夹具，不能据此确认生产治理、喂价或当前主网参数。

返回[DeFi 导读](./../README.md)或[区块链总导读](../../README.md)；需要区分永续合约的仓位、资金费与保证金时，先读[共用术语](./../perps/README.md)，不要直接套用借贷健康因子。


## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

- [Aave V3：借款、利息与健康因子](./v3-borrow-health-factor.md)

返回[上一级：DeFi](./../README.md)。

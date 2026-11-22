---
title: Hyperliquid
slug: /wiki/blockchain/hyperliquid
---

Hyperliquid 是一个以永续合约为核心的去中心化交易生态，提供高性能撮合与链上结算能力。

本节整理其基础概念、API 入口与常见操作，便于快速查阅与实践。

## 基础概念

- [概览](./concepts/overview.md)
- [保证金与风险](./concepts/margins.md)

## API

- [REST API](./api/rest.md)
- [WebSocket 订阅](./api/ws.md)

## 操作指南

- [下单与撤单](./guides/orders.md)：固定 SDK 源码、真实离线签名、订单状态与合成重连对账实验
- [查询账户与持仓](./guides/query.md)

## 网络

- [网络与链](./network/networks.md)


## 源码与实验阅读路线

从上面的概览、REST 与账户查询进入[签名、订单状态与重连对账](./guides/orders.md)，再按[复现实验](./guides/orders.md#reproduce)下载固定 SDK 离线签名与合成事件回放包。离线恢复和合成回放不证明服务端接受或真实 WS 故障恢复；当前未取得可审计 HyperCore 引擎源码，范围以主文为准。

返回[区块链总导读](../README.md)；共享仓位和保证金术语见[永续合约导读](./../defi/perps/README.md)，具体规则仍按各协议版本分别核对。


## 本级目录 {#directory-index}

### 子目录 {#directory-children}

- [Hyperliquid：API 接口](./api/README.md)
- [Hyperliquid：基础概念](./concepts/README.md)
- [Hyperliquid：操作指南](./guides/README.md)
- [Hyperliquid：网络](./network/README.md)

返回[上一级：区块链](./../README.md)。

---
title: Reth
description: 沿节点装配、交易池、payload 与 Engine 实时执行理解 Reth v2.11.0。
---

# Reth

Reth 是 Ethereum 执行层客户端。先读[执行层/共识层](../consensus/pos.md)，再沿三条源码路线理解“服务已启动”“交易可打包”“区块已执行”“规范链已更新”和“状态已持久化”各表示什么。

## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

1. [节点启动与组件边界](./node-architecture.md)：从 CLI 到组件装配、Engine、RPC 和退出路径。
2. [交易池到 payload 构建](./transaction-pool-payload.md)：从两类入口到池状态、nonce 依赖和候选构块。
3. [Engine 执行与状态持久化](./execution-state.md)：从 Engine 消息到执行验证、内存规范链和持久化。

核查日期：2026-11-20。基线为官方当日最新正式稳定版 **v2.11.0**，提交 `b9abbcc1b982755baa9021e6874e2e58936ca65f`；这是源码阅读基线，不证明任意公共节点部署了此版本。当前执行器已适配 **evm2::block**，不要套用旧版 revm 调用链。

实跑覆盖官方交易池 nonce 缺口测试、执行器提交选择/分段状态测试和 Berlin 创建合约测试；没有启动整节点、连接共识客户端或同步主网。

返回[上一级：Ethereum](../README.md)。

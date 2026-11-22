---
title: Blockchain
description: 按实际问题选择 Solana、Uniswap、Aave、Drift、Hyperliquid 与 Lightning 的源码和复现实验，并列各组件的固定版本基线。
---

# Blockchain

这里围绕一个问题组织阅读：**一个动作经过哪些校验，改变了什么状态，外部观察者又能确认到哪一步？** 先选工程问题，再沿基础概念、机制、固定源码和可复现实验逐层深入。

## 按问题选择主线 {#choose}

| 你想解决的问题 | 先读什么 | 机制与源码主文 | 实验入口 |
| --- | --- | --- | --- |
| 同一笔 Solana 交易从 shred、Geyser、RPC 被看到时，各说明什么？ | [账户地址](./solana/address.md)、[程序](./solana/program.md)、[交易](./solana/transaction.md) | [交易执行与数据路径](./solana/data-path.md) | [同签名只读 RPC 对账](./solana/data-path.md#experiment) |
| 一笔以太坊交易从 RPC 进入后，何时算可打包、已执行、已持久化？ | [执行层与共识层](./ethereum/consensus/pos.md)、[JSON-RPC](./ethereum/rpc/rpc.md) | [Reth：节点、交易池与执行](./ethereum/reth/README.md) | [Reth 交易池 nonce 缺口](./ethereum/reth/transaction-pool-payload.md#experiment) |
| Uniswap V3 的 Swap 怎样跨 tick，回调付款不足会怎样？ | [智能合约](./ethereum/contract/contract.md)、[Uniswap 版本导读](./defi/uniswap/README.md) | [跨 Tick Swap 与结算](./defi/uniswap/v3-swap.md) | [本地 EVM 与整数复算](./defi/uniswap/v3-swap.md#experiment) |
| 抵押品看似足够，Aave 借款为何失败；利息和价格怎样改变风险？ | [智能合约](./ethereum/contract/contract.md)、[Aave 阅读路线](./defi/aave/README.md) | [V3 借款、利息与健康因子](./defi/aave/v3-borrow-health-factor.md) | [本地供借、风险失败与清算](./defi/aave/v3-borrow-health-factor.md#experiment) |
| 永续合约成交、费用、资金费与保证金怎样影响仓位？ | [永续合约共用术语](./defi/perps/README.md)、[Solana 账户与程序](./solana/README.md) | [Drift 仓位生命周期](./defi/perps/drift-position-lifecycle.md) | [原生 Rust 函数与事件复算](./defi/perps/drift-position-lifecycle.md#reproduce) |
| Hyperliquid 签名绑定什么，超时与重连后怎样核对订单？ | [概览](./hyperliquid/concepts/overview.md)、[REST](./hyperliquid/api/rest.md)、[账户查询](./hyperliquid/guides/query.md) | [签名、订单状态与重连对账](./hyperliquid/guides/orders.md) | [离线 SDK 与合成回放](./hyperliquid/guides/orders.md#reproduce) |

不必按表顺序读完。做链数据接入，可先读 Solana，再对照 Hyperliquid 的客户端对账；研究 DeFi 状态与资金路径，可从 Uniswap 的池结算进入 Aave 债务与风险，再阅读永续仓位。各组件的固定版本、提交和核查日见下方[源码分析基线](#baselines)。

### 源码分析基线 {#baselines}

下表只列各篇主文实际冻结的组件版本；具体行号、命令、实验范围和“未验证项”仍以各主文为准。GitHub 标签、npm/PyPI 版本或本地源码都不等于当前主网/测试网部署版本。

| 组件 | 固定版本 | 提交 | 核查/发布 | 对应主文 |
| --- | --- | --- | --- | --- |
| Solana / Agave | `v4.4.1` | [`5bb30402`](https://github.com/anza-xyz/agave/commit/5bb304027fe1a166b02cb26dc8c161593f416fca) | 2026-11-05 发布；2026-11-19 核查 | [AccountsDB](./solana/accounts-db.md)、[SVM](./solana/svm.md)、[数据路径](./solana/data-path.md) |
| Solana / Yellowstone | `v17.0.2+solana.4.4.1` | [`3c66a659`](https://github.com/rpcpool/yellowstone-grpc/commit/3c66a659b947e6df09136fc7570bf9918588e2fb) | 2026-11-18 发布 | [数据路径](./solana/data-path.md) |
| Solana / Geyser 接口 | `agave-geyser-plugin-interface 5.0.0` | [`549c4142`](https://github.com/anza-xyz/agave-sdk/commit/549c41429dc8705e9c4eb5f540db66463ec45bd6) | 2026-11-19 核查 | [数据路径](./solana/data-path.md) |
| Ethereum / Reth | `v2.11.0` | [`b9abbcc1`](https://github.com/paradigmxyz/reth/commit/b9abbcc1b982755baa9021e6874e2e58936ca65f) | 2026-11-11 发布；2026-11-20 核查 | [节点启动](./ethereum/reth/node-architecture.md)、[交易池](./ethereum/reth/transaction-pool-payload.md)、[执行与状态](./ethereum/reth/execution-state.md) |
| Uniswap V3 core | `@uniswap/v3-core 1.0.1` | [`ed88be38`](https://github.com/Uniswap/v3-core/commit/ed88be38ab2032d82bf10ac6f8d03aa631889d48) | 2022-01-26 发布；2026-11-19 核查 | [V3 Swap](./defi/uniswap/v3-swap.md) |
| Uniswap V3 periphery | `@uniswap/v3-periphery 1.4.4` | [`697c2474`](https://github.com/Uniswap/v3-periphery/commit/697c2474757ea89fec12a4e6db16a574fe259610) | 2023-09-27 发布；2026-11-19 核查 | [V3 Swap](./defi/uniswap/v3-swap.md) |
| Aave V3 | `v3.7.0` | [`cff15de6`](https://github.com/aave-dao/aave-v3-origin/commit/cff15de6d1271b0c800fc001f4aea4c263e8a597) | 2026-08-05 发布；2026-11-19 核查 | [V3 借款与健康因子](./defi/aave/v3-borrow-health-factor.md) |
| Drift 程序 | `v2.161.0` | [`d686955c`](https://github.com/drift-labs/protocol-v2/commit/d686955cdc0d02ca4647c8fc71dac1dc4ed9c269) | 2026-03-30 发布；2026-11-19 核查 | [Drift 仓位生命周期](./defi/perps/drift-position-lifecycle.md) |
| Drift SDK | `@drift-labs/sdk 2.156.0` | [`bcaf43e6`](https://github.com/drift-labs/protocol-v2/commit/bcaf43e605b5cb501906d3e1147d4ddb4010105b) | 2026-01-27 发布 | [Drift 仓位生命周期](./defi/perps/drift-position-lifecycle.md) |
| Hyperliquid Python SDK | `0.24.0` | [`2fdb18f9`](https://github.com/hyperliquid-dex/hyperliquid-python-sdk/commit/2fdb18f9517675ea03695a0962bd19eece9c83f0) | 2026-11-20 核查 | [订单与重连对账](./hyperliquid/guides/orders.md) |
| Lightning / LND | `v0.21.8-beta` | [`59dd7908`](https://github.com/lightningnetwork/lnd/commit/59dd7908b33710b511c960d848ecb24c47916c3a) | 2026-11-11 发布；2026-11-21 核查 | [Lightning 安全](./lightning/security.md) |

## 怎样读一篇源码样板 {#read}

1. **基础**：先确认账户、资产、单位和动作参与者。以太坊合约和 Solana 程序的账户模型不同；主账户、子账户、vault 与签名代理也不能混用。
2. **机制**：阅读主文的状态表和图，区分请求、校验、状态提交与异步通知；把输入输出和取整方向写成可核对的数值。
3. **源码**：沿主文的固定提交链接检查实际函数和调用关系。版本是各篇核查时的基线；升级后需要重新核对，不能把包版本当作当前部署证明。
4. **实验**：从上表进入各篇实验节，先读环境与范围，再下载原脚本、锁、输入和原始输出，在隔离目录复现。未执行的后续实验会单独标明。

Solana、Uniswap V3、Aave V3、Drift、Hyperliquid 五篇已完成作者以外的技术复核；Ethereum/Reth 与 Lightning 为新增，证据边界见各自主文。下面列出证据范围，具体版本、日期、命令和失败分支保留在各主文中，避免导读复制后失去同步。

## 每种证据能回答什么 {#evidence}

| 样板 | 已有证据 | 阅读时保留的边界 |
| --- | --- | --- |
| Solana | 固定 Agave/Yellowstone/Geyser 接口源码与公共 Devnet 只读 RPC 记录 | 未运行配套节点和插件；RPC 样本不证明网络部署了所读稳定提交 |
| Ethereum / Reth | 固定 v2.11.0 源码、官方测试运行（交易池 nonce、执行器状态、Berlin 创建合约） | 未启动整节点/连接共识层/同步主网；源码版本不等于公共节点部署 |
| Uniswap V3 | 固定 core/periphery 源码、本地池 EVM 成功/失败与独立数值复算 | Router 仅源码核查，未部署集成；不是主网或 fork 验证 |
| Aave V3 | 固定本地实现、真实逻辑库、本地借款/计息/风险失败和清算 | 代币、预言机和管理员使用 Mock/EOA 夹具，不证明生产治理、喂价或当前主网参数 |
| Drift | 原生 Rust 函数、状态与原始事件、独立数值校验 | 五个独立夹具不是同账户连续交易；函数返回 Err 不证明交易原子回滚；20 quote 抵押是明确假设 |
| Hyperliquid | 公开 SDK 源码、真实离线签名、合成事件对账与公共只读样本 | 不证明服务端接受签名或真实 WS 故障恢复；未取得可审计 HyperCore 撮合/共识/风险引擎源码 |
| Lightning | 固定 LND v0.21.8-beta 源码、51 项源码断言、shachain 运行实验 | 未执行 regtest 违约演练与 watchtower 端到端；不是审计报告 |

共享术语帮助提出同一组问题，具体保证金、利息、资金费、清算和确认规则仍以各协议、各版本为准。不能把某个本地测试通过推广成整个协议、当前部署或任意输入均已验证。

## 专题入口 {#topics}

- [Solana：账户、程序、交易与数据路径](./solana/README.md)
- [Lightning：承诺交易、违约惩罚、看门狗与恢复边界](./lightning/README.md)
- [DeFi：交易结算、借贷与永续仓位](./defi/README.md)，包含 [Uniswap](./defi/uniswap/README.md)、[Aave](./defi/aave/README.md)、[永续合约](./defi/perps/README.md)
- [Hyperliquid：概念、接口与订单对账](./hyperliquid/README.md)
- 原有 [Uniswap 合约入口](./ethereum/contract/uniswap.md) 继续保留，指向同一篇 V3 主文。


## 本级目录 {#directory-index}

### 子目录 {#directory-children}

- [DeFi](./defi/README.md)
- [Gas](./gas/README.md)
- [Hyperliquid](./hyperliquid/README.md)
- [Lightning](./lightning/README.md)
- [Solana](./solana/README.md)
- [以太坊](./ethereum/README.md)
- [其他公链](./coin/README.md)
- [比特币](./bitcoin/README.md)
- [量化交易](./quant/README.md)

返回[上一级：知识库索引](./../README.md)。

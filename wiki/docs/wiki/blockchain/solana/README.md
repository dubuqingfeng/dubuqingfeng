---
title: Solana
description: 从账户和交易基础进入执行、提交、数据出口与只读实验。
---

# Solana

<span id="solana账户程序与数据路径"></span>

如果你在选择 RPC、Geyser 或 shred 数据，先明确需要观察的是交易负载、执行结果还是确认变化，再进入源码与接口比较。

1. **账户基础**：[地址](./address.md) → [PDA](./pda.md)。区分地址、所有者与可写数据。
2. **动作与资产**：[程序](./program.md) → [Token](./token.md) → [交易](./transaction.md)。理解指令、账户列表、签名和费用。
3. **机制与源码**：[交易执行与数据路径](./data-path.md)，沿 Leader、跟随节点、Bank 提交和数据通知理解每层能确认什么。
4. **复现实验**：[同签名只读 RPC 对账](./data-path.md#experiment)，核对交易、区块、余额和状态；脚本与原始响应随文提供。

主文采用各篇核查日固定的稳定源码基线，公共 RPC 样本只证明该样本的读取结果。没有实际运行配套 validator 和 Yellowstone 插件，也没有真实 shred/订阅断线或分叉实验；版本与未验证项见[主文证据边界](./data-path.md#versions)。

返回[区块链阅读路线](../README.md)，或阅读 [DeFi 状态与资金路径](./../defi/README.md)、[Hyperliquid 客户端对账](../hyperliquid/README.md)。


## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

- [Address](./address.md)
- [PDA（Program Derived Address）](./pda.md)
- [Programs（程序）](./program.md)
- [Solana AccountsDB（Agave v4.4.1）：写缓存、追加文件与格哈希](./accounts-db.md)
- [Solana RPC：getAccountInfo 与 getProgramAccounts 源码路径](./rpc-account-queries.md)
- [Solana SVM（Agave v4.4.1）：交易批处理、账户上下文与程序运行时](./svm.md)
- [Solana：交易执行与数据路径源码](./data-path.md)
- [SPL Token](./token.md)
- [Transaction](./transaction.md)

返回[上一级：区块链](./../README.md)。

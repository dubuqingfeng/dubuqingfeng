---
title: Lightning
description: 从承诺交易、撤销窗口、违约惩罚、看门狗和备份恢复理解 Lightning 的安全边界。
---

# Lightning

Lightning 的安全问题可以压缩成一句话：**链下快速达成状态，链上保留可强制执行的合同。** 读这一组文章时，先区分三件事：谁掌握哪个秘密、链上哪笔交易能花哪个输出、以及本地数据库丢失后还能证明什么。

1. **合同结构**：承诺交易是非对称的。同一状态有双方各自持有的一笔交易；`to_local` 带 CSV 延迟和撤销分支，`to_remote` 通常直接支付。
2. **撤销与惩罚**：每个状态揭示一个 shachain secret；撤销密钥由撤销基点和状态点推导。对方广播旧状态时，本地需要 revocation log + secret + 匹配的交易，才能构造 justice tx。
3. **可用性边界**：看门狗保存预签名 justice kit，用 breach txid 派生密钥解密；它保护主输出，不保护 HTLC。SCB 恢复频道外壳，但不能主动 force close，也不能惩罚旧状态。
4. **资源边界**：转发侧的费用、CLTV、dust、最大 HTLC 数、费用暴露、ping/onion/gossip 限速，都是 DoS 上限，不是经济攻击的完整解。

主文固定 **LND `v0.21.8-beta`**，提交 [`59dd7908b33710b511c960d848ecb24c47916c3a`](https://github.com/lightningnetwork/lnd/commit/59dd7908b33710b511c960d848ecb24c47916c3a)，2026-11-11 发布。文中的源码断言和 shachain 实验已执行；regtest 违约演练和 watchtower 端到端实验未执行，边界在[主文证据表](./security.md#versions)中单独标明。

## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

- [Lightning 安全（LND v0.21.8-beta）：承诺交易、违约惩罚、看门狗与 DoS 边界](./security.md)

### 可视化导读 {#visual}

- [违约、看门狗与恢复边界（HTML）](/html-pages/blockchain/lightning-security/index.html)

返回[上一级：区块链](../README.md)。

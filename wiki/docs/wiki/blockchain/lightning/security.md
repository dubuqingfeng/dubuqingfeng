---
slug: "/Wiki/blockchain/lightning/security"
title: "Lightning Network 安全（LND v0.21.8-beta）：承诺交易、违约惩罚、看门狗与 DoS 边界"
description: "以 LND v0.21.8-beta 固定提交为基线，解释承诺交易的不对称、shachain 撤销窗口、违约惩罚与 justice tx、watchtower 的加密边界、SCB 恢复能做什么与不能做什么，以及转发与 RPC 侧的资源上限；附已执行的源码断言和 shachain 实验。"
---

## 1. 具体问题与结论 {#question}

Lightning 的安全不是“把支付搬到链下所以更快”。更准确的模型是：

> **链下只负责快速达成新状态；链上始终保留一份可强制执行的合同。安全的核心不是“对方诚实”，而是“对方广播旧状态时，我是否还掌握惩罚它所需的秘密和证据”。**

围绕这个模型，本文回答五个问题：

1. 一笔承诺交易里，双方各自能花什么？为什么同一状态会有两笔不同的交易？
2. 对方广播已撤销状态时，LND 如何从链上交易反推出状态号、找到撤销密钥、构造 justice tx？
3. 看门狗（watchtower）看不到明文，凭什么能替受害者惩罚？它到底保护哪些输出？
4. 静态通道备份（SCB）恢复后，为什么不能主动 force close，也不能惩罚旧状态？
5. 转发节点如何被“免费”占用资源？LND 在金额、CLTV、费用暴露、ping、onion message 和 gossip 上分别设了什么上限？

> 可视化导读：[Lightning 安全：违约、看门狗与恢复边界](/html-pages/blockchain/lightning-security/index.html)。动画只做机制概览，具体分支和证据以本文为准。

### 结论先行 {#conclusions}

1. **承诺交易是非对称的。** 双方各自持有一笔不同的 commitment transaction；本地 commitment 的 `to_local` 带 CSV 延迟和撤销分支，`to_remote` 直接支付给对方。密钥按状态点逐次 tweak，旧状态的密钥与新状态不可链接。[`DeriveCommitmentKeys`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L106)、[`CommitScriptToSelf`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L228)
2. **撤销密钥是“撤销基点 + 状态点”的函数。** `RevocationKey = f(revocation_base, commit_point)`；要花撤销分支，必须同时知道撤销基点的私钥和该状态的 commitment secret。对方在撤销状态时揭示 secret，惩罚能力由此产生。[`DeriveRevocationPubkey`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/input/script_utils.go#L3098)
3. **shachain 是单向的。** 一个 48 层哈希链根可以生成几乎无限个 secret；揭示第 `h` 个 secret 可以推出更早的 secret，但不能推出 `h+1`。这让“只存根 + 已揭示的少量 secret”成为可能。[`RevocationProducer`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/shachain/producer.go#L72)、[`RevocationStore`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/shachain/store.go#L108)
4. **违约检测依赖 revocation log，而不只依赖 secret。** `NewBreachRetribution` 先 `FindPreviousState(stateNum)` 找该状态的 commitment 摘要和 HTLC 条目，再用 `RevocationStore.LookUp(stateNum)` 取 secret。没有 log 时，`ErrLogEntryNotFound` 会被当作“不是违约”，转入数据丢失保护（DLP），只救本地输出，不救 HTLC。[`NewBreachRetribution`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L2116)、[`handlePossibleBreach`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/chain_watcher.go#L1160)
5. **justice tx 由本地 breach arbitrator 构造并广播，不是 watchtower 生成。** 看门狗保存的是客户端预先签好名的 justice kit；它用 breach txid 派生密钥解密，不能改写收款地址或金额。[`handleBreachHandoff`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/breach_arbitrator.go#L985)、[`craftSessionPayload`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/wtclient/backup_task.go#L238)
6. **看门狗只覆盖 commitment 的两个主输出。** `JusticeKit` 只有 `ToLocalOutputSpendInfo` 和 `ToRemoteOutputSpendInfo`；HTLC 输出不在看门狗的 justice tx 里。HTLC 的惩罚依赖本地 breach arbitrator 持有的 revocation log 和 `HtlcRetributions`。[`JusticeKit`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/blob/justice_kit.go#L25)、[`createJusticeTx`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/breach_arbitrator.go#L1443)
7. **SCB 是“频道外壳”，不是频道状态。** 它包含容量、funding outpoint、key locator 和 shachain 根，但不含当前 commitment tx 和 revocation log。恢复后 LND 会把频道标记为 `ChanStatusRestored`，拒绝 coop/force close，等待对方 force close，再走 DLP 取回本地输出；按 v0.21.8 的代码路径不会进入 breach 分支。[`Single.Serialize`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanbackup/single.go#L352)、[`openChannelShell`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanrestore.go#L49)
8. **转发侧的安全主要是资源边界，而不是“防偷钱”。** 费用不足、CLTV 不够、金额低于最小值、超过最大 HTLC 数、费用暴露超限、ping 洪水、onion message 洪水、gossip 更新洪水，分别有独立的上限。默认值见第 6 节；它们降低的是被免费占用资源的概率，不是经济攻击的完整解。

### 版本与证据边界 {#versions}

| 对象 | 固定基线 | 本文能证明什么 |
| --- | --- | --- |
| LND 主路径 | `v0.21.8-beta`，提交 [`59dd7908b33710b511c960d848ecb24c47916c3a`](https://github.com/lightningnetwork/lnd/commit/59dd7908b33710b511c960d848ecb24c47916c3a)，2026-11-11 发布 | 该提交下的承诺交易、撤销、违约惩罚、看门狗、SCB、转发与 RPC 代码路径 |
| 版本边界 | `v0.21.0`、`v0.21.3`、`v0.21.4`、`v0.21.6` | onion message 限速、ping 限速、ping 回复语义、MPTCP 监听关闭的引入位置 |
| 实验 E1 | 2026-11-21，macOS，Go 1.26.10，本地 sparse checkout | shachain 揭示窗口的**运行结果**：已揭示 secret 可查，未揭示 secret 不可查 |
| 实验 E2 | 2026-11-21，同一 checkout | 51 项源码常量、分支和顺序断言；**不是**运行期违约演练 |
| 实验 E3 | 未执行 | 需要 bitcoind + 两个 LND 节点 + 旧 `channel.db` 快照；文中只给步骤和风险 |
| 实验 E4 | 未执行 | 需要 watchtower + wtclient 的 regtest 端到端环境；文中只给验证点 |

**为什么以 v0.21.8-beta 为主路径？** 因为它是截至 2026-11-21 的最新稳定 release，且包含两项与本文直接相关的边界变化：

- `v0.21.6` 起，LND 不再打开 MPTCP 监听，关闭了 CVE-2026-98432 在 LND 进程内的可达路径；`v0.21.0`–`v0.21.5` 在 Linux 上暴露过该路径。[release notes 0.21.6](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/docs/release-notes/release-notes-0.21.6.md)
- `v0.21.8` 修复了 wire 解码、watchtower policy、sweeper 费用与重试、频道状态持久化、gossip 校验、通道协商与 coop close 的一批底层问题，并明确拒绝“没有可用 commitment tx 的 restored channel”的 force close。[release notes 0.21.8](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/docs/release-notes/release-notes-0.21.8.md)

本文不把任何主网观测、审计结论或“最新 master”行为混入 v0.21.8 的结论。源码行号以该提交为准；升级后需要重新核对。

## 2. 威胁模型：四个角色与四类秘密 {#model}

先把“谁掌握什么”写清楚。Lightning 的很多误解来自把“节点数据库里有什么”与“链上谁能花什么”混为一谈。

| 角色 | 掌握的信息 | 不掌握的信息 | 能做的事 |
| --- | --- | --- | --- |
| 本地节点 | 钱包种子、本频道 shachain 根、已揭示的 revocation store、revocation log、当前 commitment tx、签名器 | 对方未来的 secret、对方的钱包种子 | 正常转发/结算；在对方违约时构造 justice tx |
| 远端 peer | 它自己的 shachain 根、双方 commitment tx（它签你那份，你签它那份）、你已揭示的 secret | 你的钱包种子、你未来的 secret | 广播它持有的任一状态；广播旧状态即违约 |
| 看门狗 | 加密后的 justice kit、会话策略、breach hint、自己的链后端 | 明文 justice kit、频道 ID、你的种子 | 在看到 breach tx 后解密并广播预签名 justice tx；可选择不广播 |
| 链上观察者 | funding tx、commitment tx、justice tx、金额与脚本 | 状态号（被混淆）、频道双方的链下身份 | 观察、关联、抢跑（在可行时） |
| RPC 客户端 | macaroon（admin/readonly/invoice） | 钱包种子、TLS 私钥 | 取决于 macaroon 权限；admin 等同节点控制 |

关键点：

- **链上花钱靠脚本和 preimage，不靠数据库。** 数据库决定“我是否知道该用哪个脚本、哪个 secret”；即使数据库丢了，只要对方 force close，仍可能用 DLP 取回部分资金。
- **对方知道你签过的 commitment tx。** 它不需要“偷”你的当前状态；它本来就有你为它构造的那份 commitment。安全边界是“它广播旧状态后，你是否还能惩罚”，而不是“它是否知道旧状态”。
- **看门狗不是托管方。** 它拿到的是已签名的交易模板；它能做的是“选择是否广播”和“选择何时广播”，不能改收款人。
- **RPC 是节点控制面。** 一个 admin macaroon 的能力远大于“读余额”；它可以直接开/关频道、发支付、连 peer、导出备份。

## 3. 承诺交易：一笔合同，两笔交易 {#commitment}

### 3.1 为什么同一状态有两笔交易 {#asymmetry}

Lightning 的 commitment transaction 不是双方共同持有的一笔交易，而是**双方各自持有一笔不同的交易**。原因不是实现偷懒，而是为了让“谁广播、谁等待”与“谁承担费用、谁承担延迟”解耦。

从本地视角看：

- 本地 commitment 的 `to_local` 是“我的输出”，带 `csv_delay`，有两个花费分支：
  - 撤销分支：`<revocation_key> OP_CHECKSIG`，可立即花；
  - 延迟分支：`<my_delay_key> OP_CHECKSEQUENCEVERIFY <csv_delay> OP_DROP OP_CHECKSIG`，必须等 CSV。
- 本地 commitment 的 `to_remote` 是“对方的输出”，通常是直接的 P2WPKH/P2TR，没有 CSV 延迟；tweakless/taproot 下公钥不再被状态点 tweak。
- 对方 commitment 的布局相反：它的 `to_local` 是“它的输出”，带它自己的 CSV；它的 `to_remote` 是“我的输出”，通常可直接花。

因此，同一状态在链上可能表现为两笔不同的交易；谁广播，决定了哪些输出带延迟、哪些输出可直接花。`DeriveCommitmentKeys` 根据 `whoseCommit` 选择 `DelayBasePoint` / `PaymentBasePoint` / `RevocationBasePoint`，并对每个状态点做 tweak。[`DeriveCommitmentKeys`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L106)

### 3.2 撤销密钥的代数 {#revocation-key}

撤销公钥不是“另一个公钥”，而是两个基点与状态点的组合：

```text
R = revoke_base * SHA256(revoke_base || commit_point)
C = commit_point * SHA256(commit_point || revoke_base)
revocation_pubkey = R + C
```

对应代码在 [`DeriveRevocationPubkey`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/input/script_utils.go#L3098)。要构造撤销分支的 witness，需要：

1. 撤销基点的私钥（本地节点持有）；
2. 该状态的 commitment secret（对方在撤销状态时揭示）；
3. 由两者推导出的撤销私钥。

`CommitSpendRevoke` 把签名、`[]byte{1}` 和 witness script 组成 witness；第一个 `1` 用来选择脚本的撤销分支。[`CommitSpendRevoke`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/input/script_utils.go#L2463)

> **安全含义：** 撤销分支的存在，使得“广播旧状态”不是普通的 force close，而是把自己的输出暴露给一个只有对方能花的密钥。CSV 延迟不是为了让对方等，而是为了给诚实方留出发现和惩罚的时间窗口。

### 3.3 shachain：一个根，一条单向链 {#shachain}

每个频道有一个随机的 shachain 根。`RevocationProducer.AtIndex(h)` 从根出发，沿 48 层二叉树路径推导出第 `h` 个 secret；`RevocationStore` 只保存已揭示的 secret，并用“尾部零个数”分桶，最多 48 个元素。[`producer.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/shachain/producer.go#L72)、[`store.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/shachain/store.go#L108)

性质：

- 从根可以推出所有 secret；
- 从第 `h` 个 secret 可以推出更早的 secret；
- 从第 `h` 个 secret **不能**推出 `h+1`；
- 因此，对方每撤销一个状态，就多给你一个 secret；你不需要保存所有 secret，也能在需要时恢复更早的。

这不是“理论上的优雅”，而是实际的状态机约束：`ReceiveRevocation` 在把 secret 加入 store 之前，会先验证 `ComputeCommitmentPoint(revocation) == RemoteCurrentRevocation`；不匹配就返回 `revocation key mismatch`，不改变任何状态。[`ReceiveRevocation`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L5962)

### 3.4 状态推进与崩溃一致性 {#state-machine}

一次完整的“我提议新状态、对方撤销旧状态”大致是：

1. 本地 `SignNextCommitment` 为对方的新 commitment 签名；
2. 对方 `RevokeCurrentCommitment` 生成它当前高度的 revocation，推进它的本地链尾；
3. 本地 `ReceiveRevocation` 验证并保存 secret，轮换 `RemoteCurrentRevocation` / `RemoteNextRevocation`，构造 forwarding package；
4. `AdvanceCommitChainTail` 在**一个数据库事务**里写入 revocation 状态、revocation log、commit diff 和 forwarding package。

`AdvanceCommitChainTail` 的写入顺序值得注意：先把当前 `commitDiff` 的 commitment 写成 `RemoteCommitment`，再把这个被撤销的旧状态追加到 revocation log，最后写 forwarding package。整个过程在 `kvdb.Update` 的单个 bbolt 事务中；崩溃要么全部生效，要么全部不生效。[`AdvanceCommitChainTail`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/channeldb/channel.go#L3550)

> **边界：** 数据库事务保证“本地记录一致”，不保证“对方也持久化了”。如果对方在签名后崩溃且没有持久化，恢复时可能重发旧状态；这正是 `channel_reestablish` 和数据丢失保护要处理的情况，见第 4.4 节。

## 4. 违约：从链上交易到 justice tx {#breach}

### 4.1 检测：状态号、日志、密钥 {#detect}

当一笔疑似 commitment 的交易花费 funding outpoint 时，`handleCommitSpend` 先从交易的 `nSequence` 和 `nLockTime` 中解出被混淆的状态号：

```text
state_num = (sequence & 0xFFFFFF) << 24 | (locktime & 0xFFFFFF)
state_num ^= obfuscator
```

混淆器由双方的 `PaymentBasePoint` 推导；第三方没有这两个基点，不能轻易读出状态号；对方可以。[`SetStateNumHint`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/transactions.go#L163)、[`createStateHintObfuscator`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L668)

然后按顺序判断：

1. `handleKnownLocalState`：是不是我自己的当前 commitment？如果是，本地 force close。
2. `handleKnownRemoteState`：是不是对方的当前 commitment 或 pending commitment？如果是，远端 force close / pending close。
3. 否则，`handlePossibleBreach`：是不是对方广播了一个**已撤销**的状态？
4. 再否则，合作关闭或未知状态；未知状态走 DLP。

`handlePossibleBreach` 的关键逻辑：

```go
retribution, err := lnwallet.NewBreachRetribution(
    c.cfg.chanState, broadcastStateNum, spendHeight,
    commitSpend.SpendingTx, c.cfg.auxLeafStore, c.cfg.auxResolver,
)
switch {
case err == channeldb.ErrLogEntryNotFound:
    return false, nil   // 不是我们记录过的旧状态
case err == channeldb.ErrNoPastDeltas:
    return false, nil
case err != nil:
    return false, fmt.Errorf("unable to create breach "+
        "retribution: %v", err)
}

commitHash := commitSpend.SpendingTx.TxHash()
if retribution.BreachTxHash != commitHash {
    return false, nil   // 状态号对上了，但交易对不上
}
```

[`handlePossibleBreach`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/chain_watcher.go#L1160)

这段代码有三个安全要点：

- **没有 revocation log 就不认定为违约。** 这是保守的：宁可走 DLP，也不误判。
- **状态号对上还不够，交易哈希也要对上。** 防止同状态号的不同交易或伪造。
- **只有在确认是违约后，才关闭 link 并交给 breach arbitrator。**

### 4.2 重建：从日志到可花的输出 {#rebuild}

`NewBreachRetribution` 做四件事：

1. `FindPreviousState(stateNum)` 取出该状态的 `RevocationLog`（新格式）或 `ChannelCommitment`（旧格式）；
2. `RevocationStore.LookUp(stateNum)` 取出该状态的 commitment secret；
3. `DeriveCommitmentKeys(commitPoint, Remote, ...)` 重建当时的 `to_local` / `to_remote` / HTLC 密钥；
4. 用 `RevocationLog` 里的 `CommitTxHash`、`OurOutputIndex`、`TheirOutputIndex` 和 `HTLCEntries` 构造 `BreachRetribution`。

[`NewBreachRetribution`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L2116)、[`createBreachRetribution`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L2542)

`BreachRetribution` 包含：

- `LocalOutpoint` / `RemoteOutpoint`：双方主输出的 outpoint；
- `LocalOutputSignDesc` / `RemoteOutputSignDesc`：主输出的签名描述（dust 时为 nil）；
- `HtlcRetributions`：每个 HTLC 的第二层花费信息；
- `KeyRing`：重建后的密钥环；
- `BreachTxHash`、`ChanType`。

> **为什么需要 revocation log？** 仅有 secret 只能推出撤销私钥，不能知道“当时有哪些 HTLC、它们在 commitment 的哪个输出、金额多少、第二层脚本是什么”。revocation log 保存的正是这些“当时的事实”。这也是 SCB 恢复无法完整惩罚的根本原因。

### 4.3 执行：先持久化，再广播 {#execute}

`handleBreachHandoff` 的顺序是刻意设计的：

1. 立即 `CloseLink(CloseBreach)`，阻止该 link 继续转发；
2. 检查 retribution store 是否已记录该频道；
3. `newRetributionInfo` 把 `BreachRetribution` 转成可持久化的 `retributionInfo`；
4. **先 `Store.Add(retInfo)`，再 `ProcessACK`**；
5. 注册 breach tx 的 1 确认通知；
6. 启动 `exactRetribution`。

[`handleBreachHandoff`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/breach_arbitrator.go#L985)

“先持久化再 ACK”意味着：即使进程在 ACK 后立刻崩溃，重启后仍能从 retribution store 恢复并继续惩罚。反过来，如果先 ACK 再持久化，崩溃可能丢掉唯一一次惩罚机会。

`exactRetribution` 在 breach tx 确认后：

- `createJusticeTx` 构造多个变体：`spendAll`（所有输出）、`spendCommitOuts`（只主输出）、`spendHTLCs`（只 HTLC 输出）、`spendSecondLevelHTLCs`（第二层 HTLC 输出）；
- 广播 `spendAll`；
- 同时监听所有被违约输出的花费；如果对方先花掉某个输出，`updateBreachInfo` 更新状态并重建 justice tx；
- 如果 HTLC 已经被对方花到第二层，`convertToSecondLevelRevoke` 把目标改成第二层输出；
- 所有输出都被清理后，`cleanupBreach` 删除记录。

[`exactRetribution`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/breach_arbitrator.go#L701)、[`createJusticeTx`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/breach_arbitrator.go#L1443)

`createJusticeTx` 按 witness type 分组：

| 分组 | witness type | 说明 |
| --- | --- | --- |
| 主输出 | `CommitmentNoDelay`、`CommitmentToRemoteConfirmed`、`CommitmentRevoke`、taproot 变体 | `to_local` / `to_remote` |
| commitment 级 HTLC | `HtlcOfferedRevoke`、`HtlcAcceptedRevoke`、taproot 变体 | 直接花 commitment 上的 HTLC 输出 |
| 第二层 HTLC | `HtlcSecondLevelRevoke`、taproot 变体 | 对方已经把 HTLC 花到第二层时 |

> **为什么 `MaxHTLCNumber = 966`？** 源码注释写得很直接：这个上限是为了让违约惩罚交易能一次扫掉所有 HTLC，同时仍低于常用的标准重量限制。[`input/size.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/input/size.go#L322)

### 4.4 失败分支表 {#failure-table}

| 情况 | 代码路径 | 结果 |
| --- | --- | --- |
| 对方广播已撤销状态，本地有 revocation log | `handlePossibleBreach` → `NewBreachRetribution` → `dispatchContractBreach` | 进入 justice 流程，主输出 + HTLC 输出都可扫 |
| 对方广播已撤销状态，本地没有 log（SCB 恢复/日志缺失） | `ErrLogEntryNotFound` → 返回 false → `handleUnknownRemoteState` | 不认定为违约；DLP；只扫本地输出，**不恢复 HTLC** |
| 对方广播当前状态 | `handleKnownRemoteState` 匹配 `remoteCommit` | 普通远端 force close；不惩罚 |
| 对方广播 pending 状态 | `handleKnownRemoteState` 匹配 `remotePendingCommit` | pending close；用 `RemoteNextRevocation` 扫 |
| 我方丢失状态，对方高度更高 | `ProcessChanSyncMsg` 返回 `ErrCommitSyncLocalDataLoss` | `MarkDataLoss`，**不 force close**，等对方 force close |
| 我方丢失状态，但对方不支持恢复选项 | `ErrCannotSyncCommitChains` | `MarkBorked`，fail channel，不自动 force close |
| 对方丢失状态 / 发错 secret / commit point 不一致 | `ErrCommitSyncRemoteDataLoss` / `ErrInvalidLastCommitSecret` / `ErrInvalidLocalUnrevokedCommitPoint` | 主动 force close |
| 对方先花掉某个被违约输出 | `waitForSpendEvent` → `updateBreachInfo` | 重建 justice tx，继续扫剩余输出 |
| HTLC 被花到第二层 | `convertToSecondLevelRevoke` | 改为扫第二层输出 |
| 进程在 `Store.Add` 后崩溃 | 重启后 `IsBreached` / retribution store | 继续惩罚 |

这张表的核心是：**“旧状态”不等于“违约可罚”**。可罚需要三个条件同时成立：有该状态的 revocation log、有该状态的 secret、链上交易与记录匹配。缺一个，LND 就会退到更保守的路径。

## 5. 看门狗：它保护什么，不保护什么 {#watchtower}

### 5.1 客户端：预签名、加密、只给 hint {#wt-client}

看门狗客户端不是把频道状态发给塔，而是把“针对某个已撤销状态的、已经签好名的 justice tx 模板”加密后发过去。`craftSessionPayload` 的步骤：

1. `NewJusticeKit(sweepPkScript, breachInfo, hasToRemote)` 从 `BreachRetribution` 提取 `to_local` / `to_remote` 的脚本、公钥和签名位；
2. 构造 justice tx：输入是被违约的输出，输出是客户的 sweep 地址（以及可选的塔奖励输出）；
3. 按 BIP69 排序，检查交易 sanity；
4. 为每个输入生成 witness，把签名写入 kit；
5. `hint, key := NewBreachHintAndKeyFromHash(breachTxID)`；
6. `blob.Encrypt(justiceKit, key)`，使用 ChaCha20-Poly1305，随机 24 字节 nonce。

[`craftSessionPayload`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/wtclient/backup_task.go#L238)

密钥派生：

```text
hint = SHA256(txid)[:16]
key  = SHA256(txid || txid)
```

[`NewBreachHintAndKeyFromHash`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/blob/derivation.go#L58)

> **安全含义：** 在 breach tx 上链之前，塔只有 `hint` 和密文，不能解密；看到 breach tx 后，塔可以从 txid 算出 key，解密出 kit。塔不能提前拿走资金，因为 kit 里的签名只对特定的 justice tx 有效，收款地址和金额已经固定。

### 5.2 服务端：扫块、匹配 hint、解密、广播 {#wt-server}

`Lookout.processEpoch` 对每个新区块：

1. 对区块内每笔交易计算 `hint = SHA256(txid)[:16]`；
2. `DB.QueryMatches(txHints)` 查找已接受的 state update；
3. 对每个匹配，用 `key = SHA256(txid||txid)` 解密；
4. 构造 `JusticeDescriptor`，交给 `Punisher.Punish` 并行广播。

[`processEpoch`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/lookout/lookout.go#L212)

塔的信任边界：

- **能做什么：** 选择是否广播、何时广播；看到 breach txid、sweep 地址、奖励金额；知道某个客户端在某个时间提交过某个 hint。
- **不能做什么：** 改写 justice tx 的收款人/金额；在没有 breach tx 时解密；从 hint 反推频道 ID（hint 是 txid 的哈希前缀，只有看到 txid 才能匹配）。
- **失败模式：** 塔离线、链后端落后、策略不匹配、blob 损坏、奖励输出 dust。任何一种都意味着“没有 justice”。

### 5.3 边界：主输出 vs HTLC {#wt-boundary}

这是最容易被误解的一点。`JusticeKit` 接口只有：

```go
ToLocalOutputSpendInfo() (*txscript.PkScript, wire.TxWitness, error)
ToRemoteOutputSpendInfo() (*txscript.PkScript, wire.TxWitness, uint32, error)
HasCommitToRemoteOutput() bool
```

[`JusticeKit`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/blob/justice_kit.go#L25)

它没有 HTLC 输出。`newLegacyJusticeKit` / `newAnchorJusticeKit` / `newTaprootJusticeKit` 只处理 `to_local` 和 `to_remote`。因此：

- **看门狗能保护：** 频道主余额（`to_local` + `to_remote`；`to_remote` 只有在非 dust 且客户端把它放进 kit 时才覆盖）。
- **看门狗不能保护：** 违约状态上的 HTLC 输出。HTLC 的惩罚需要 `BreachRetribution.HtlcRetributions`，而它只存在于本地节点的 revocation log 中；本地 `createJusticeTx` 才会构造 `HtlcOfferedRevoke` / `HtlcAcceptedRevoke` / 第二层输入。

这不是实现遗漏，而是信息边界：塔只收到客户端愿意给的、足以扫主输出的信息；把每个 HTLC 的脚本和签名也给塔，会扩大隐私暴露和 blob 体积，而塔并不需要它们来完成“主余额惩罚”。

> **运维含义：** 有看门狗不等于“HTLC 也安全”。如果频道里有大量在途 HTLC，违约时塔只能救主余额；HTLC 部分要靠本地节点在线、有 revocation log、及时构造 justice tx。

### 5.4 策略与数值 {#wt-policy}

默认策略：

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `DefaultRewardRate` | `10000` / `1,000,000` = 1% | 塔成功惩罚后按被撤销 commitment 的总余额抽取的比例 |
| `DefaultSweepFeeRate` | `2500 sat/kw` ≈ 10 sat/vB | justice tx 的费用率 |
| `MinSweepFeeRate` | `1000 sat/kw` ≈ 4 sat/vB | 客户端可接受的最低费用率 |
| `DefaultMaxUpdates` | `1024` | 一个会话最多接受的 blob 数 |
| `RewardBase` | `0` | 固定奖励（在比例奖励之前扣） |

[`wtpolicy`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/watchtower/wtpolicy/policy.go)

策略校验会拒绝：

- `ErrFeeExceedsInputs`：sweep 费用超过输入总额；
- `ErrRewardExceedsInputs`：奖励 + 费用超过输入；
- `ErrCreatesDust`：justice tx 在给定费率下产生 dust 输出；
- `ErrAltruistReward`：altruist 策略带了非零奖励；
- `ErrNoMaxUpdates`：`MaxUpdates == 0`；
- `ErrSweepFeeRateTooLow`：低于 `MinSweepFeeRate`。

> **数值直觉：** 1 BTC 频道、1% 奖励 = 10,000 sat；10 sat/vB 的 justice tx 若约 500 weight，费用约 1,250 sat；客户净得约 988,750 sat。小频道（例如 100,000 sat）下，1,000 sat 奖励 + 1,250 sat 费用可能让输出接近 dust，策略校验会直接拒绝，而不是让塔做亏本买卖。

## 6. 转发与资源边界 {#forwarding}

### 6.1 Onion 解码与最终跳 {#onion}

`processRemoteAdds` 批量解码 Sphinx，失败时按 failure code 回 `update_fail_malformed_htlc`；`DecodeHopIterators` 同时做 replay 检查（`reforward` 标志区分重启重放）。[`processRemoteAdds`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L3058)

最终跳 `processExitHop` 校验：

- `ValidateFinalHtlc`：金额是否低于 onion 里要求的金额；expiry 是否低于 onion 里的 `OutgoingCLTV`；expiry 是否超过 `MaxFinalCltvDelta`；
- 通过后交给 invoice registry；如果 invoice 被 hold，进入 hodl queue；
- 失败时回 `FinalIncorrectHtlcAmount` / `FinalIncorrectCltvExpiry` / `FailIncorrectDetails`。

[`processExitHop`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L3523)

> **一个不对称：** `invoices.MaxFinalCltvDelta = math.MaxUint16`，即最终跳几乎不限制 CLTV 上限；转发跳则由 `MaxOutgoingCltvExpiry = 2016` 严格限制。最终跳仍可在 invoice 层拒绝；如果收款方选择 hold 或处理较慢，较长 expiry 会占用其入站槽位，但这不是无条件的 DoS。

### 6.2 费用、CLTV、金额 {#fee-cltv}

`CheckHtlcForward` 的检查顺序：

1. 计算期望费用：`outFee = ExpectedFee(policy, amtToForward)`，`inFee = inboundFee.CalcFee(amtToForward + outFee)`，`expectedFee = inFee + outFee`；
2. 如果 `incomingHtlcAmt < amtToForward` 或 `actualFee < expectedFee`，回 `FailFeeInsufficient`；
3. `canSendHtlc`：最小/最大 HTLC、expiry 太近、绝对 CLTV 上限、带宽；
4. CLTV delta：`incomingTimeout - outgoingTimeout >= TimeLockDelta`，否则 `FailIncorrectCltvExpiry`；
5. delta 超过 `MaxOutgoingCltvExpiry`，回 `FailExpiryTooFar`。

[`CheckHtlcForward`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L2554)、[`canSendHtlc`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L2676)

`canSendHtlc` 的两个时间检查：

```go
if timeout <= heightNow+l.cfg.OutgoingCltvRejectDelta { ... }
if timeout > l.cfg.MaxOutgoingCltvExpiry+heightNow { ... }
```

前者防止“刚发出就过期”，后者防止“资金被锁到很远的未来”。`DefaultMaxOutgoingCltvExpiry = 2016`，约两周。[`link.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L40)

### 6.3 费用暴露与 dust {#fee-exposure}

`DefaultMaxFeeExposure = 500,000 sat`（`500_000_000 msat`）。[`switch.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/switch.go#L88)

`exceedsFeeExposureLimit` 在“最坏费用率”下计算：

```text
totalLocalDust  = localDustSum  + localCommitFee
totalRemoteDust = remoteDustSum + remoteCommitFee
if total > MaxFeeExposure -> 拒绝新 HTLC
```

[`exceedsFeeExposureLimit`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L2298)

`isOverexposedWithHtlc` 还会对“即将加入的 HTLC”做 dry-run：如果它是 dust，就把金额计入 dust sum；如果不是 dust，就把新增重量对应的费用计入。这样可以在 HTLC 进入 commitment 之前就拒绝，而不是等费用尖峰到来才发现输出被 trim。

[`isOverexposedWithHtlc`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L2349)

**数值例子（legacy、非 anchor、费率 10 sat/vB = 2,500 sat/kw）：**

| 项目 | 重量 | 费用 |
| --- | --- | --- |
| commitment tx | 724 | `2500 * 724 / 1000 = 1,810 sat` |
| HTLC timeout 第二层 | 663 | `2500 * 663 / 1000 = 1,657 sat` |
| HTLC success 第二层 | 703 | `2500 * 703 / 1000 = 1,757 sat` |

费用按 BOLT03 向下取整。[`FeeForWeight`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/chainfee/rates.go#L75)

`HtlcIsDust` 的判定是 `htlcAmt - htlcFee < dustLimit`。[`HtlcIsDust`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L2757)

- 2,000 sat 的 HTLC：`2000 - 1657 = 343 < 546` → dust，被 trim；链上无法单独认领。
- 5,000 sat 的 HTLC：`5000 - 1657 = 3343 > 546` → 非 dust，可认领。
- 费率升到 100 sat/vB（25,000 sat/kw）时，HTLC timeout 费用 = 16,575 sat；17,000 sat 的 HTLC 变成 dust（`17000 - 16575 = 425 < 546`）。

> 这里假设 dust limit = 546 sat（BOLT02 常见值）；实际值由双方在 `open_channel` / `accept_channel` 中协商，LND 会用 `DustLimitForSize` 校验范围。

> **anchor 频道不同：** anchor 频道使用 zero-fee 第二层 HTLC 交易（`ZeroHtlcTxFee`），`HtlcTimeoutFee` / `HtlcSuccessFee` 返回 0，dust 判定不再扣第二层费用；费用由 commitment fee 和 CPFP 承担。默认 anchor commitment 费用率上限是 10 sat/vB。[`HtlcTimeoutFee`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L510)、[`DefaultAnchorsCommitMaxFeeRateSatPerVByte`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/commitment.go#L27)

> **边界：** `MaxFeeExposure` 是绝对值，不是比例。对 1 BTC 频道，500,000 sat 是 50%；对小频道，它可能超过容量，因此还会被 reserve 和 balance 检查进一步约束。它限制的是“对方能让你暴露多少”，不保证“费率尖峰不会让已有 HTLC 变 dust”。

### 6.4 Ping、onion message、gossip {#dos}

**Ping 洪水。** `peer/ping_limits.go`：

- `pingFloodRate = 10/s`；
- `pingFloodBurst = 200`；
- 每个 Pong 字节按 `6554` 字节/token 计费，最大 65,531 字节的 Pong 约 10 token；
- 超过 `MaxPongBytes` 的请求按 BOLT1 不回复，但仍消耗 1 token。

[`ping_limits.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/peer/ping_limits.go)

**Onion message。** v0.21.0 加入两层限速 + 频道存在性门：

- 每 peer：默认 0.5 Mbps，256 KiB burst；
- 全局：默认 5 Mbps，1600 KiB burst；
- 没有“至少一个完全打开频道”的 peer，消息在入口丢弃；pending channel 不算；
- `--onion-msg-relay-all` 可以跳过存在性门，但限速仍然生效。

[`release notes 0.21.0`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/docs/release-notes/release-notes-0.21.0.md)、[`docs/onion_message_rate_limiting.md`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/docs/onion_message_rate_limiting.md)

**Gossip。** 每个 channel + direction 一个 token bucket：

- `DefaultMaxChannelUpdateBurst = 10`；
- `DefaultChannelUpdateInterval = 1m`；
- `DefaultBanThreshold = 100`，ban 48h，最多 10,000 个被 ban 的 pubkey；
- `maxPrematureUpdates = 100`，防止提前更新无限堆积。

[`gossiper.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/discovery/gossiper.go#L48)、[`ban.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/discovery/ban.go#L17)

**版本边界：**

| 版本 | 变化 | 安全含义 |
| --- | --- | --- |
| `v0.21.0` | onion message 限速 + 频道存在性门 | 免费 Sybil 不能再无限转发 onion message |
| `v0.21.3` | 入站 ping 回复限速、出站队列增长上限 | 防止 peer 控制的资源耗尽 |
| `v0.21.4` | 每个合法入站 Ping 都回复 | 限速边界改为“断开连接”，而不是静默丢弃 |
| `v0.21.6` | 关闭 MPTCP 监听 | 关闭 CVE-2026-98432 在 LND 进程内的可达路径 |
| `v0.21.8` | 多项底层修复 + restored channel force close 拒绝 | 降低状态持久化/关闭流程的边界错误 |

## 7. 密钥、RPC 与运维边界 {#rpc}

### 7.1 Brontide：没有 PKI 的传输层 {#brontide}

Brontide 是 Noise XK：

- 协议名 `Noise_XK_secp256k1_ChaChaPoly_SHA256`；
- ActOne/ActTwo 各 50 字节，ActThree 66 字节；
- 握手读超时 5 秒；
- 每 1,000 条消息轮换密钥；
- 单条消息最大 65,535 + 16 字节 MAC；
- 2 字节加密长度头；
- 读超时 5 秒，空闲 5 分钟断开。

[`brontide/noise.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/brontide/noise.go#L20)、[`peer/brontide.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/peer/brontide.go#L64)

安全含义：

- 身份认证 = 静态公钥；加密 = 临时 ECDH，具备前向保密；
- 没有证书链，也就没有“CA 被攻破”的问题；
- 但也没有“名字绑定”：你必须在配置/地址簿里知道对方的 node pubkey，否则容易连到错误节点（这是社交层/地址层的风险）。

### 7.2 TLS 与 gRPC：加密不等于认证 {#tls}

LND 的 RPC TLS 是自签名证书：

- P-256 ECDSA，`IsCA: true`，可配置有效期；
- `MinVersion: TLS 1.2`；
- 不要求客户端证书；
- gRPC 认证靠 macaroon，而不是 TLS 客户端证书。

[`cert/selfsigned.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/cert/selfsigned.go#L202)、[`TLSConfFromCert`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/cert/tls.go#L97)

REST gateway 在内部 dial 自己的本地监听时使用 `InsecureSkipVerify: true`，因为目标是本机 listener，且证书可能是 Let's Encrypt 或临时证书；这不是公网 listener 的配置。[`tls_manager.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/tls_manager.go#L152)

> **常见误判：** “我开了 TLS，所以 RPC 安全”。TLS 只保护传输；如果 macaroon 泄露，攻击者仍可在自己的 TLS 连接里使用它。反过来，macaroon 是 bearer token，不绑定设备，除非你加了 IP/超时 caveat。

### 7.3 Macaroon：能力令牌，不是密码 {#macaroon}

`CheckMacAuth` 检查：

- macaroon 版本必须是 V2；
- ID 长度至少 1，首字节必须是 bakery V3；
- 权限是否覆盖请求的 `requiredPermissions`；
- caveat（超时、IP 范围、自定义）是否满足；
- 特殊权限 `uri:<FullMethod>` 作为兜底。

[`CheckMacAuth`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/macaroons/service.go#L207)

默认生成三个文件：

| 文件 | 权限 | 能力 |
| --- | --- | --- |
| `admin.macaroon` | `0640` | read + write 全集；可开/关频道、发支付、连 peer、导出备份、bake 新 macaroon |
| `readonly.macaroon` | `0644` | onchain/offchain/address/message/peers/info/invoices/signer 的 read |
| `invoice.macaroon` | `0644` | invoices read/write、address read/write、onchain read |

[`genDefaultMacaroons`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnd.go#L840)、[`adminMacaroonFilePermissions`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnd.go#L53)

> **一个容易忽略的本地暴露：** `readonly.macaroon` 和 `invoice.macaroon` 默认是 `0644`，同机其他用户可读；`admin.macaroon` 是 `0640`。在多用户主机上，readonly 足以枚举频道、节点、发票和链上地址；invoice 还能创建发票。不要把“不是 admin”当成“没有敏感信息”。

根密钥用钱包密码加密（`snacl`），存在 `macrootkeys` bucket；`CreateUnlock` 用密码解开。macaroon 本身不包含根密钥，泄露的 macaroon 不能反推根密钥，但可以直接使用直到根密钥轮换。[`macaroons/store.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/macaroons/store.go#L22)

### 7.4 暴露面与默认监听 {#exposure}

默认只监听 `localhost`：

- RPC：`localhost:10009`；
- REST：`localhost:8080`；
- P2P：`localhost:9735`（除非显式配置外部地址）。

[`config.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/config.go#L1643)

`EnforceSafeAuthentication` 会拒绝“公网接口 + `--no-macaroons`”和“公网接口 + `--no-rest-tls`”：

```text
detected RPC server listening on publicly reachable interface ... with
authentication disabled! Refusing to start with --no-macaroons specified
```

[`EnforceSafeAuthentication`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lncfg/address.go#L52)

但仍有几个边界：

- **gRPC 最大消息 200 MiB。** [`lnrpc/metadata.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnrpc/metadata.go#L18)。一个被盗的 admin macaroon 可以发大请求；RPC 层没有按方法限速。
- **`--no-macaroons` 只检查“公网/私网/loopback”分类。** 如果地址分类不符合预期（例如容器网络、代理），需要自己复核。
- **macaroon 不绑定进程。** 备份文件、日志、CI、监控采集器都可能泄露它；用 `lncli bakeMacaroon --ip_address` / `--timeout` 缩小能力。
- **admin 能导出 SCB。** 这既是恢复能力，也是泄露面：SCB 加密依赖种子，但结合种子泄露就会扩大影响。

## 8. 备份与恢复：SCB 的边界 {#scb}

### 8.1 SCB 里到底有什么 {#scb-content}

`Single.Serialize` 写入：

- `IsInitiator`、`ChainHash`、`FundingOutpoint`、`ShortChannelID`；
- `RemoteNodePub`、`Addresses`、`Capacity`；
- 本地 `CsvDelay`；
- 本地 key locator：`MultiSigKey`、`RevocationBasePoint`、`PaymentBasePoint`、`DelayBasePoint`、`HtlcBasePoint`；
- 远端公钥：`MultiSigKey`、`RevocationBasePoint`、`PaymentBasePoint`、`DelayBasePoint`、`HtlcBasePoint`；
- shachain 根：legacy 格式写公钥，新格式写 key locator；
- lease 频道的 `LeaseExpiry`（如果适用）。

[`Single.Serialize`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanbackup/single.go#L352)

它**不包含**：

- 当前 commitment tx；
- revocation log；
- 每个 HTLC 的金额/脚本/索引；
- 当前余额和 pending 更新。

`PackToWriter` 用 `lnencrypt.KeyRingEncrypter(keyRing)` 加密；密钥由钱包根派生。SCB 文件离开种子不可解密。[`PackToWriter`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanbackup/single.go#L514)

`SubSwapper` 在频道更新时重写 multi 文件，使用临时文件 + 原子替换；它还会把磁盘上已有的 SCB 与内存中的新状态合并，避免丢失未关闭的频道。[`updateBackupFile`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanbackup/pubsub.go#L251)

### 8.2 恢复流程：外壳、DLP、等待 {#scb-restore}

`openChannelShell`：

1. 用 key locator 重新派生本地五个密钥；
2. 恢复 shachain 根：
   - legacy：从 `ShaChainRootDesc` 派生私钥，取其序列化字节作为根；
   - 新格式：用 `ShaChainRootDesc` 私钥与本地 multisig 公钥做 ECDH，得到根；
3. 根据 SCB 版本确定 channel type；
4. 创建 `ChannelShell`，标记 `ChanStatusRestored`，没有 commitment tx。

[`openChannelShell`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/chanrestore.go#L49)

恢复后：

- `Recover` 连接 peer；
- `ProcessChanSyncMsg` 看到 `isRestoredChan`，直接走本地数据丢失分支；如果对方提供了恢复选项，返回 `ErrCommitSyncLocalDataLoss`，携带对方的 `LocalUnrevokedCommitPoint`；否则返回 `ErrCannotSyncCommitChains`；
- `handleChanSyncErr` 调用 `MarkDataLoss`，**不 force close**；
- 对方 force close 后，`handleKnownLocalState` / `handleKnownRemoteState` 对 restored channel 直接返回 false；
- `handleUnknownRemoteState` 用 commit point 扫本地输出，传入空 `ChannelCommitment{}`，注释明确写着“无法恢复任何 HTLC 资金”；
- `rpcserver.go` 拒绝对 `ChanStatusRestored` 或 `ChanStatusLocalDataLoss` 的 coop/force close。

[`ProcessChanSyncMsg`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/lnwallet/channel.go#L4451)、[`handleChanSyncErr`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/htlcswitch/link.go#L1278)、[`handleUnknownRemoteState`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/contractcourt/chain_watcher.go#L1230)、[`rpcserver.go`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/rpcserver.go#L2791)

### 8.3 SCB 能恢复什么，不能恢复什么 {#scb-limits}

| 能力 | SCB 恢复 | 说明 |
| --- | --- | --- |
| 识别频道、连接 peer | ✅ | funding outpoint、remote pub、地址 |
| 重新派生本地密钥 | ✅ | key locator + 种子 |
| 重新派生 shachain 根 | ✅ | legacy 或 ECDH |
| 主动 force close | ❌ | 没有当前 commitment tx；RPC 明确拒绝 |
| 惩罚对方广播的旧状态 | ❌ | 没有 revocation log，不会进入 breach 分支 |
| 取回本地主输出 | ✅（条件） | 对方 force close 后，DLP + commit point |
| 取回 HTLC | ❌ | 空 commitment，注释明确 |
| 恢复在途支付 | ❌ | 没有 HTLC 状态 |

> **结论：SCB 是“请对方关闭，然后取回我的主输出”的最后手段，不是频道状态的备份。** 它不能替代 `channel.db`，也不能替代看门狗；它甚至不能保证你能主动退出——如果对方永远不 force close，你只能等。

### 8.4 运维建议 {#scb-ops}

1. **分开备份种子和 SCB。** SCB 加密依赖种子；放在同一个地方等于没加密。
2. **定期测试恢复。** 在 regtest 上走一遍“SCB 恢复 → 连接 peer → 对方 force close → 本地输出被扫”的流程。
3. **监控 `ChanStatusRestored` / `ChanStatusLocalDataLoss`。** 这些频道不能正常关闭，需要人工介入。
4. **不要把 restored channel 当成正常频道继续使用。** `AdvanceCommitChainTail` 会返回 `ErrNoRestoredChannelMutation`；v0.21.8 也拒绝其 force close。
5. **看门狗和 SCB 互补，但不重叠。** SCB 恢复主输出；看门狗惩罚旧状态的主输出；HTLC 仍然依赖本地 revocation log 和在线惩罚。

## 9. 复现实验 {#experiments}

### E1：shachain 揭示窗口（已执行） {#e1}

**目的：** 验证“揭示第 `h` 个 secret 后，可以查更早的 secret，但不能查 `h+1`”。

**环境：** macOS，Go 1.26.10，LND `v0.21.8-beta` 的本地 sparse checkout（提交 `59dd7908`）。

**代码：**

```go
package shachain

import (
	"crypto/sha256"
	"testing"

	"github.com/btcsuite/btcd/chaincfg/chainhash"
)

func TestSecurityExperiment_RevealWindow(t *testing.T) {
	root := chainhash.Hash(sha256.Sum256([]byte("lnd-v0.21.8-security-experiment")))
	producer := NewRevocationProducer(root)
	store := NewRevocationStore()

	const revealed = 8
	for h := uint64(0); h < revealed; h++ {
		secret, err := producer.AtIndex(h)
		if err != nil {
			t.Fatalf("AtIndex(%d): %v", h, err)
		}
		if err := store.AddNextEntry(secret); err != nil {
			t.Fatalf("AddNextEntry(%d): %v", h, err)
		}
	}

	for h := uint64(0); h < revealed; h++ {
		got, err := store.LookUp(h)
		if err != nil {
			t.Fatalf("LookUp(%d) unexpectedly failed: %v", h, err)
		}
		want, _ := producer.AtIndex(h)
		if !got.IsEqual(want) {
			t.Fatalf("LookUp(%d) mismatch", h)
		}
	}

	if _, err := store.LookUp(revealed); err == nil {
		t.Fatalf("LookUp(%d) succeeded, but that secret was never revealed", revealed)
	}

	single := NewRevocationStore()
	first, _ := producer.AtIndex(0)
	if err := single.AddNextEntry(first); err != nil {
		t.Fatal(err)
	}
	if _, err := single.LookUp(1); err == nil {
		t.Fatalf("secret 0 revealed secret 1")
	}
	t.Logf("PASS: revealed=%d, lookup[0..%d]=ok, lookup[%d]=denied, secret0 does not reveal secret1",
		revealed, revealed-1, revealed)
}
```

**命令与输出：**

```text
$ go test ./shachain -run TestSecurityExperiment_RevealWindow -v
=== RUN   TestSecurityExperiment_RevealWindow
    security_experiment_test.go:54: PASS: revealed=8, lookup[0..7]=ok, lookup[8]=denied, secret0 does not reveal secret1
--- PASS: TestSecurityExperiment_RevealWindow (0.00s)
PASS
ok  	github.com/lightningnetwork/lnd/shachain	0.527s
```

**证明：** 在 v0.21.8 的 `shachain` 实现中，已揭示 secret 的 `LookUp` 成功，未揭示的下一个 secret 失败；单个 secret 不能推出下一个。

**不证明：** 不证明违约惩罚端到端可用；不证明 `RevocationStore` 在磁盘上的序列化/恢复；不证明与其他实现互操作。

### E1b：揭示方向（已执行） {#e1b}

E1 的 store 测试按 0..7 的顺序插入，能证明“已揭示的都能查”，但没有单独证明“较晚的 secret 可以推出较早的”。补一个直接针对 `element.derive` 的测试：

```go
func TestSecurityExperiment_Direction(t *testing.T) {
	root := chainhash.Hash(sha256.Sum256([]byte("lnd-v0.21.8-security-direction")))
	p := NewRevocationProducer(root)

	later, err := p.root.derive(newIndex(7))
	if err != nil {
		t.Fatal(err)
	}
	for h := uint64(0); h < 7; h++ {
		got, err := later.derive(newIndex(h))
		if err != nil {
			t.Fatalf("later(7) -> earlier(%d) failed: %v", h, err)
		}
		want, _ := p.AtIndex(h)
		if !got.hash.IsEqual(want) {
			t.Fatalf("later(7) -> earlier(%d) mismatch", h)
		}
	}

	earlier, _ := p.root.derive(newIndex(3))
	if _, err := earlier.derive(newIndex(7)); err == nil {
		t.Fatalf("earlier(3) derived later(7), direction is broken")
	}
	t.Logf("PASS: secret7 -> secrets[0..6] ok; secret3 -/-> secret7")
}
```

```text
$ go test ./shachain -run TestSecurityExperiment_Direction -v
=== RUN   TestSecurityExperiment_Direction
    security_direction_test.go:36: PASS: secret7 -> secrets[0..6] ok; secret3 -/-> secret7
--- PASS: TestSecurityExperiment_Direction (0.00s)
PASS
ok  	github.com/lightningnetwork/lnd/shachain	0.845s
```

**证明：** 较晚的 secret 能推出更早的 secret，较早的 secret 不能推出更晚的。方向与“对方撤销状态时只揭示当前 secret，不暴露未来状态”一致。

### E2：源码断言（已执行） {#e2}

**目的：** 把文中的常量、分支和顺序变成可重跑的检查，避免“读起来像，实际不是”。

**方法：** 对固定 checkout 执行 51 条 `grep -F` 断言，覆盖：

- brontide 协议名、密钥轮换、握手超时；
- ping 限速、空闲超时；
- 483 / 966 / 2016 / 500,000 sat / 10 sat/vB / 253 sat/kw；
- 最小频道 20,000 sat、wumbo 1e9 sat、max pending channels 1；
- reserve ≤ 20%、CSV delay ≠ 0、max accepted HTLCs ≤ 483；
- TLS 1.2、公网 no-auth 拒绝、admin 0640 / read/invoice 0644；
- 撤销点校验、secret 在检查后写入、breach 需要 revocation log；
- restored channel 跳过 known remote、未知状态不恢复 HTLC；
- DLP 条件与 `MarkDataLoss`；
- watchtower hint 16 字节、key = SHA256(txid||txid)；
- SCB 由 keyring 加密、保存 shachain locator；
- 撤销 witness 选择分支 1；
- CLTV 最小/最大/绝对上限、fee exposure 上限；
- gossip burst/interval/ban threshold；
- onion peer 限速参数；
- final CLTV 上限为 `MaxUint16`。

脚本：[security_assertions.sh](/examples/lightning-security/security_assertions.sh)；运行说明：[README](/examples/lightning-security/README.md)。

**结果：** `pass=51 fail=0 total=51`。

**脚本哈希：** `58e216e2f4049a29790f7e5bbab286f421d79a25da5bd4588a5c4edcdb7882c2`（`shasum -a 256 security_assertions.sh`）。

**证明：** 这些字符串/常量确实存在于该提交的对应文件；分支顺序与文中描述一致。

**不证明：** 不证明运行期行为、不证明这些分支在特定输入下一定被触发、不证明没有其他绕过路径。

### E3：regtest 违约演练（未执行） {#e3}

**目标：** 观察“旧状态广播 → 对方 justice tx → 主输出和 HTLC 输出被扫”的完整链路。

**建议步骤：**

1. 启动 `bitcoind -regtest`，两个 LND 节点（Alice/Bob），建立 1,000,000 sat 频道；
2. 制造若干 HTLC（例如 5,000 sat、20,000 sat），让状态推进到 `N`；
3. 在 Alice 侧备份 `channel.db`（状态 `N`），继续推进到 `N+1`（Bob 已撤销 `N`）；
4. 停止 Alice，恢复状态 `N` 的 `channel.db`，启动并 force close；
5. 观察 Bob 的 `breach_arbitrator` 日志、justice tx、输出金额；
6. 重复“先让对方花掉一个 HTLC 输出”的变体，观察 `updateBreachInfo` / `convertToSecondLevelRevoke`。

**风险与边界：**

- 旧 `channel.db` 可能触发本地数据丢失保护，拒绝 force close；需要确认 `ChanStatus` 与 `channel_reestablish` 行为。
- 这不是主网演练；regtest 的费率、确认深度和 mempool 策略不同。
- 需要额外验证 SCB-only 恢复不会进入 breach 分支（E3 的对照实验）。

**状态：** 未执行；本文不把上述结果写成实测。

### E4：watchtower 端到端（未执行） {#e4}

**目标：** 验证“塔只扫主输出、不扫 HTLC”的边界。

**建议步骤：**

1. 启动 `watchtower` 和 `wtclient`，建立会话（`DefaultRewardRate=1%`，`DefaultSweepFeeRate=2500 sat/kw`）；
2. 让客户端提交若干 revoked state 的 blob；
3. 触发违约，观察塔的 `processEpoch` 匹配、解密、`Punish`；
4. 检查 justice tx 的输入：应只有 `to_local` / `to_remote`，没有 HTLC 输出；
5. 对照本地 breach arbitrator 的 `spendAll`：应包含 HTLC 输入。

**状态：** 未执行；本文只根据 `JusticeKit` 接口和 `createJusticeTx` 的分组给出源码结论。

## 10. 工程取舍与检查清单 {#tradeoffs}

### 10.1 为什么这样设计 {#why}

- **为什么要 CSV 延迟？** 给诚实方时间发现违约并广播 justice tx。延迟越长，惩罚窗口越大，但资金退出越慢。
- **为什么要 revocation log？** 仅有 secret 不足以重建“当时有哪些 HTLC、在哪个输出”。日志是惩罚的证据；代价是存储随状态增长。
- **为什么要看门狗？** 本地节点可能离线。塔用“预签名 + 加密 + txid 派生 key”在不托管资金的前提下提供可用性。
- **为什么看门狗不扫 HTLC？** 信息最小化：塔只需要主输出即可完成主要经济保护；HTLC 的脚本和签名更多、更敏感，交给本地节点更合适。
- **为什么有绝对上限（2016 CLTV、500k sat fee exposure、483 HTLC）？** 这些是 DoS 边界，不是经济保证。它们让攻击者不能用一个连接/一笔 HTLC 无限占用资源，但不阻止有资金的攻击者做长期博弈。
- **为什么 SCB 不能 force close？** 它没有当前 commitment tx；强行用旧状态关闭会触发对方的惩罚。LND 选择“等待对方关闭 + DLP”，这是保守但安全的路径。

### 10.2 运维检查清单 {#checklist}

**版本与依赖**

- [ ] 使用 `v0.21.8-beta` 或更新版本；Linux 上确认 MPTCP 已关闭（`ss -Mlnp | grep lnd` 应为空）。
- [ ] 记录实际运行的 commit；不要把“最新 release”当成“已审计”。

**备份与恢复**

- [ ] 种子与 `channel.backup` 分开存放；定期验证解密。
- [ ] 在 regtest 上演练 SCB 恢复；确认 restored channel 不会被误用。
- [ ] 监控 `ChanStatusRestored`、`ChanStatusLocalDataLoss`、`BreachClose`。

**看门狗**

- [ ] 至少一个独立塔；检查会话策略、奖励、费用率、`MaxUpdates`。
- [ ] 确认塔的链后端健康；监控 `lookout` 高度与惩罚广播。
- [ ] 不要假设塔会保护 HTLC；HTLC 仍依赖本地在线和 revocation log。

**RPC 与 macaroon**

- [ ] RPC/REST 只监听 loopback 或受控私网；不要把 10009/8080 暴露到公网。
- [ ] 检查 `admin.macaroon` 权限为 `0640`；多用户主机上收紧 `readonly`/`invoice` 的 `0644`。
- [ ] 使用 `lncli bakeMacaroon --ip_address` / `--timeout` 缩小能力；定期轮换根密钥。
- [ ] 不要把 macaroon 放进日志、CI 变量、监控采集器。

**转发参数**

- [ ] 明确设置 `--max-cltv-expiry`、`--channel-max-fee-exposure`、`--maxpendingchannels`。
- [ ] 监控 `ForwardingHistory` 的失败码分布；`FailFeeInsufficient` / `FailExpiryTooFar` / `FailTemporaryChannelFailure` 突增可能是探测或攻击。
- [ ] 对 onion message 限速参数做容量规划；`--onion-msg-relay-all` 只在你明确需要时开启。

### 10.3 哪些是源码证明，哪些是推断 {#evidence}

| 结论 | 证据类型 | 边界 |
| --- | --- | --- |
| 撤销密钥 = f(base, commit point) | 源码 + 代数 | 不证明所有实现一致 |
| shachain 单向揭示 | 源码 + E1 运行 | 不证明磁盘序列化/恢复 |
| 违约需要 revocation log | 源码分支 | 不证明所有历史版本行为 |
| 看门狗只扫主输出 | `JusticeKit` 接口 + `createJusticeTx` 分组 | 不证明塔的实现没有额外逻辑 |
| SCB 不能 force close / 不能惩罚 | 源码 + RPC 拒绝 | 不证明特定旧版本行为 |
| 默认上限（483/966/2016/500k） | E2 断言 | 不证明运行期一定触发 |
| 费率尖峰导致 dust | 源码公式 + 手算 | 不证明特定 mempool/确认结果 |
| MPTCP 修复 | release notes | 不证明内核补丁已安装 |

## 11. 相关阅读与资料 {#sources}

- BOLT #2（channel negotiation）、#3（commitment transactions）、#4（onion routing）、#5（recommendations）：[lightning/bolts](https://github.com/lightning/bolts)
- LND [`SECURITY.md`](https://github.com/lightningnetwork/lnd/blob/59dd7908b33710b511c960d848ecb24c47916c3a/SECURITY.md)
- LND release notes：`docs/release-notes/`（0.21.0、0.21.3、0.21.4、0.21.6、0.21.8）
- LND onion message 限速说明：`docs/onion_message_rate_limiting.md`
- 站内相关：[比特币：实现与验证](../bitcoin/impl/min-validator.md)、[Solana：账户与数据路径](../solana/data-path.md)、[并行执行](/html-pages/blockchain/parallel-execution/index.html)
- 可视化导读：[Lightning 安全：违约与恢复](/html-pages/blockchain/lightning-security/index.html)

> **最后提醒：** 本文是源码与机制分析，不是审计报告。任何生产部署都应在固定 commit 上重新核对行号、参数和运行时行为，并在隔离环境完成恢复/违约演练后再上线。

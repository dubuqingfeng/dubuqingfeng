---
title: Bitcoin
slug: /wiki/blockchain/bitcoin
---

这里汇总了与 Bitcoin 相关的技术笔记与实现要点，风格参考 Go 语言 Wiki 的“结构化+要点+短代码片段”，覆盖交易/脚本/隔离见证/Taproot/区块与 PoW/网络与中继/钱包与 PSBT/实现建议等。

## 地址 Address

- [地址概览](./address/address.md)
- [P2PKH](./address/p2pkh.md)
- [P2SH](./address/p2sh.md)
- [SegWit](./address/segwit.md)
- [Taproot / P2TR](./address/p2tr.md)

## 交易与 UTXO

- [交易结构与序列化](./transaction/structure.md)
- [签名哈希与 SIGHASH](./transaction/sighash.md)
- [时间锁与相对锁定](./transaction/locktime.md)
- [交易手续费脚本示例](./transaction/fee.md)

## 地址 Address

- [地址概览](./address/address.md)
- [P2PKH](./address/p2pkh.md)
- [P2SH](./address/p2sh.md)
- [SegWit（v0）](./address/segwit.md)
- [Taproot / P2TR（v1）](./address/p2tr.md)

## 脚本与签名 Script

- [脚本系统概览](./script/overview.md)
- [标准性（Policy）与共识](./script/standardness.md)
- [Tapscript 进阶](./script/tapscript.md)

## 区块与 PoW

- [区块头与目标难度](./block/header.md)
- [PoW 与难度调整](./block/pow.md)
- [Merkle 树与见证承诺](./block/merkle.md)
- [紧凑区块（BIP152）](./block/compact.md)

## 网络与中继

- [P2P 协议与消息](./network/p2p.md)

## 内存池与策略

- [Mempool 与中继策略](./policy/mempool.md)

## 钱包与协作

- [HD 钱包（BIP32/39/44/84/86）](./wallet/hd.md)
- [PSBT 规范与实践](./wallet/psbt.md)
- [输出描述符与 Miniscript](./wallet/descriptor.md)

## 实现建议

- [最小验证器（从零到一）](./impl/min-validator.md)

## BIP 导航

- [关键 BIP 导航与分组](./bip/index.md)

---
title: Ethereum
slug: /wiki/blockchain/ethereum
---

这里整理 Ethereum 的执行层与协议细节，风格参考 Go Wiki 的“结构化+要点+短代码片段”。覆盖执行/共识分层、EVM 语义、状态与 Trie、交易类型与签名、EIP-1559 费用、区块与收据、事件日志、合约部署与预编译、RPC/网络与实现建议等。

## 架构与基础

- [执行层/共识层与 The Merge](./consensus/pos.md)
- [EVM 执行模型](./evm/evm.md)
- [预编译合约与成本](./evm/precompiles.md)
- [账户与地址](./address/address.md)
- [ABI 编码](./abi/abi.md)
- [ABI 进阶：动态类型与布局](./abi/advanced.md)

## 交易与费用

- [交易类型与封装（EIP-2718/2930/1559）](./transaction/types.md)
- [签名与 y-parity/链 ID（EIP-155）](./transaction/signing.md)
- [访问列表（EIP-2930）](./transaction/access-list.md)
- [EIP-1559 交易与手续费](./transaction/eip1559.md)
- [Blob 交易与 KZG（EIP-4844）](./transaction/eip4844.md)

## 状态、区块与日志

- [状态与 Merkle-Patricia Trie](./state/trie.md)
- [存储布局与 SSTORE 规则](./state/storage.md)
- [区块头与执行负载](./block/header.md)
- [收据与日志 Bloom](./block/receipts.md)

## 合约与标准

- [合约基础与资源](./contract/contract.md)
- [合约创建：CREATE/CREATE2](./contract/create-create2.md)
- [事件与日志（topics/filter）](./contract/events-logs.md)
- [ERC-20 标准](./token/erc-20.md)
- [ERC-721 标准](./token/erc-721.md)

## Gas 与网络

- [Gas 计费、退款与 BaseFee](./gas/gas.md)
- [Opcode 成本速查与内存扩展](./gas/opcode-costs.md)
- [devp2p 与同步（eth/66、snap）](./network/devp2p.md)
- [JSON-RPC 常用接口](./rpc/rpc.md)
- [网络与链 ID](./network/networks.md)

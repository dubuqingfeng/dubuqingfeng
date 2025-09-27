## 脚本系统概览（Script）

Bitcoin Script 是基于栈的、图灵不完备的连接语言。锁定脚本 `scriptPubKey` 与解锁脚本 `scriptSig/witness` 串接执行，最终需得到 TRUE。

### 设计目标

- 安全：无循环，限制操作数与脚本大小，防 DoS
- 可组合：通过模板与 OP 调度组合条件（哈希锁、时间锁、多签等）
- 向前兼容：为未来软分叉预留 `OP_SUCCESSx` 空间

### 常见模板

- P2PKH：`DUP HASH160 <20B> EQUALVERIFY CHECKSIG`
- P2SH：`HASH160 <20B> EQUAL`
- P2WPKH（v0）：`0 <20B>`（witness 携带签名+公钥）
- P2WSH（v0）：`0 <32B>`（witness 携带脚本与数据）
- P2TR（v1）：`OP_1 <32B>`（x-only tweaked key）

### 资源与限制

- 非见证脚本大小、栈深、操作次数限制
- 见证脚本（v0）独立的限制集合（更宽松且更合理）
- Tapscript 引入新的计费与限制规则（去除 CHECKMULTISIG 的“+1 bug”）

### 签名与校验

- ECDSA（历史）：严格 DER 编码、低 S 策略、RFC6979 随机数
- Schnorr（BIP340）：x-only 公钥、64B 签名、线性可加性便于聚合

### Go 伪代码：P2PKH 执行示意

```go
stack := [][]byte{}
// scriptSig: <sig> <pubkey>
// scriptPubKey: DUP HASH160 <20B> EQUALVERIFY CHECKSIG

push(sig); push(pubkey)
dup(); hash160(); push(pubkeyHash)
equalverify(); checksig(sig, pubkey)

// 若最终为 TRUE，验证通过
```

### 共识与策略（Policy）

- 共识：脚本语义与验证规则；所有节点必须一致
- 策略：中继与打包规则（如“标准脚本”、“低 S 值”等），不同版本可调节，不影响已上链交易的有效性


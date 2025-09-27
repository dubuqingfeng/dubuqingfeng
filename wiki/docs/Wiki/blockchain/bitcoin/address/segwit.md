## SegWit（隔离见证，v0）

隔离见证将签名/公钥等“见证数据”从交易基础数据中分离，带来两大改变：
- 消除第三方可塑性：`txid` 不再受 scriptSig 影响（wtxid 另计）
- 引入“区块权重”：`weight = base*4 + witness`，上限 4,000,000 WU

### 地址与脚本

- P2WPKH（v0，20B）：
  - scriptPubKey：`0 <20-byte HASH160(pubkey)>`
  - witness：`<signature> <pubkey>`
- P2WSH（v0，32B）：
  - scriptPubKey：`0 <32-byte SHA256(witnessScript)>`
  - witness：`<...满足 witnessScript 数据...> <witnessScript>`

注意：v0 地址使用 Bech32（BIP173），HRP 为 `bc/tb/bcrt`。

### 交易标记与 wtxid

- SegWit 交易多出 `marker=0x00, flag=0x01` 两字节；非见证路径可忽略
- txid：对“基础序列化（不含 witness）”双 SHA256
- wtxid：对“完整序列化（含 witness）”双 SHA256

### 见证承诺（Witness Commitment）

- coinbase 的 OP_RETURN 中包含 `wtxid_merkle_root` 的承诺（BIP141），将见证数据锚定到区块

### BIP143 签名哈希（v0 输入）

为修复覆盖范围与可塑性问题，v0 输入采用 BIP143 摘要：

```text
hashPrevouts  = Hash256( concat(all inputs' outpoints) )
hashSequence  = Hash256( concat(all inputs' sequences) )
hashOutputs   = Hash256( concat(all outputs) )

digest = Hash256(
  ser(version)||hashPrevouts||hashSequence||outpoint_i||
  scriptCode_i||value_i||sequence_i||hashOutputs||locktime||sighashType
)
```

实现重点：`scriptCode_i` 对 WPKH 为对应的“模板脚本”（非原始 scriptPubKey）；需包含被花费输出的金额 `value_i`。

### 费用与权重

- 费用以 vbytes 计价：`vbytes = ceil(weight/4)`
- 见证数据“折扣”：同体积 witness 相比 base 更便宜，有利于规模化签名数据

### 兼容过渡

- P2SH-P2WPKH：以 `3` 开头，scriptSig 仅携带 `redeemScript`，见证栈携签名与公钥
- P2SH-P2WSH：同理，redeemScript 为 `0 <32-byte SHA256(witnessScript)>`

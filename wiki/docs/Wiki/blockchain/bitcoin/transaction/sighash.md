## 签名哈希与 SIGHASH

签名哈希决定“签名覆盖的范围”。常见类型：`SIGHASH_ALL/NONE/SINGLE` 与 `ANYONECANPAY` 可组合。

### 传统（pre-SegWit）

- 摘要取决于脚本替换、输出子集、序列等细节，容易出错并引入 malleability
- `scriptCode` 需移除 `OP_CODESEPARATOR` 之后的字节；签名覆盖规则复杂

### SegWit v0（BIP143）

为修复覆盖不足与可塑性问题，引入三个预哈希域并加入金额：

```text
hashPrevouts  = Hash256( concat(all inputs' outpoints) )
hashSequence  = Hash256( concat(all inputs' sequences) )
hashOutputs   = Hash256( concat(all outputs) )

digest = Hash256(
  ser(version)||hashPrevouts||hashSequence||outpoint_i||
  scriptCode_i||value_i||sequence_i||hashOutputs||locktime||sighashType
)
```

注意：`scriptCode_i` 对 WPKH 不是原始 `scriptPubKey`，而是特定模板（DUP HASH160 … CHECKSIG）。

### Taproot / Tapscript（BIP341/342）

- 使用 BIP340 Schnorr 签名，x-only 公钥与 64B 签名
- 更灵活的签名哈希域，支持 key-path 与 script-path，不再使用 DER 编码
- 引入 `OP_CHECKSIGADD` 简化聚合与多签表达

关键要点：

- key-path 默认覆盖全部输入/输出；支持 annex、tapleaf/path、脚本版本等可选域
- script-path 需携带 control block 与 leaf 信息参与摘要

### SIGHASH 选择建议

- 一般转账：`SIGHASH_ALL`（默认）
- 多方协作/替换：可考虑 `ANYONECANPAY|SINGLE` 等高级组合，但需谨慎验证覆盖范围


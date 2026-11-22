## Tapscript（BIP342）

Tapscript 是 Taproot 的脚本语义更新，配合 Schnorr（BIP340）与 Taproot（BIP341）引入更简洁、可组合的脚本表达。

### 关键变化

- `OP_CHECKSIGADD`：每次校验累加 0/1 到计数器，便于灵活表达 M-of-N 多签
- 去除了 `CHECKMULTISIG` 的历史“+1 bug”与额外开销
- 引入 `OP_SUCCESSx` 作为软分叉扩展保留码
- 更新资源计费与限制：相较 v0 witness 更合理

### 脚本路径与控制块

- 花费脚本叶子时，witness 需提供：
  - `… <script> <control block>`
  - control block 包含：奇偶位 + 内部公钥 `P` + Merkle 路径（用于重构 Q 并验证 tweak）
  - `TapLeaf` 哈希：`tagged_hash("TapLeaf", ver || compact_size(len(script)) || script)`

### 多签示例（M-of-N 思路）

```text
<pk1> CHECKSIGADD <pk2> CHECKSIGADD ... <pkN> CHECKSIGADD <M> NUMEQUAL
```

每个签名成功后累加 1，最终与常量 M 比较相等。

### SIGHASH 与默认行为

- 使用 BIP340 签名与哈希域；默认覆盖全部输入/输出
- annex、tapleaf/path、script version 等可选域在 script-path 下参与摘要

### 实践要点

- 地址层面仍是 P2TR（Bech32m，x-only `Qx`）
- Tapscript 主要影响 script-path 的表达能力与验证语义
- 配合 Descriptors/Miniscript 可实现可审核、可组合的钱包策略


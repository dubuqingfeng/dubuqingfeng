## PSBT（BIP174/370/371）

PSBT 是“部分签名的 Bitcoin 交易”的标准容器，支持多方协作与离线签名。

### 版本与扩展

- v0（BIP174）：最初版本
- v2（BIP370）：字段与结构更清晰；推荐新实现使用
- Taproot 扩展（BIP371）：新增 Taproot 相关键值（如 tapLeafScript、tapBip32Derivations 等）

### 典型流程

1) 构造半成品交易与必要的 UTXO/脚本/金额信息
2) 参与方按需补充签名与公钥路径信息
3) 最终者 finalize 并提取原始交易 hex 广播

### 关键字段（v2）

- `PSBT_GLOBAL_UNSIGNED_TX`：未签名交易主体（v2 对应无 segwit 标记）
- `PSBT_IN_*`：每个输入的 UTXO、脚本、签名、BIP32 派生路径等
- `PSBT_OUT_*`：每个输出的脚本模板/策略信息

### Taproot 字段（BIP371）

- `tapKeySig`、`tapScriptSig`、`tapLeafScript`、`tapBip32Derivation`、`tapInternalKey` 等

### 实践建议

- 使用 Descriptors 描述输出模板，自动生成/校验 PSBT 所需数据
- 对外仅暴露必要信息，保留输入金额/脚本以便签名者安全校验


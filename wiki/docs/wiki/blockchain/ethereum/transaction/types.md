## 交易类型与封装（EIP-2718/2930/1559）

以太坊引入“Typed Transaction Envelope”（EIP-2718），不同类型以一个前缀字节区分：

- `0x00`：Legacy（未显式类型前缀，历史兼容）
- `0x01`：Access List（EIP-2930）
- `0x02`：EIP-1559（动态费用）

### Legacy vs 2930 vs 1559

- Legacy：`nonce, gasPrice, gas, to, value, data, v, r, s`
- 2930：在 Legacy 基础上加入 `accessList` 与 `chainId` 独立域（签名方式不同）
- 1559：`maxPriorityFeePerGas, maxFeePerGas, accessList` + 简化的 `v`（y-parity）

### 访问列表（EIP-2930）

- 预声明将访问的账户与存储 slot，可降低首次访问（冷访问）的 gas 成本
- 结构：`[{ address, storageKeys[] }, ... ]`

### RLP/SSZ 编码

- 交易主体采用 RLP（typed tx 在类型字节后跟随 RLP 编码）；共识层使用 SSZ（与 EL 分离）


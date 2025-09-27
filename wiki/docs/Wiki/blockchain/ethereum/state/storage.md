## 存储布局与 SSTORE 规则

Solidity 将状态变量映射到 32 字节对齐的 slot，映射与动态数组采用 `keccak(slot || key)`/`keccak(slot)` 派生位置。

### 布局要点

- 值类型打包：多个小于 32 字节的值可共用一个 slot（从高位向低位排列）
- 映射：`slot = keccak(key . slot_index)`（`.` 表示拼接并做 Keccak-256）
- 动态数组：
  - 长度存储于 `slot_index`
  - 数据起始于 `keccak(slot_index)`，元素顺序递增占用连续 slot

### SSTORE 成本与退款（随 EIP 演进）

- EIP-2200/EIP-3529 等调整了写入与退款规则
- 典型直觉：从 0 → 非 0 成本高；重写非 0 → 非 0 次高；非 0 → 0 有退款但上限受限
- 冷/热访问（EIP-2929）：首次访问账户/存储为冷，成本更高；后续变热更便宜

参考：Solidity 文档、EIP-2200、EIP-2929、EIP-3529


## Opcode 成本速查与内存扩展

本页汇总常用指令成本与内存扩展公式，便于估算 gas。实际数值随硬分叉/EIP 可能调整，请以客户端实现为准（Berlin/London/Shanghai/Dencun 之后的一般取值）。

### 访问冷热与附加成本（EIP-2929）

- 账户首次访问（BALANCE/EXT*CALL/CALL* 等）：额外“冷账户”成本 ≈ 2600，后续同交易内为“热”
- 存储槽首次访问（SLOAD/SSTORE）：额外“冷槽”成本 ≈ 2100；SLOAD 热读 ≈ 100

### 存储写入（EIP-2200/3529 摘要）

- 0 → 非 0：高成本（约 20k）
- 非 0 → 0：中成本（约 5k），并产生退款（EIP-3529 后约 4800，上限见退款规则）
- 非 0 → 非 0（不同值）：中成本（约 5k）
- 重写相同值（no-op）：低成本（≈ 100）
- 首次触达槽位另加“冷槽”成本（≈ 2100）

### 哈希与日志

- KECCAK256（SHA3）：基准 + 按 32 字节字数线性增长
- LOG0..LOG4：基准 + 每个 topic 额外成本 + data 每字节线性成本

### 调用族与账户创建

- CALL/STATICCALL/DELEGATECALL：基准调用成本 + 冷账户附加；转账（value>0）有额外成本
- 通过 CALL 向“新账户”转账会触发新建账户成本（约 25k），仅当账户此前不存在且转账后非空

### 算术/位运算（代表性）

- Verylow（≈3）：`ADD/SUB/AND/OR/XOR/NOT/SHL/SHR/SAR/ISZERO/...`
- Low（≈5）：`MUL/DIV/SDIV/MOD/SMOD/ADDMOD/MULMOD/SIGNEXTEND`
- EXP：`10 + 50 * 按指数字节数`（近似）

### 内存扩展公式

以“32 字为单位”的内存大小 `a`，内存成本函数：

```text
Cmem(a) = Gmemory * a + floor(a^2 / 512)
// Gmemory 通常为 3；扩展成本 = Cmem(a_new) - Cmem(a_old)
```

拷贝类指令（CALLDATACOPY/CODECOPY/EXTCODECOPY/RETURNDATACOPY）= 基准 + 每 32 字线性 + 内存扩展

### 退款与上限（EIP-3529）

- 退款计数器不超过“交易实际消耗 gas 的 20%”
- SELFDESTRUCT 退款被移除；SSTORE 清零退款显著降低（约 4800）

提示：以上为工程估算常用值/公式，精确表请参考客户端（geth、reth、nethermind）常量与 EIP 规范实现。


## Gas 计费、退款与 BaseFee（EIP-1559/2929/3529）

### 计费模型

- 指令执行：按 opcode 收费，内存扩展与哈希等成本较高
- 存储写入：SSTORE 成本与退款依赖旧/新值与访问冷热
- 外部调用：新建账户/冷账户访问有额外成本（EIP-2929）

### 退款（Refund）

- 删除存储或 SELFDESTRUCT（受限）可获得退款；EIP-3529 大幅下调退款上限
- 当块内累计退款不超过消耗 gas 的上限比例（例如 20%）

### EIP-1559 BaseFee

- 每块根据 `gasUsed` 相对 `target=gasLimit/2` 调整 baseFee：

```text
baseFee' = baseFee + floor(baseFee * (gasUsed - target) / target / 8)
```

- 用户支付：`min(maxFeePerGas, baseFee + maxPriorityFeePerGas)`；其中 baseFee 被销毁，小费给提议者

### 费用建议

- 发起交易：设置合理的 `maxPriorityFeePerGas`（可用 `eth_maxPriorityFeePerGas`）与足够高的 `maxFeePerGas`
- 批量/脚本：利用 `eth_feeHistory` 估算短期 baseFee 趋势；在高峰期考虑延迟提交


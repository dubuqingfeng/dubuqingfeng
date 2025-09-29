---
title: Gas 优化与可观察性
---

常见 Gas 优化技巧与测量手段。

- 使用不可变（`immutable`）/常量（`constant`）减少存储读。
- 合理布局存储，减少 `SSTORE` 次数；`unchecked` 包裹安全的加减。
- 事件日志 vs 存储：读路径权衡；批量写入与位运算压缩。
- 使用 Foundry/Hardhat 的 gas 报告、差分对比；基准与 Fuzz 结合。


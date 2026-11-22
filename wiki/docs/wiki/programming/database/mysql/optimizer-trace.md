---
title: Optimizer Trace 与执行计划诊断
---

使用 `OPTIMIZER_TRACE` 观察优化器决策过程，辅助复杂问题定位。

## 启用与获取

```sql
SET optimizer_trace='enabled=on';
SELECT ... -- 目标语句
SELECT TRACE FROM INFORMATION_SCHEMA.OPTIMIZER_TRACE\G
SET optimizer_trace='enabled=off';
```

## 关注要点

- 代价评估：各访问路径的 cost 比较、索引选择原因。
- where 子句简化与范围裁剪。
- join 顺序选择与策略（BNL/INLJ 等）。

## 配合工具

- 与 `EXPLAIN ANALYZE`（8.0）结合，观察真实行数与时间；纠偏统计信息。


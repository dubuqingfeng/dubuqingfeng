---
title: 批量写入与插入最佳实践
---

高效写入有助于减少小部件与合并压力。

## 批量与并行

- 使用多行 INSERT 或批量协议；控制批次大小（如 100k 行）。
- 并发写入考虑分区/分片分布，避免热点分区。

## 设置建议

- `max_insert_block_size`、`max_partitions_per_insert_block`、`replace_running_query`。
- `async_insert` + `wait_for_async_insert`。

## CSV/Parquet 导入

```sql
INSERT INTO t FORMAT CSV
1,2025-02-03,"click",1.0
```


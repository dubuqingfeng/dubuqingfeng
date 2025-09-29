---
title: 运维与性能调优
---

关键参数、慢日志与常见调优方向。

## 关键参数（示例）

- `innodb_buffer_pool_size`：内存命中率的核心；尽量覆盖热数据。
- `innodb_log_file_size`/`innodb_log_files_in_group`：Redo 日志吞吐与恢复成本平衡。
- `innodb_flush_log_at_trx_commit`：1（最安全，最慢）、2、0（更快但风险）。
- `max_connections`、`wait_timeout`：连接规模与资源。
- `tmp_table_size`/`max_heap_table_size`：临时表内存阈值。

## 慢查询日志

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.5; -- 500ms
```

- 定期统计 Top N 慢 SQL，结合 `EXPLAIN`/`OPTIMIZER_TRACE` 优化。

## 分区/分表/分库

- 分区表：降低单表体量，注意分区裁剪是否生效；谨慎跨分区查询。
- 垂直/水平拆分：在应用层保持路由与事务边界；跨库事务需补偿机制。

## 其他

- 建立性能基线（QPS/RT/CPU/IO/缓冲池命中率）；变更后对比回归。
- 避免长事务与大事务；定期清理历史数据与碎片。


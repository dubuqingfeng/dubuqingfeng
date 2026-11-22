---
title: 表引擎与 MergeTree 家族
---

常用表引擎与 MergeTree 家族特性对比。

## 常见引擎

- MergeTree：基础引擎，支持主键、分区、TTL、索引与高效合并。
- ReplacingMergeTree：同主键保留最新版本（基于版本列或 `_version`）。
- Summing/Aggregating/Collapsing：按主键聚合/折叠。
- Distributed：分布式路由与聚合。
- Kafka/Buffer/Memory：摄入队列/缓冲/内存表。

## 建表示例

```sql
CREATE TABLE events (
  user_id UInt64,
  ts DateTime,
  action LowCardinality(String),
  value Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(ts)
ORDER BY (user_id, ts)
TTL ts + INTERVAL 90 DAY
SETTINGS index_granularity = 8192;
```


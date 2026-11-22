---
title: Kafka 与物化视图摄入
---

通过 Kafka 引擎 + 物化视图实现流式摄入与落地。

## 示例

```sql
CREATE TABLE raw_kafka (
  user_id UInt64, ts DateTime, action String, value Float64
)
ENGINE = Kafka SETTINGS kafka_broker_list='k1:9092', kafka_topic_list='events', kafka_group_name='cg', kafka_format='JSONEachRow';

CREATE TABLE events (...)
ENGINE = MergeTree PARTITION BY toYYYYMM(ts) ORDER BY (user_id, ts);

CREATE MATERIALIZED VIEW mv TO events AS
SELECT user_id, ts, action, value FROM raw_kafka;
```

物化视图将 Kafka 行自动写入 MergeTree 目标表。


---
title: 分区/分片/副本
---

ClickHouse 的水平扩展与高可用依赖分区、分片与副本协作。

## 分区（Partition）

- 通过 `PARTITION BY` 定义；常用按月/日分区：`toYYYYMM(ts)`。
- 支持按分区级别 TTL 清理、ALTER 移动/合并分区。

## 分片与副本

- 分片（Shard）：水平分布到多台节点；通过 `Distributed` 引擎路由。
- 副本（Replica）：同一分片的冗余；`ReplicatedMergeTree` 通过 keeper 同步。

## 建表示例（复制）

```sql
CREATE TABLE events_rep (...)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/events', '{replica}')
PARTITION BY toYYYYMM(ts)
ORDER BY (user_id, ts);

CREATE TABLE events_dist AS events_rep
ENGINE = Distributed(cluster_name, db, events_rep, rand());
```


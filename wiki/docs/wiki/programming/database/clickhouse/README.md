---
title: ClickHouse
slug: /wiki/programming/database/clickhouse
---

这里整理 ClickHouse 的存储引擎、MergeTree 家族、分布式与实战优化。

## 架构与引擎

- [架构与概念](./architecture.md)
- [表引擎与 MergeTree 家族](./engines-mergetree.md)

## 数据组织与索引

- [主键/排序键与稀疏索引](./primary-index.md)
- [分区/分片/副本](./partitions-shards-replication.md)
- [二级跳过索引（bloom 等）](./skipping-indexes.md)

## 写入与导入

- [批量写入与插入最佳实践](./ingestion.md)
- [Kafka/Materialized View 流式摄入](./kafka-mv.md)

## 查询与聚合

- [聚合函数与近似统计](./aggregations-approx.md)
- [JOIN 策略与设置](./joins.md)

## 运维与优化

- [TTL/Mutation 与删除](./ttl-mutations.md)
- [压缩/Codec 与存储](./compression-codecs.md)
- [备份/快照与恢复](./backup-restore.md)
- [系统表与监控](./system-monitoring.md)


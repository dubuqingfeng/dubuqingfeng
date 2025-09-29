---
title: MySQL
slug: /wiki/programming/database/mysql
---

这里汇总与 MySQL 相关的知识、笔记与实践，便于快速导航与扩展。

## 索引与存储结构

- [B+ 树索引](./b+tree.md)
- InnoDB 索引类型：聚簇索引、二级索引、覆盖索引、前缀索引
- 数据页结构、页分裂与合并、缓冲池（Buffer Pool）
- [索引设计与最佳实践](./index-design.md)
- [InnoDB 缓冲池与页结构](./buffer-pool.md)

## 事务与隔离

- [事务与隔离级别/MVCC](./transaction-isolation.md)
- [死锁复现与诊断](./deadlock-case-study.md)

## 锁与并发控制

- [锁类型与并发控制](./locks.md)

## 执行计划与优化

- [EXPLAIN 与查询优化](./explain-optimization.md)
- [Optimizer Trace 与诊断](./optimizer-trace.md)

## 复制与高可用

- [复制、GTID 与高可用](./replication-ha.md)

## 备份与恢复

- [备份与时间点恢复（PITR）](./backup-restore.md)

## 运维与性能

- [运维与性能调优](./ops-tuning.md)

## 字符集与排序规则

- [Charset/Collation](./charset-collation.md)

保持与 Go/Rust 目录风格一致，按需补充子页面与链接。

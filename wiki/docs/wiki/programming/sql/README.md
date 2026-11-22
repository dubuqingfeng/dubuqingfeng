---
title: SQL
slug: /wiki/programming/sql
---

这里整理通用 SQL（以 ANSI/ISO 为主）的语法与实践，兼顾主流引擎差异与调优思路。

## 语言基础

- [SQL 基础与语法](./basics/syntax.md)
- [数据类型与约束](./basics/types-constraints.md)

## 查询与表达

- [连接与子查询](./query/joins-subqueries.md)
- [聚合与分组](./query/aggregation.md)
- [窗口函数](./query/window-functions.md)
- [集合操作](./query/set-operations.md)

## 索引与执行

- [索引与访问路径](./indexing/indexes.md)
- [执行计划与 EXPLAIN](./performance/explain.md)

## 事务与一致性

- [事务与隔离级别](./transactions/isolation.md)
- [锁与并发控制](./transactions/locks.md)

## 设计与建模

- [范式与反范式](./design/normalization.md)
- [ER 建模与约束](./design/er-modeling.md)

## 性能与优化

- [查询优化策略](./performance/optimization.md)
- [分区与分片](./performance/partitioning-sharding.md)

## 安全与运维

- [权限与安全](./security/security.md)
- [备份恢复与迁移](./ops/backup-migration.md)

## 工具链与生态

- [CLI 与客户端](./tooling/cli.md)
- [ORM 与迁移](./tooling/orm-migrations.md)

## 引擎专栏

- [MySQL 专栏](../database/mysql/README.md)
- ClickHouse/Redis 专栏见 `../database/`

若有新增条目或分类需要调整，按需补充即可。


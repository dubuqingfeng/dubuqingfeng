---
title: 架构与概念
---

ClickHouse 是列式存储的 OLAP 数据库，强调高吞吐读写、近实时分析。

## 核心概念

- 列式存储：按列组织，压缩友好，适合扫描与聚合。
- 数据部件（Part）：写入形成不可变部件，后台合并（Merge）。
- 分区（Partition）：按维度分组部件，便于按时序/业务归档与清理。
- 副本（Replication）：通过 ZooKeeper/keeper 协调，确保冗余与一致性。

## 组件

- Server：单进程，含多线程执行引擎。
- Keeper：ZK 兼容的元数据服务（可用 ClickHouse Keeper）。
- Client：`clickhouse-client`、HTTP、JDBC/ODBC。


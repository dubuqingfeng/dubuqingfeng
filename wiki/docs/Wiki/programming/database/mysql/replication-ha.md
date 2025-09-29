---
title: 复制、GTID 与高可用
---

概览 MySQL 复制、GTID、半同步与 MGR/InnoDB Cluster 基本知识与实践要点。

## Binlog 与格式

- Binlog 格式：`ROW`（推荐）、`STATEMENT`、`MIXED`；ROW 精确但体积较大。
- 关键参数：`server_id`、`binlog_format`、`log_bin`、`gtid_mode`、`enforce_gtid_consistency`。

## 基础复制

- 传统基于坐标：`CHANGE MASTER TO MASTER_LOG_FILE=..., MASTER_LOG_POS=...;`
- 基于 GTID：`CHANGE MASTER TO MASTER_AUTO_POSITION=1;` 更易切换与容灾。
- 监控延迟：`Seconds_Behind_Master`（8.0 后为 `Replica` 术语）。

## 半同步复制

- 主库提交需等待至少一台从库确认写入 RelayLog；降低数据丢失风险，增加延迟。

## Group Replication / InnoDB Cluster

- 强一致复制组（Paxos/Raft 类），冲突检测与自动故障转移。
- 读写分离、高可用拓扑，配合 Router 使用。

## 常见问题

- 复制延迟：大事务、IO/CPU 瓶颈；拆小事务、提升硬件、调参。
- 主从不一致：过滤规则错误、非确定性函数；优先 ROW 并规避不确定性写法。
- 崩溃恢复与 Crash-Safe 复制：`relay_log_recovery=ON`。

## 排查命令

```sql
SHOW MASTER STATUS;   -- 主库位点/GTID
SHOW SLAVE STATUS\G;  -- 复制状态（8.0: SHOW REPLICA STATUS\G）
```


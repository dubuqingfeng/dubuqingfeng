---
title: 备份/快照与恢复
---

使用内置备份或冻结分区结合对象存储实现备份。

## 内置备份

```sql
BACKUP TABLE t TO Disk('backups', 't_backup');
RESTORE TABLE t FROM Disk('backups', 't_backup');
```

## 冻结快照

```sql
ALTER TABLE t FREEZE WITH NAME 'snap_2025_02_01';
-- 将 shadow 目录中的快照拷贝到外部存储
```

## 社区工具

- clickhouse-backup：自动化备份/恢复与上传对象存储。


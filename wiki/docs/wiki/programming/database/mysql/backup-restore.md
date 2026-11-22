---
title: 备份与时间点恢复（PITR）
---

备份分类、工具选择与基于 Binlog 的时间点恢复流程。

## 备份方式

- 逻辑备份：`mysqldump`（结构+数据 SQL）。优点通用、便携；缺点慢、体积大。
- 物理备份：`Percona XtraBackup` 等，速度快、可热备；适合大库。

## 常用命令示例

```bash
# 逻辑备份（InnoDB 建议单事务）
mysqldump --single-transaction --routines --triggers --events \
  -h 127.0.0.1 -uroot -p dbname | gzip > dbname_$(date +%F).sql.gz

# 物理备份（xtrabackup）
xtrabackup --backup --target-dir=/backup/$(date +%F)
xtrabackup --prepare --target-dir=/backup/$(date +%F)  # 应用 redo
```

## 时间点恢复（PITR）

1) 恢复最近一次全量/增量备份至临时实例。
2) 从备份时刻起，按时间范围重放 Binlog：

```bash
mysqlbinlog --start-datetime='2025-02-01 12:00:00' \
            --stop-datetime='2025-02-01 12:30:00' \
            /var/lib/mysql/binlog.000123 | mysql -u root -p
```

## 最佳实践

- 打开 Binlog，优先 ROW 格式；定期校验恢复链路。
- 备份脱敏与加密；定期演练恢复（含权限/依赖服务）。


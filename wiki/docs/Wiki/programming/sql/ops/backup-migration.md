### 备份恢复与迁移

逻辑/物理备份，时间点恢复与结构迁移的兼容性评估。

#### 要点
- 逻辑备份：`dump` 与还原，跨版本/跨引擎的兼容性；
- 物理备份：快照/冷备/热备的窗口与一致性保证；
- PITR：二进制日志/增量备份的组合；
- 迁移：零停机策略、双写/回放、校验对账。

#### 工具与实践

- MySQL：`mysqldump`/`mydumper`、`xtrabackup`（物理增量）；
- Postgres：`pg_dump`/`pg_basebackup`、`pgBackRest`；
- 校验：checksum/行数比对/业务抽样；
- PITR：binlog/WAL + 基础备份。

#### 大表迁移

- 在线变更：影子表/pt-online-schema-change；
- 双写与回放：变更期间双写新旧结构，回放 binlog/WAL 补齐；
- 切换：读路径先灰度，写路径窗口内切换，可回滚。

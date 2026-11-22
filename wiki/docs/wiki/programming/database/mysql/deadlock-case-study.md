---
title: 死锁复现与诊断
---

通过两个会话不同加锁顺序复现死锁，并解读 InnoDB 死锁日志。

## 准备

```sql
CREATE TABLE t (
  id BIGINT PRIMARY KEY,
  v INT,
  KEY idx_v (v)
) ENGINE=InnoDB;
INSERT INTO t VALUES (1,1),(2,2);
```

## 复现

会话 A：
```sql
START TRANSACTION;
UPDATE t SET v = v + 1 WHERE id = 1;
```

会话 B：
```sql
START TRANSACTION;
UPDATE t SET v = v + 1 WHERE id = 2;
```

再交叉更新：

会话 A：
```sql
UPDATE t SET v = v + 1 WHERE id = 2; -- 等待 B
```

会话 B：
```sql
UPDATE t SET v = v + 1 WHERE id = 1; -- 形成环
```

InnoDB 将回滚代价较小的事务，报死锁错误。

## 诊断

```sql
SHOW ENGINE INNODB STATUS\G
```

关注：
- WAITING/LOCK MODE 与索引记录范围（是否因为范围条件导致 Next-Key 锁）。
- 检查 SQL 是否命中合适索引，避免锁住过多记录。

## 规避策略

- 统一加锁顺序（按主键升序），避免环依赖。
- 将范围更新拆批，缩小锁范围；或改精确命中索引。
- 减少长事务，适度提高 `innodb_lock_wait_timeout` 并做好重试。


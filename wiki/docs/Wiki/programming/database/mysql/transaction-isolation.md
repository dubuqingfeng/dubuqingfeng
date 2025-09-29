---
title: 事务与隔离（含 MVCC）
---

本文概览 MySQL InnoDB 的事务、隔离级别与 MVCC 关键概念，并给出常见排错与示例。

## ACID 与自动提交

- 原子性（A）：事务要么全部成功要么全部失败。
- 一致性（C）：前后数据满足约束与业务不变式。
- 隔离性（I）：并发事务相互隔离（见隔离级别）。
- 持久性（D）：提交后的修改持久保存（Redo 日志 + 刷盘策略）。
- `autocommit=1` 时每条语句是一个独立事务；显式事务用 `START TRANSACTION … COMMIT/ROLLBACK`。

## 隔离级别与异常

- 读未提交（RU）：可能脏读。
- 读已提交（RC）：避免脏读；可能不可重复读/幻读。
- 可重复读（RR，MySQL 默认）：避免脏读/不可重复读；InnoDB 通过 MVCC+Next-Key 锁处理幻读。
- 串行化（SERIALIZABLE）：通过加锁实现串行，开销大。

常见异常：
- 脏读：读到未提交数据（RC+ 可避免）。
- 不可重复读：同一行多次读到不同值（RR 可避免）。
- 幻读：多次范围查询返回行数变化（RR 通过 Next-Key 锁与一致性读处理）。

## MVCC：一致性读与当前读

- 一致性读（Consistent Read）：普通 `SELECT`（不带 `LOCK IN SHARE MODE`/`FOR UPDATE`）读取快照，不加锁；依赖 Undo Log 与事务可见性规则。
- 当前读（Current Read）：`SELECT … FOR UPDATE/LOCK IN SHARE MODE`、`UPDATE/DELETE` 读取最新版本并加锁。
- 可见性：由快照版本、事务 ID、回滚指针等决定；在 RR 下，事务内多次一致性读看到同一快照。

## 间隙锁与 Next-Key 锁（RR）

- 记录锁：锁定具体行。
- 间隙锁：锁定两个记录之间的空隙，防止插入。
- Next-Key 锁：记录锁 + 相邻间隙，避免范围查询出现幻读。

## 示例：一致性读 vs 当前读

会话 A：
```sql
START TRANSACTION;
SELECT * FROM accounts WHERE id BETWEEN 10 AND 20; -- 一致性读，不加锁
```

会话 B：
```sql
UPDATE accounts SET balance = balance + 100 WHERE id = 15; -- 提交后 A 的一致性读仍看旧值
```

会话 A：
```sql
SELECT * FROM accounts WHERE id BETWEEN 10 AND 20 FOR UPDATE; -- 当前读，加 Next-Key 锁
COMMIT;
```

## 2PC 与崩溃恢复（简述）

- 两阶段提交：`Redo(Log)` 与 `Binlog` 一致性；`prepare` -> 写 Binlog -> `commit`。
- 崩溃恢复：`Redo` 重做已提交、回滚未提交；与 Binlog 协同保证复制一致性。

## 排错与最佳实践

- 读热点用一致性读（无锁），写热点用批量/队列削峰；减少范围锁冲突。
- 谨慎使用 `SELECT … FOR UPDATE` 的范围条件，避免大范围 Next-Key 锁。
- 通过 `SHOW ENGINE INNODB STATUS\G`/`performance_schema` 分析锁等待与死锁。


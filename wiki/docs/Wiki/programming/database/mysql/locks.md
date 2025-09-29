---
title: 锁类型与并发控制
---

InnoDB 常见锁与并发控制要点，含示例与排错思路。

## 锁类型

- 记录锁（Record Lock）：锁定某一行。
- 间隙锁（Gap Lock）：锁定两个记录之间的区间，阻止插入。
- Next-Key 锁：记录锁 + 相邻间隙，避免 RR 下幻读。
- 意向锁（IS/IX）：表级，表明将获取某种行锁，便于锁兼容性判断。
- 自增锁、插入意向锁：插入相关的内部锁。
- 元数据锁（MDL）：保护表结构变更与读写并发（DML 与 DDL 互斥）。

## 死锁与诊断

- 死锁检测：InnoDB 自动检测并回滚代价较小的一方。
- 诊断命令：
```sql
SHOW ENGINE INNODB STATUS\G; -- 最近一次死锁信息
```
- 观察死锁环、加锁范围、索引选择（避免全表扫描导致大量行锁）。

## 示例：范围锁导致的冲突

会话 A：
```sql
START TRANSACTION;
SELECT * FROM orders WHERE amount > 100 FOR UPDATE; -- 大范围 Next-Key 锁
```

会话 B：
```sql
INSERT INTO orders(id, amount) VALUES(12345, 150); -- 可能被间隙锁阻塞
```

优化方向：缩小范围、改精确索引条件、必要时改 RC 并配合业务幂等控制幻读风险。

## 实务建议

- where 谓词务必使用命中索引的等值或紧凑范围，减少锁范围。
- 小心长事务与大范围 `FOR UPDATE`，优先短事务与拆批。
- 线上开启合适的锁等待超时（`innodb_lock_wait_timeout`）。


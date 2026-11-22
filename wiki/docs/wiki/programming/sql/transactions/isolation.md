### 事务与隔离级别

ACID 基础、隔离级别与并发异常，配合各引擎实现（MVCC/锁）。

#### 要点
- ACID 与提交边界；显式事务与自动提交；
- 隔离级别：READ UNCOMMITTED/READ COMMITTED/REPEATABLE READ/SERIALIZABLE；
- 并发异常：脏读、不可重复读、幻读；
- MVCC 快照读与当前读的区分（实现依引擎而异）。

#### 实务差异

- 默认级别：MySQL InnoDB 默认 RR（可重复读），Postgres 默认 RC（读已提交）；
- RR 在 InnoDB 通过 MVCC+Next-Key 锁避免幻读，Postgres 通过 MVCC + predicate locks（部分场景）。

#### 何时一致性读/加锁读

- 一致性读：读多写少、报表查询，避免锁冲突；
- 加锁读：强一致读取并即将更新（`FOR UPDATE`），注意范围条件引入的锁扩大。

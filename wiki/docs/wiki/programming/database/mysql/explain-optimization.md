---
title: EXPLAIN 与查询优化
---

解析 EXPLAIN 输出、常见访问类型与优化方向。

## EXPLAIN 关键列

- `id`：执行顺序/子查询层次。
- `select_type`：简单、子查询、派生、UNION 等。
- `type`：访问类型：`system` > `const` > `eq_ref` > `ref` > `range` > `index` > `ALL`。
- `possible_keys`/`key`/`key_len`：候选/实际使用索引/长度。
- `ref`：索引列与常量或列的比较关系。
- `rows`/`filtered`：估算扫描行数/过滤比例。
- `Extra`：`Using index`（覆盖索引）、`Using where`、`Using filesort`、`Using temporary` 等。

## 覆盖索引与回表

- 覆盖索引可避免回表，减少随机 I/O。
- 选择性差的列（如性别、布尔）不适合作为单列索引；可作为联合索引的后缀列。

## 例子

```sql
-- 表：users(id PK, email UNIQUE, created_at, name)
EXPLAIN SELECT id, email FROM users WHERE email = 'a@b.com';
-- 期望：type=const/eq_ref，Extra=Using index（覆盖索引）

EXPLAIN SELECT * FROM users WHERE created_at BETWEEN '2024-01-01' AND '2024-02-01' ORDER BY created_at DESC LIMIT 20;
-- 期望：type=range，合适的时间索引；避免 Using filesort
```

## Join 策略

- 小表驱动大表，确保驱动表过滤性强且有合适索引。
- 连接条件列需要索引；避免函数/隐式转换破坏索引使用。

## 常见优化点

- 统计信息过旧导致估算失真：考虑 `ANALYZE TABLE` 或启用直方图。
- 避免 `SELECT *`，减少回表与网络传输。
- 合理分页：深分页使用延迟关联或基于主键的游标分页。


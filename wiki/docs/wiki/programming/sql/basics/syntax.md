### SQL 基础与语法

概览 DDL/DML/DCL/TCL，语句结构与常见关键字，区分大小写与转义规则。

#### 要点
- DDL：`CREATE/ALTER/DROP`；DML：`SELECT/INSERT/UPDATE/DELETE`；
- DCL：`GRANT/REVOKE`；TCL：`COMMIT/ROLLBACK/SAVEPOINT`；
- 标识符与转义：不同引擎的引号规则（MySQL `` ` ``、PostgreSQL "");
- NULL 语义：三值逻辑，`IS NULL` 与聚合的处理差异；
- 结果确定性：未显式 `ORDER BY` 的结果顺序不保证。

#### 执行/书写顺序

- 书写：`SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT`；
- 执行（概念）：`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`。

```sql
SELECT u.id, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = TRUE
GROUP BY u.id
HAVING COUNT(o.id) > 3
ORDER BY cnt DESC
LIMIT 10;
```

#### 方言差异速览

- 引号：MySQL 反引号、Postgres 双引号；
- 自增：MySQL `AUTO_INCREMENT`、Postgres `GENERATED AS IDENTITY`；
- Upsert：MySQL `INSERT ... ON DUPLICATE KEY UPDATE`、Postgres `INSERT ... ON CONFLICT ... DO UPDATE`。

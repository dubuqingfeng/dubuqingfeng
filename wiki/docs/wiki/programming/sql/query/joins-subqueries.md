### 连接与子查询

从内连接/外连接到相关子查询与派生表，理解执行策略与可替代写法。

#### 要点
- 连接类型：INNER/LEFT/RIGHT/FULL（部分引擎不支持 FULL）；
- 连接条件与选择性：避免笛卡尔积；
- 子查询：相关/非相关、`IN/EXISTS` 的等价与差异；
- 派生表与 CTE（`WITH`）；递归 CTE 支持情况；
- 半连接/反连接的改写策略。

#### 示例：IN 与 EXISTS

```sql
-- 谁下过单
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- 等价写法（通常优化器改写为半连接）
SELECT u.* FROM users u WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

低选择性子查询更偏向 EXISTS；可读性优先时按团队约定。

#### 示例：CTE 与递归 CTE

```sql
WITH RECURSIVE t(n) AS (
  SELECT 1
  UNION ALL
  SELECT n+1 FROM t WHERE n < 5
)
SELECT * FROM t; -- 1..5
```

注意：部分引擎对 CTE 物化/内联策略不同，影响性能（Postgres 可由优化器决定，旧版本常物化）。

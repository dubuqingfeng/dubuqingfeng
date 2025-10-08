### 窗口函数（Window Functions）

以 `OVER(PARTITION BY … ORDER BY …)` 定义窗口，进行排名/累计/分组内计算。

#### 要点
- 常用函数：`ROW_NUMBER/RANK/DENSE_RANK`、`LAG/LEAD`、累计 `SUM/AVG`；
- 窗口边界：`ROWS/RANGE` 与帧定义；
- 与分组聚合对比：窗口不折叠行，便于对每行附加统计；
- 引擎支持差异与等价改写（自连接/子查询）。

#### 示例：排名与窗口统计

```sql
SELECT user_id,
       amount,
       RANK() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rk,
       SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_sum
FROM orders;
```

去重 + 排名：使用 `ROW_NUMBER()` 选取分组内第一条代替 `DISTINCT ON`（跨引擎兼容）。

大窗口排序：增加 work_mem/临时空间或改写为分段聚合。

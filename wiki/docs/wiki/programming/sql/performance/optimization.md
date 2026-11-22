### 查询优化策略

从写法到索引、从统计信息到执行参数，系统化优化查询性能。

#### 要点
- 写法：避免函数包裹索引列、隐式类型转换、`SELECT *`；
- 索引：最左前缀、覆盖索引、合适的列顺序；
- 数据访问：批量/分页策略、延迟关联；
- 统计信息与参数：收集与直方图、执行参数与并行度（依引擎）。

#### 示例：避免函数包裹索引列

```sql
-- 慢：对列函数变换导致无法走索引
SELECT * FROM users WHERE DATE(created_at) = CURRENT_DATE;

-- 优化：改为范围查询
SELECT * FROM users
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day';
```

#### 工具链

- MySQL：`EXPLAIN/ANALYZE`、`OPTIMIZER_TRACE`、慢日志；
- Postgres：`EXPLAIN (ANALYZE, BUFFERS)`、`pg_stat_statements`；
- 通用：采样 SQL、A/B 对比、基准与回放。

### 聚合与分组

`GROUP BY`/`HAVING` 与聚合函数，明晰语义与常见陷阱。

#### 要点
- 聚合函数：`COUNT/SUM/AVG/MIN/MAX`；`COUNT(*)` vs `COUNT(col)`；
- 分组列与选择列表：仅能选择分组列或聚合表达式（部分方言宽松）；
- 过滤：`WHERE` 在分组前、`HAVING` 在分组后；
- Rollup/Cube/Grouping Sets 的支持差异。

#### 示例：去重聚合与替代

```sql
SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

高基数去重代价高，可考虑：预聚合表/物化视图、HyperLogLog 近似去重（支持的引擎）。

#### 大分组的内存控制

- 调整工作内存/临时表阈值（按引擎）；
- 分区聚合：先按时间/分片聚合再汇总；
- 必要时改为离线任务（ETL）。

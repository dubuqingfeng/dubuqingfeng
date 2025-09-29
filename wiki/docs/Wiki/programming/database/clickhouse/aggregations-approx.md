---
title: 聚合函数与近似统计
---

ClickHouse 提供丰富的聚合与近似函数，适合大规模分析。

- 计数：`countDistinct`/`uniqExact`/`uniq`/`uniqCombined`。
- 分位数：`quantile/quantileExact/quantileTDigest/quantileBFloat16`。
- 去重合并：`groupArray`、`groupUniqArray`。
- 状态聚合：`xxxState`/`xxxMerge` 支持分布式聚合。

## 示例

```sql
SELECT uniqCombined(user_id), quantile(0.95)(latency) FROM logs WHERE ts >= now() - INTERVAL 1 DAY;
```


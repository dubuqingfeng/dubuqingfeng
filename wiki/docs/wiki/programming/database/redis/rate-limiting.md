---
title: 分布式限流（Redis-Cell 等）
---

常见限流算法与基于 Redis 的实现方式。

## 算法概览

- 固定窗口、滑动窗口、令牌桶、漏桶。

## Redis-Cell（令牌桶）

- 内置模块命令示例：
```text
CL.THROTTLE user:123 15 30 60 1
-- key: user:123
-- max_burst=15, tokens_per_interval=30, interval=60s, retry=1
```
返回值包含是否允许、剩余令牌、重试等待等。

## Lua 自定义

- 使用 `INCRBY`/`EXPIRE` 或基于 ZSET 实现滑动窗口；确保原子性在脚本内完成。

## 实践建议

- 按业务维度设计 Key（用户/接口/IP），并引入限流白名单。
- 与熔断器/降级策略联动，提供可观测性指标。


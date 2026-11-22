---
title: Redis 脚本与原子操作
---

使用 Lua 在 Redis 中编写原子脚本，常用于计数、扣减与锁释放等。

## 基础

- `EVAL`/`EVALSHA` 执行脚本；脚本内通过 `KEYS`/`ARGV` 访问参数。

```lua
-- 原子扣减库存
local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
if stock <= 0 then return 0 end
redis.call('DECR', KEYS[1])
return 1
```

调用示例（redis-cli）：

```bash
EVAL "local s=tonumber(redis.call('GET', KEYS[1]) or '0'); if s>0 then redis.call('DECR', KEYS[1]); return 1 else return 0 end" 1 stock:sku123
```

## 最佳实践

- 控制脚本执行时间与返回体积；避免 O(N) 对大集合操作。
- 针对热点脚本使用 `SCRIPT LOAD` + `EVALSHA`。

缓存穿透与布隆过滤器可结合脚本原子更新；对高并发扣减考虑加入令牌桶。

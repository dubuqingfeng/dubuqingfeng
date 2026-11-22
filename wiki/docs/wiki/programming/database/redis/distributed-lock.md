---
title: 分布式锁（含 Redlock）
---

Redis 分布式锁的实现要点、Redlock 思路与注意事项。

## 基础实现（单实例）

- 使用 `SET key value NX PX ttl` 原子加锁；`value` 建议使用唯一 ID（如 UUID:线程号）。
- 解锁使用 Lua 脚本确保“比对 value 后再删除”原子性：

```lua
-- unlock.lua
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
```

## Redlock（多实例）

- 思路：对 N 个独立实例获取多数派成功且在锁有效期内，认为加锁成功；失败则在所有实例释放。
- 注意：网络分区下的安全性争议；如依赖强一致可考虑 etcd/zk。

## 实践建议

- 设置合理 TTL，长任务使用续约（看门狗/定时 `PEXPIRE`）。
- 尽量将临界区变短、幂等；失败重试引入抖动避免群体竞争。
- 锁粒度尽可能细，避免热点 Key。


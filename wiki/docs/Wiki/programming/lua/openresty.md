---
title: OpenResty/Nginx + Lua 实战
---

基于 OpenResty 在 Nginx 阶段钩入 Lua，实现高性能网关/边车逻辑。

## 阶段与指令

- `init_by_lua*`、`init_worker_by_lua*` 初始化。
- `access_by_lua*`、`rewrite_by_lua*`、`header_filter_by_lua*` 等阶段。

## 共享字典与限流

- `lua_shared_dict` 存放热点数据与限流计数。
- 结合 `resty.limit.req` 实现漏桶限流。

示例 Nginx 配置：

```nginx
lua_shared_dict limits 10m;

init_by_lua_block {
  local limit_req = require "resty.limit.req"
  rate_limiter, err = limit_req.new("limits", 100, 200) -- 100 r/s, burst 200
}

server {
  location /api {
    access_by_lua_block {
      local delay, err = rate_limiter:incoming("api", true)
      if not delay then
        ngx.status = 429; ngx.say("Too Many Requests"); return ngx.exit(429)
      end
      if delay > 0 then ngx.sleep(delay) end
    }
    proxy_pass http://backend;
  }
}
```

## 与下游交互

- `lua-resty-http` 调用后端；缓存与熔断重试策略。

```lua
local http = require 'resty.http'
local cli = http.new()
cli:set_timeout(200)
local res, err = cli:request_uri('http://127.0.0.1:8080/health', { method = 'GET' })
if not res or res.status ~= 200 then
  ngx.status = 502; ngx.say('bad gateway')
else
  ngx.say(res.body)
end
```

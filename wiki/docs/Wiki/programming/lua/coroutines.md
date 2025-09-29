---
title: 协程（coroutine）与迭代器
---

Lua 协程是用户态调度的轻量线程，常用于生成器/迭代器与异步框架。

## 基本用法

```lua
local co = coroutine.create(function()
  for i = 1, 3 do
    coroutine.yield(i)
  end
end)

while true do
  local ok, v = coroutine.resume(co)
  if not ok or v == nil then break end
  print(v)
end
```

## 迭代器模式

```lua
function gen(n)
  return coroutine.wrap(function()
    for i = 1, n do coroutine.yield(i) end
  end)
end

for x in gen(3) do print(x) end
```


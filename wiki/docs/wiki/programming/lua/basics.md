---
title: 语法与表（table）基础
---

Lua 核心是表（table），一等字典/数组；配合元表（metatable）支持运算/索引重载。

## 基础语法

```lua
local x = 1
local s = "hello"
local t = {a = 1, ["b"] = 2, 10, 20} -- 字典 + 数组

function add(a, b) return a + b end

for i, v in ipairs(t) do
  print(i, v)
end
```

## 表与元表

```lua
local t = {x = 1}
local mt = {
  __index = function(_, k)
    if k == 'y' then return 2 end
  end,
  __add = function(a, b)
    return {x = a.x + b.x}
  end
}
setmetatable(t, mt)
```

## 习惯用法

- 局部变量优先（`local`），避免污染全局。
- 使用 `pairs`/`ipairs` 迭代；字符串拼接使用 `table.concat`。


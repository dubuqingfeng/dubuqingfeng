---
title: 模块、包管理与依赖
---

Lua 模块通过 `require` 加载，路径由 `package.path`/`package.cpath` 控制。

## require 基本

```lua
-- foo.lua
local M = {}
function M.hello() return "hi" end
return M

-- main.lua
local foo = require('foo')
print(foo.hello())
```

## 包管理

- LuaRocks：安装依赖、打包发布。
- OpenResty/Neovim 等生态自带包管理的集成方式。


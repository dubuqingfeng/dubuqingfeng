---
title: LuaJIT FFI 实战
---

使用 LuaJIT 的 FFI 直接调用 C API，避免繁琐绑定层，适合高性能场景。

## 基本示例

```lua
local ffi = require('ffi')
ffi.cdef[[
  int printf(const char *fmt, ...);
]]
ffi.C.printf("hello %s\n", "ffi")
```

## 数据结构与内存

- `ffi.new`、`ffi.typeof` 创建 C 类型；注意内存生命周期。
- 与外部库链接：`ffi.load('libxxx')`。

## 注意事项

- 仅限 LuaJIT；与 JIT 热点、GC 交互需谨慎。


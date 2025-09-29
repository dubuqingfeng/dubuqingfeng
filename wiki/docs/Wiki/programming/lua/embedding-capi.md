---
title: 嵌入式 C API 与扩展
---

将 Lua 嵌入到 C/C++ 程序或编写 C 扩展模块的要点。

## 在 C 中调用 Lua

步骤：创建 `lua_State`、加载脚本、调用函数、取回栈上结果。

```c
// 伪代码
lua_State* L = luaL_newstate();
luaL_openlibs(L);
luaL_dofile(L, "script.lua");
lua_getglobal(L, "add");
lua_pushnumber(L, 1);
lua_pushnumber(L, 2);
lua_pcall(L, 2, 1, 0);
double r = lua_tonumber(L, -1);
lua_close(L);
```

## 编写 C 扩展

- 实现 `luaopen_modname` 导出函数；用 `luaL_Reg` 注册。
- 注意栈平衡、错误处理与内存管理。


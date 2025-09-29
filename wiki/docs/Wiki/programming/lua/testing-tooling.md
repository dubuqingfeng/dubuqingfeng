---
title: 测试与工具链
---

常用测试框架与工具、格式/静态检查等。

- 测试：`busted`、`luassert`。
- 代码规范/格式化：`luacheck`、`stylua`。
- 打包：`luarocks`；调试：`mobdebug`。

## busted 示例

```lua
describe('math', function()
  it('adds', function()
    assert.is_true(1 + 2 == 3)
  end)
end)
```

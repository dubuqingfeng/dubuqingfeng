### JS 库的类型补全策略

- 优先寻找官方类型或 `@types`；
- 通过 JSDoc 在 JS 中添加类型：

```js
/**
 * @param {import('./types').User} u
 */
function save(u) {}
```

- 写最小化 `d.ts` 以覆盖关键 API；
- 对复杂 API 使用函数重载与泛型占位；


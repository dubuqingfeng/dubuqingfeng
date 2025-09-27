### Array 常用算法与坑点

要点：

- 避免稀疏数组（性能差且 API 行为微妙）；
- `map/filter/reduce` 与 `for..of` 的选择：可读性 vs 开销；
- 注意 `sort` 默认按字符串比较：自定义比较函数；
- 拷贝与去重：`const copy = arr.slice()`；`const uniq = [...new Set(arr)]`；
- 不变式更新（React 状态）：`const next = [...list, item]`/`list.map(...)`。


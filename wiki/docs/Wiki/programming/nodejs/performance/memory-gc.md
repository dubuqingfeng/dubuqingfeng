### V8 内存与 GC（Node 视角）

理解新生代/老生代与写屏障、调参与泄漏排查；服务端场景需结合长期运行与负载特性。

#### 要点
- 新生代/老生代大小与 `--max-old-space-size`；
- 隐藏类/IC 对性能影响；
- 常见泄漏源：全局引用、缓存未清理、事件监听未移除；
- 参考：JavaScript 章节的[V8 内存与垃圾回收](../../javascript/memory/gc.md)。

#### 示例：模拟内存泄漏与定位

```js
// 慎用：演示泄漏
const leaks = [];
setInterval(() => leaks.push(Buffer.alloc(1e6)), 100); // 每 100ms 增长 1MB
```

排查：
- 运行 `node --inspect --expose-gc app.js`，在 DevTools 采集多份堆快照对比；
- 监控 Full GC 次数/耗时与事件循环延迟；
- 结合对象保留路径（Retainers）找到全局引用或缓存未清理。

#### 常用参数

- `--max-old-space-size=4096` 调整老生代上限；
- `--trace-gc --trace-gc-verbose` 观察 GC 行为（生产慎用）；
- 避免大对象长时间存活，批量释放可降低晋升压力。

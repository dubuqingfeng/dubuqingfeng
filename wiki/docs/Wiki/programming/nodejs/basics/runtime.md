### 运行时架构与事件循环

Node 基于 V8 + libuv，单线程事件循环 + 线程池 + 系统 I/O，提供跨平台网络/文件能力。

#### 要点
- 事件循环阶段（libuv）：timers → pending callbacks → idle/prepare → poll → check → close callbacks；
- 微任务：每个阶段结束清空微任务队列（Promise callbacks）；
- 线程池：`fs`、`crypto`、`dns` 等使用 libuv 线程池；
- 与浏览器差异：阶段划分不同、无 DOM/APIs；
- 参考：JavaScript 章节的[事件循环与任务队列](../../javascript/async/event-loop.md)。

#### 示例：阶段与微任务交互

```js
// node >= 16
console.log('start');
setTimeout(() => console.log('timeout'), 0); // timers 阶段
setImmediate(() => console.log('immediate')); // check 阶段
Promise.resolve().then(() => console.log('microtask')); // 微任务
process.nextTick(() => console.log('nextTick')); // nextTick 队列，优先于微任务

// 典型输出（顶层脚本）：
// start
// nextTick
// microtask
// timeout
// immediate
// 注意：在 I/O 回调中，setImmediate 通常先于 setTimeout 触发。
```

#### 示例：阻塞与事件循环延迟

```js
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay();
h.enable();

setInterval(() => {
  console.log('eventLoop p95(ms)=', (h.percentile(95) / 1e6).toFixed(2));
  h.reset();
}, 1000);

// 模拟 CPU 阻塞 200ms
setInterval(() => {
  const end = Date.now() + 200;
  while (Date.now() < end) {}
}, 3000);
```

定位思路：优先确认是否 CPU/GC/外部 I/O 饱和；结合 `--cpu-prof`/堆快照与事件循环延迟指标交叉验证。

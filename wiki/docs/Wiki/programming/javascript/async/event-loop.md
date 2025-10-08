### 事件循环与任务队列

#### ToC

- 宏任务/微任务
- 浏览器 vs Node.js 差异
- 定时器与 I/O
- 常见陷阱

#### 宏任务/微任务

- 微任务（microtasks）：`Promise.then`、`MutationObserver`、queueMicrotask；
- 宏任务（macrotasks）：`setTimeout`、`setInterval`、`setImmediate`（Node）、I/O 事件；
- 执行顺序：宏任务 → 清空所有微任务 → 渲染（浏览器）→ 下一个宏任务。

#### 浏览器 vs Node.js 差异

- 浏览器：渲染时机与任务队列交替；
- Node：libuv 事件循环阶段（timers → pending callbacks → idle/prepare → poll → check → close callbacks），微任务在各阶段后清空。

#### 定时器与 I/O

- `setTimeout(fn, 0)` 并非马上执行，只是尽快安排在后续宏任务；
- 高并发 I/O 依赖非阻塞与回调/Promise/async-await 协作。

#### 常见陷阱

- 微任务无限排队会饿死渲染或 I/O；
- 在 `then` 中抛出异常会进入拒绝态链路，注意捕获；
- 长任务阻塞主线程导致卡顿，使用 Web Worker 分担计算。

#### 示例：顺序与微任务

```js
console.log('start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('microtask'));
console.log('end');
// 输出：start → end → microtask → timeout
```

#### 示例：避免强制同步布局

```js
// 读写分离：避免交替读写导致多次布局
requestAnimationFrame(() => {
  const h = el.offsetHeight; // 读
  el.style.height = (h + 10) + 'px'; // 写
});
```

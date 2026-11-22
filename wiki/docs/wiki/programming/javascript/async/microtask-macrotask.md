### 计时器与微任务/宏任务

要点速记：

- `Promise.then`/`queueMicrotask` 比 `setTimeout(fn, 0)` 更早执行（在当前宏任务结束后立即执行微任务）。
- 大量微任务可能阻塞渲染；节流/分帧处理长队列（`requestAnimationFrame`/`setTimeout` 分批）。
- Node 中 `process.nextTick` 优先级甚至高于微任务，谨慎使用避免饿死 I/O。


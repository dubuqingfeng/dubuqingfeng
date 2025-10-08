### Worker Threads

在同一进程内提供多线程执行环境，适合 CPU 密集型任务与隔离状态管理。

#### 要点
- 创建与通信：`worker_threads`、`MessageChannel/MessagePort`；
- 共享内存：`SharedArrayBuffer`、`Atomics`；
- 资源管理：传输 vs 复制、结构化克隆；
- 与 Cluster 的区别：线程 vs 进程、内存与崩溃隔离。

#### 示例：基本 Worker

```js
// main.mjs
import { Worker } from 'node:worker_threads';
const worker = new Worker(new URL('./worker.mjs', import.meta.url), { workerData: { n: 42 } });
worker.on('message', (msg) => console.log('result:', msg));
```

```js
// worker.mjs
import { parentPort, workerData } from 'node:worker_threads';
parentPort.postMessage(workerData.n * 2);
```

任务池建议：预热固定数量的 Worker，使用队列分发任务，避免频繁创建销毁。

构建注意：打包器需将 Worker 入口标记为独立 bundle；TS 中使用 `new URL('./worker.ts', import.meta.url)` 配合构建器的 loader。

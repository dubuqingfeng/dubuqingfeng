### libuv 线程池要点

Node 的部分 API 通过 libuv 线程池执行（默认 4 线程，可调），避免阻塞事件循环。

#### 要点
- 涉及 API：`fs`、`crypto`、`dns.resolve` 等；
- 大量并发 I/O：`UV_THREADPOOL_SIZE` 调优与上限；
- 监控：队列堆积导致的延迟；
- 取舍：CPU 密集型任务建议 Worker Threads。

#### 示例：调整线程池大小

在启动前设置环境变量（受进程读取，运行期修改无效）：

```bash
UV_THREADPOOL_SIZE=16 node server.js
```

示例任务（`crypto.pbkdf2` CPU 密集型）会使用线程池：

```js
import { pbkdf2 } from 'node:crypto';
for (let i = 0; i < 100; i++) {
  pbkdf2('p', 's', 1e6, 64, 'sha512', () => console.log('done', i));
}
```

与外部服务协同：对下游（DB/HTTP）设置并发上限与重试退避，避免线程池堆积导致整体延迟扩散。

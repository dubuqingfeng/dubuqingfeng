### Node.js 运行时要点

#### ToC

- 单线程与事件循环
- libuv 线程池
- I/O/文件/网络
- 常见实践

#### 单线程与事件循环

- JS 执行是单线程，但 Node 利用底层线程池处理部分任务（如 fs、加解密、DNS）。

#### libuv 线程池

- 默认 4 线程（`UV_THREADPOOL_SIZE` 可调）；避免在热路径中阻塞线程池；
- CPU 密集任务使用子进程/Worker Threads 分担。

#### I/O/文件/网络

- 使用异步 API 与超时；对 HTTP 客户端设置连接池与重试；
- 生产服务建议启用 `--max-old-space-size`、打开指标与 heap snapshot/CPU profile 能力。

#### 常见实践

- 结构化日志（pino/winston）；
- 优雅退出（SIGTERM/SIGINT）+ 连接与定时器清理；
- 使用 `clinic`/`0x`/JFR on JDK proxy 进行性能排查（跨栈工具）。


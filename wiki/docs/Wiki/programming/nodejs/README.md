---
title: Node.js
slug: /wiki/programming/nodejs
---

这里汇总与 Node.js 运行时相关的笔记与实践，覆盖事件循环/并发模型、核心模块、性能与运维等，必要处会链接到 JavaScript 章节的通用内容。

## 运行时与模块

- [运行时架构与事件循环](./basics/runtime.md)
- [模块系统：ESM 与 CommonJS](./modules/esm-cjs.md)

## I/O 与核心模块

- [文件系统 fs](./io/fs.md)
- [流与背压（Streams）](./io/streams.md)
- [HTTP/网络基础](./web/http-server.md)

## 并发与多线程

- [libuv 线程池要点](./concurrency/libuv-threadpool.md)
- [Worker Threads](./concurrency/worker-threads.md)
- [Cluster 多进程模型](./concurrency/cluster.md)

## 性能与内存

- [性能分析与定位](./performance/profiling.md)
- [V8 内存与 GC（Node 视角）](./performance/memory-gc.md)

## 工具链与环境

- [Node 版本管理（nvm 等）](./toolchain/node-version.md)
- [包管理器与依赖策略](./toolchain/package-managers.md)
- [测试与覆盖率](./toolchain/testing.md)

## 安全与实践

- [安全基线与常见风险](./security/security.md)

## 部署与运维

- [进程管理与容器化](./deploy/pm2-docker.md)
- [可观测性（日志/指标/追踪）](./ops/observability.md)

若有新增条目或分类需要调整，按需补充即可。


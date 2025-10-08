### Cluster 多进程模型

利用多核并行处理请求，主进程负责 fork/管理工作进程，常与反向代理配合。

#### 要点
- 进程间通信（IPC）与负载均衡策略；
- 无状态/有状态服务的会话粘性；
- 崩溃恢复与优雅重启；
- 与容器/编排（K8s）的角色边界。

#### 示例：最小 Cluster

```js
import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

if (cluster.isPrimary) {
  const n = os.cpus().length;
  for (let i = 0; i < n; i++) cluster.fork();
  cluster.on('exit', () => cluster.fork()); // 崩溃重启
} else {
  http.createServer((_, res) => res.end(`pid ${process.pid}`)).listen(3000);
}
```

部署拓扑：Nginx/Ingress → 多实例（或 Cluster）→ 应用；会话需无状态或借助粘性/外部会话存储。

PM2 集成：`pm2 start app.js -i max` 开启多实例；健康检查/日志轮转使用 PM2 插件或对接外部方案。

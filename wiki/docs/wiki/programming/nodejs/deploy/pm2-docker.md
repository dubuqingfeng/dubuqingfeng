### 进程管理与容器化

使用 PM2/systemd 管理进程，容器化部署与资源限制，结合反向代理与编排。

#### 要点
- 进程管理：PM2 cluster 模式、日志轮转、健康检查；
- 优雅停止：信号（SIGTERM/SIGINT）与关闭钩子；
- 容器化：多阶段构建、最小镜像、只读文件系统；
- 编排：K8s HPA/资源配额、探针与滚动升级；
- 代理：Nginx/Caddy、TLS 与 HTTP/2。

#### 示例：多阶段 Dockerfile（最小镜像）

```Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
CMD ["node", "dist/server.js"]
```

#### 示例：优雅停止

```js
const server = app.listen(3000);
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
});
```

发布策略：蓝绿/金丝雀结合健康检查；资源限制使用 CPU shares/内存上限，观察事件循环延迟与 p99 变化。

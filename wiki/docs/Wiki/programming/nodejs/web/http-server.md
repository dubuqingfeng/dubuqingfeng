### HTTP/网络基础

从原生 `http`/`http2` 到常见框架（Express/Koa/Fastify），理解请求生命周期、路由与中间件。

#### 要点
- 原生模块：`http`/`http2` 与 keep-alive、超时、HEADERS 大小限制；
- 框架对比：性能、生态、类型支持、错误处理模型；
- JSON/流式响应、文件下载与范围请求；
- CORS、压缩、缓存与 ETag；
- 生产部署：反向代理（Nginx）、TLS 终止、HTTP/2 与 HTTP/3 网关。

#### 示例：Fastify 最小化服务与插件

```ts
import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/ping', async () => ({ pong: 'it works' }));

await app.listen({ port: 3000, host: '0.0.0.0' });
```

```ts
// 插件：声明装饰与类型推导
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance { now(): number }
}

export default fp(async (app) => {
  app.decorate('now', () => Date.now());
});
```

#### 示例：Node 原生 Fetch（>=18）

```js
const res = await fetch('https://example.com/data.json');
if (!res.ok) throw new Error('bad status');
const data = await res.json();
```

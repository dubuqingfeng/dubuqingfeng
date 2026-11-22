### 可观测性（日志/指标/追踪）

以结构化日志 + 指标 + 分布式追踪构建端到端可观测性，便于问题定位与容量规划。

#### 要点
- 日志：pino/winston、JSON 格式、采样与脱敏；
- 指标：prom-client、直方图/摘要、事件循环延迟；
- 追踪：OpenTelemetry、HTTP/DB 客户端自动注入；
- 上下文：AsyncLocalStorage 贯穿请求上下文；
- 汇聚：ELK/EFK、Prometheus/Grafana、Tempo/Jaeger。

#### 示例：结构化日志与请求上下文

```js
import pino from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();
const logger = pino();

app.use((req, res, next) => {
  const ctx = { reqId: crypto.randomUUID() };
  als.run(ctx, next);
});

function log() {
  const ctx = als.getStore() || {};
  logger.info({ ...ctx, msg: 'hello' });
}
```

#### 示例：指标与 /metrics 暴露

```js
import client from 'prom-client';
const h = new client.Histogram({ name: 'http_duration_ms', help: 'latency', buckets: [50,100,200,500,1000] });
app.use((req, res, next) => { const end = h.startTimer(); res.on('finish', () => end()); next(); });
app.get('/metrics', async (_, res) => res.type('text/plain').send(await client.register.metrics()));
```

#### 示例：OpenTelemetry

```js
// 简化示例：sdk 初始化 + http 自动注入
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
new NodeSDK({ instrumentations: [new HttpInstrumentation()] }).start();
```

实践：按端点/租户/环境分离看板与采样，控制成本；核心路径高采样，边缘路径低采样。

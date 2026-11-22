### 测试与覆盖率

单元/集成/端到端测试与覆盖率度量，结合 Mock/容器化依赖。更多实践见 JavaScript 章节的[测试与覆盖率（Jest/Vitest）](../../javascript/toolchain/testing.md)。

#### 要点
- 工具：Jest/Vitest、Playwright、Supertest；
- 隔离：Testcontainers/Docker Compose；
- 覆盖率：阈值设定、变更范围测试；
- 并发与资源：Worker 数、内存与端口管理。

#### 示例：HTTP 接口测试（Supertest + Jest）

```ts
import request from 'supertest';
import { app } from '../src/app';

it('GET /ping', async () => {
  await request(app).get('/ping').expect(200).expect({ pong: 'it works' });
});
```

#### 示例：Testcontainers 启动 PostgreSQL

```ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

let container;
beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();
});
afterAll(async () => container.stop());
```

策略：E2E 覆盖关键路径，契约测试保证服务间协议稳定；其余以集成测试为主、单测为基础。

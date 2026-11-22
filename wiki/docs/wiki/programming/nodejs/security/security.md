### 安全基线与常见风险

从依赖供应链到服务端 API 防护，关注 SSRF/路径穿越/命令注入等攻击面。

#### 要点
- 依赖安全：锁文件、审计与白名单、SCA；
- 输入与拼接：避免 `child_process`/`eval` 注入、模板引擎注入；
- 文件访问：路径规范化与白名单、禁止任意目录遍历；
- 网络访问：SSRF 防护、内网地址过滤、代理策略；
- 配置与 Secrets：`.env` 管理、最小权限、审计日志。

#### 示例：安全头部与限速

```js
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, max: 300 }));
```

#### 示例：路径穿越与 SSRF 防护

```js
import path from 'node:path';
import { URL } from 'node:url';

// 路径规范化 + 根目录白名单
const ROOT = '/srv/files';
app.get('/download', (req, res) => {
  const file = path.normalize('/' + req.query.file).replace(/^\/+/, '');
  const abs = path.join(ROOT, file);
  if (!abs.startsWith(ROOT)) return res.sendStatus(400);
  return res.download(abs);
});

// SSRF：限制目标主机
const ALLOW = new Set(['api.example.com']);
app.get('/proxy', async (req, res) => {
  const u = new URL(req.query.url);
  if (!ALLOW.has(u.hostname)) return res.sendStatus(400);
  const r = await fetch(u, { method: 'GET' });
  res.status(r.status).send(await r.text());
});
```

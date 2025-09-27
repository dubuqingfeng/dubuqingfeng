### 同源策略与 CORS（简明）

- 同源策略限制脚本跨站读取敏感资源；
- CORS 通过响应头放宽访问：`Access-Control-Allow-Origin`/`Credentials`/`Headers`/`Methods`；
- 预检请求：对非简单请求发送 `OPTIONS` 询问；
- 避免将通配 `*` 与 `credentials` 同用；
- 对于 Cookie/鉴权，优先使用同站策略（`SameSite`）。


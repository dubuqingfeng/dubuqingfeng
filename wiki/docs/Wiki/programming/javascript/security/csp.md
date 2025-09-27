### CSP 与前端安全

- CSP（Content-Security-Policy）可显著降低 XSS 风险：
  - 禁止内联脚本（或使用 nonce/hash）；限制脚本/样式来源；
  - 报警模式：`Content-Security-Policy-Report-Only`；
- 配合框架默认转义与可信 DOM API（避免 `innerHTML`）。

参考：后端安全文档见 `wiki/docs/wiki/security/web/xss/xss.md`。


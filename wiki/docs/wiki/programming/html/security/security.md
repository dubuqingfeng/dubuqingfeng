### 安全注意事项

HTML 层面的常见安全要点：内容注入、外链与嵌入、安全策略与隔离。

#### 要点
- 注入风险：避免不可信 `innerHTML`；模板转义；
- 外链：`rel="noopener noreferrer"`；下载与 `download` 属性；
- iframe：`sandbox`、`allow`、跨域隔离；
- CSP：白名单策略、`script-src`/`style-src`/`img-src`；
- 表单：same-site Cookie、CSRF 防护（与后端协同）。

#### CSP 基础配置

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'
```

排错：使用 `Content-Security-Policy-Report-Only` 收集违规再收紧；检查第三方脚本需求（nonce/hash）。

#### 可信 DOM API 替代

- 使用 `textContent`/`createElement`/`append` 代替 `innerHTML`；
- 必须插入 HTML 时采用可信模板引擎并开启转义/白名单过滤。

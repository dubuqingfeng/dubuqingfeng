### SEO 与元信息

基础 SEO 元信息与社交分享元数据，配合良好语义结构与可访问性。

#### 要点
- `<title>` 与 `<meta name="description">`；
- 机器人与索引：`<meta name="robots">`、`robots.txt`、`<link rel="canonical">`；
- 社交卡片：Open Graph（`og:title/description/image`）、Twitter Cards；
- 国际化：`hreflang`；结构化数据（JSON-LD）。

#### 模板元信息

```html
<title>页面标题 - 站点名</title>
<meta name="description" content="一句话概述" />
<link rel="canonical" href="https://example.com/page" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="页面标题" />
<meta property="og:description" content="一句话概述" />
<meta property="og:image" content="https://example.com/cover.jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
```

#### 多语言与 hreflang

```html
<link rel="alternate" href="https://example.com/page" hreflang="x-default" />
<link rel="alternate" href="https://example.com/zh/page" hreflang="zh" />
<link rel="alternate" href="https://example.com/en/page" hreflang="en" />
```

结构化数据：根据页面类型添加 JSON-LD（Breadcrumb/Article/Product 等）。

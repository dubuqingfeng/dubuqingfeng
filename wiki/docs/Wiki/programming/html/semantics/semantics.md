### 语义化标签与文档结构

强调语义化有助于可读性、可访问性与 SEO：合理使用 `header/nav/main/section/article/aside/footer` 等结构标签。

#### 要点
- 标题层级与文档大纲：每页 1 个主标题 `h1`；
- 语义容器：`<section>`（专题分节）、`<article>`（独立内容）、`<aside>`（补充信息）；
- 图文语义：`<figure>`/`<figcaption>`；
- 列表：有序 `<ol>`、无序 `<ul>`、定义 `<dl>`；
- 表格：结构化表头/表体、`scope`/`caption`/`summary`；
- 表单语义：`<label>` 明确指向 `<input>`。

#### 实务取舍

- 优先语义标签：header/nav/main/section/article/aside/footer；
- 使用 `div`：仅作无语义容器且无法匹配语义元素时；
- 通过 `aria-*` 补充语义但不应替代正确的标签选择。

#### 屏幕阅读器导航

- 提供“跳过导航”链接：

```html
<a class="skip-link" href="#main">跳到主要内容</a>
```

- 使用地标与标题层级辅助快速跳转。

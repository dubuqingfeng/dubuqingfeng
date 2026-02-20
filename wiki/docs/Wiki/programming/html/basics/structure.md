### HTML 文档结构与基础

要点速览：`<!doctype html>`、`<html lang>`、`<head>` 元信息、`<body>` 内容、字符集与视口设置等。

#### 核心要点
- DOCTYPE 与标准模式；`<html lang="zh-CN">`；
- `<meta charset="utf-8" />`、`<meta name="viewport" content="width=device-width, initial-scale=1" />`；
- 常用 `<head>`：`<title>`、`<meta name="description" />`、站点图标；
- 结构层次：标题（`<h1>`-`<h6>`）、段落、列表、区块与内联元素；
- 与 CSS/JS 的基本衔接：`<link rel="stylesheet" />`、`<script defer>`。

#### 常用 head 模板

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>页面标题</title>
  <meta name="description" content="页面描述" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="color-scheme" content="light dark" />
</head>
```

#### 文档结构示例

```html
<body>
  <header>...</header>
  <nav aria-label="主导航">...</nav>
  <main id="main">
    <h1>主标题</h1>
    <section aria-labelledby="s1"><h2 id="s1">小节</h2>...</section>
  </main>
  <footer>...</footer>
</body>
```

多语言与方向：`<html lang="en" dir="ltr">`；右到左语言使用 `dir="rtl"`。

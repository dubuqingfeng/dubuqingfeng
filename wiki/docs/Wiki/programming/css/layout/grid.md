### Grid 布局

二维布局方案，适合复杂区域划分与网格对齐。

#### 要点
- 容器：`display:grid`、轨道定义 `grid-template-columns/rows`、区域 `grid-template-areas`；
- 放置：`grid-column`/`grid-row`、自动布局与密集填充；
- 对齐：`justify-content`/`align-content` 与 `justify-items`/`align-items`；
- 响应式：`repeat()`、`minmax()`、`auto-fit/auto-fill`。

#### 区域命名示例

```css
.layout {
  display:grid;
  grid-template-areas:
    'header header'
    'nav    main'
    'footer footer';
  grid-template-columns: 240px 1fr;
}
header{ grid-area: header } nav{ grid-area: nav } main{ grid-area: main } footer{ grid-area: footer }
```

组合实践：用 Grid 划分大区域，用 Flex 布局区域内部元素。

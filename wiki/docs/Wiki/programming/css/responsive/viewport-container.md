### 视口与容器查询

从全局视口到局部容器的响应式控制，便于组件化开发。

#### 要点
- 视口概念：布局视口/视觉视口、`<meta viewport>`；
- 容器查询：`@container` 与 `container-type/name`；
- 组件驱动：避免全局断点耦合，局部自适应。

#### 容器查询示例

```css
.card { container-type: inline-size; }
.card .title { font-size: 1rem; }
@container (min-width: 400px) {
  .card .title { font-size: 1.25rem; }
}
```

兼容性：旧浏览器降级为媒体查询或固定布局；逐步增强不破坏基础可读性。

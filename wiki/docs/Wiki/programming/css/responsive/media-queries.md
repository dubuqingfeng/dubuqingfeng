### 媒体查询（Media Queries）

根据设备特性切换样式，适配不同屏幕与交互方式。

#### 要点
- 断点策略：内容优先而非设备型号；
- 常用特性：`width/height`、`orientation`、`prefers-reduced-motion`、`prefers-color-scheme`；
- 移动优先：自小到大叠加样式；
- 分辨率与 DPR：`resolution`/`image-set()`。

#### 断点命名

```css
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px){ /* lg */ }
```

#### 深色/打印

```css
@media (prefers-color-scheme: dark) { body{ background:#111; color:#eee } }
@media print { a::after { content: ' (' attr(href) ')'; } }
```

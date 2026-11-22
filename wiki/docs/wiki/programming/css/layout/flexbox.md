### Flexbox 布局

一维布局方案，适合行或列方向的对齐与分配。

#### 要点
- 容器属性：`display:flex`、`flex-direction`、`flex-wrap`、`justify-content`、`align-items`、`gap`；
- 项目属性：`flex`（`flex-grow/shrink/basis`）、`align-self`、`order`；
- 常见模式：水平/垂直居中、等高列、自适应间距。

#### 居中与等高示例

```css
.center { display:flex; align-items:center; justify-content:center; }
.columns { display:flex; align-items:stretch; gap:1rem; }
.columns > * { flex: 1 1 0; }
```

最小内容大小：`min-width:auto` 可能导致溢出，必要时设置 `min-width:0` 允许收缩。

取舍：Flex 适合一维分配；Grid 适合二维区域布局。

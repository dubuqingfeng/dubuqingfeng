### 背景与边框

背景层叠、多重背景，边框与圆角等视觉细节控制。

#### 要点
- 多重背景与定位：`background-image/position/size`；
- 边框与圆角：`border` 与 `border-radius` 技巧；
- 裁切与遮罩：`clip-path`、`mask`；
- 设备像素与发丝线处理。

#### 渐变背景

```css
.hero { background: linear-gradient(135deg, #111 0%, #333 100%); color:#fff }
```

可读性：为文字添加半透明遮罩或阴影提升对比度。

#### 复杂形状

```css
.badge { clip-path: polygon(0 0,100% 0,100% 70%,50% 100%,0 70%); }
```

命中区域：使用额外透明层承载点击区域，避免难点中。

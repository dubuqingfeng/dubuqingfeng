### 字体与排版

字体加载策略、字重与连字、中文排版要点。

#### 要点
- 字体族与回退：系统字体、可变字体；
- 加载策略：`@font-face` 与 `font-display`；
- 行高与字距：`line-height`、`letter-spacing`；
- 文本溢出：省略号、多行裁切；
- 中文排版：标点挤压、对齐与段落间距。

#### 可变字体

```css
@font-face {
  font-family: 'InterVar';
  src: url('/fonts/Inter-roman.var.woff2') format('woff2-variations');
  font-display: swap;
}
body { font-family: InterVar, system-ui, sans-serif; }
```

子集化：仅保留用到的字形与范围，显著降低体积；保证回退字体与显示策略。

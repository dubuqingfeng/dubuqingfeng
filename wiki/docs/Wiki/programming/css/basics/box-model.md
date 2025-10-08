### 盒模型（Box Model）

理解内容/内边距/边框/外边距与 `box-sizing` 的关系。

#### 要点
- 标准与替代盒模型：`box-sizing: content-box|border-box`；
- 尺寸计算：宽高包含/不包含 padding/border；
- 外边距重叠（margin collapsing）规则与避免方式；
- 可滚动性与溢出：`overflow` 与滚动条占位。

#### 常见偏差与排查

- 统一 `box-sizing: border-box;` 减少宽高计算误差；
- 检查 margin 重叠：为容器添加边框/内边距或新建 BFC（`overflow:hidden`）；
- 使用开发者工具查看盒模型计算与滚动容器。

#### writing-mode 影响

纵向排版下（`writing-mode: vertical-rl`）内外边距与滚动方向相应变化，需要重新评估布局规则。

### 定位与堆叠上下文

控制元素相对定位与层级呈现，理解 `z-index` 的真正生效条件。

#### 要点
- 定位：`static/relative/absolute/fixed/sticky`；包含块与参考系；
- 堆叠上下文：由定位/变换/不透明度/滤镜等创建；
- `z-index`：仅在同一堆叠上下文内比较；
- 变换与合成：`transform`、`will-change` 的利弊。

#### 遮挡排查

- 确认是否创建了新的堆叠上下文（`position`/`transform`/`opacity<1` 等）；
- 在同一上下文内比较 `z-index`；
- 开发者工具查看层叠上下文可视化。

#### 粘性定位

`position: sticky` 需要祖先容器不是 `overflow: hidden/auto` 的截断上下文，且指定偏移量（如 `top: 0`）。

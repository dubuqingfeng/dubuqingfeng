### Transitions 过渡

基于状态变化的平滑过渡，简化交互反馈与层级变化。

#### 要点
- 基本语法：`transition-property/duration/timing-function/delay`；
- 常见属性：不建议对 `width/height` 过渡（引发布局）；优先 `transform/opacity`；
- 缓动函数：自定义 `cubic-bezier`；
- 可访问性：减少动画偏好（`prefers-reduced-motion`）。

#### 类名切换过渡

```css
.panel { opacity: 0; transform: translateY(8px); transition: opacity .2s ease, transform .2s ease; }
.panel.open { opacity: 1; transform: translateY(0); }
```

配合 JS：切换 `.open` 类名，避免直接操作内联样式。

#### 减少动画偏好

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

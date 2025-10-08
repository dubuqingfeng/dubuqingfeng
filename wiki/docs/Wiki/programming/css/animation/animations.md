### Animations 关键帧动画

使用 `@keyframes` 自定义连续动画，注意性能与可控性。

#### 要点
- 基本语法：`@keyframes` 与 `animation-*` 属性；
- 循环与方向：`iteration-count`、`direction`、`fill-mode`；
- 性能：`transform/opacity` 优先，避免强制重排；
- 动画中断与状态复位策略。

#### 关键帧与变量

```css
@keyframes float { from { transform: translateY(0) } to { transform: translateY(-10px) } }
.ball { --dur: 2s; animation: float var(--dur) ease-in-out infinite alternate; }
```

与 JS 协作：复杂物理动画可用 Web Animations API/GSAP；纯视觉优先 CSS，交互驱动适合 JS。

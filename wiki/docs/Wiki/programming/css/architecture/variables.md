### CSS 变量（自定义属性）

通过 `--var` 与 `var()` 管理主题与可配置值，增强可维护性。

#### 要点
- 作用域与继承：根变量与局部覆盖；
- 动态切换：主题/暗色模式、运行时更新；
- 与预处理变量差异：运行时 vs 构建时。

#### 主题系统

```css
:root {
  --bg: #fff; --fg: #111; --primary: #2d6cdf;
}
[data-theme="dark"] {
  --bg: #111; --fg: #eee; --primary: #8ab4f8;
}
body { background: var(--bg); color: var(--fg); }
.btn { background: var(--primary); }
```

建议：变量按领域分组（色彩/间距/排版），结合 `@layer` 控制覆盖顺序。

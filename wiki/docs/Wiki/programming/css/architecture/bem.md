### 命名与组织（BEM 等）

通过 BEM/OOCSS/ITCSS 等方法论组织样式，降低耦合与冲突。

#### 要点
- BEM 约定：Block__Element--Modifier；
- 分层组织：基础/组件/工具/覆盖；
- 可维护性：命名一致性、低特异性、可组合；
- 与现代特性：`@layer`、CSS Modules、原子化方案对比。

#### 分层示例

- base：重置与通用排版；components：可复用组件类；utilities：工具类（如 `.mt-2`）。

```css
/* BEM 命名 */
.card {}            /* Block */
.card__title {}     /* Element */
.card--featured {}  /* Modifier */
```

#### 与设计令牌协作

- 设计令牌 → CSS 变量：`--color-primary`、`--space-2`; 通过主题切换与 `@layer` 管理覆盖。

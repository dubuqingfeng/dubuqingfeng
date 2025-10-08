### 层叠与优先级（Cascade & Specificity）

控制样式冲突的基础：来源、重要性、特异性与顺序。

#### 要点
- 层叠顺序：用户代理 < 用户 < 作者；普通 < `!important`；
- 特异性计算：ID > 类/属性/伪类 > 类型/伪元素；
- 来源顺序：后出现覆盖先出现；
- 现代特性：`@layer` 分层、`initial/revert/unset`。

#### 替代 `!important`

- 降低特异性（使用类而非 ID）；
- 调整加载顺序或使用 `@layer` 明确层次；
- 在组件边界使用变量/接口暴露可覆盖点。

#### `@layer` 示例

```css
@layer reset, base, components, utilities;

@layer reset { *,*::before,*::after{ box-sizing:border-box } }
@layer base { body{ line-height:1.5 } }
@layer components { .btn{ padding:.5rem 1rem } }
@layer utilities { .mt-2{ margin-top:.5rem } }
```

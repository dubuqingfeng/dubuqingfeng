### 语法与选择器概览

覆盖选择器、伪类/伪元素、常见语法规则与调试要点。

#### 要点
- 选择器：类型/类/ID/属性/伪类（`:hover`）/伪元素（`::before`）；
- 组合与关系：后代、子代、兄弟；
- 规则结构：选择器 + 声明块 `{ property: value; }`；
- 调试：开发者工具的计算样式与来源定位。

#### 性能建议

- 尽量使用类选择器；避免过深后代选择器；
- 降低特异性，便于覆盖与维护。

#### 结构伪类示例

```css
/* 奇偶行着色 */
table tr:nth-child(odd) { background: #fafafa; }
table tr:nth-child(even) { background: #fff; }

/* 仅选择第一个/最后一个元素 */
.list > :first-child { margin-top: 0; }
.list > :last-child { margin-bottom: 0; }
```

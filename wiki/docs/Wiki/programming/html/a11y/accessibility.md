### 可访问性基础（A11y）

通过语义与 ARIA 提升可访问性：标签、可聚焦、键盘可用与对比度。

#### 要点
- 文本替代：`alt`、`aria-label`、`aria-labelledby`、`aria-describedby`；
- 地标与导航：`header/nav/main/footer` 与 `role`；
- 键盘交互：`tabindex`、焦点可见性、陷阱避免；
- 颜色对比：遵循 WCAG 对比度建议；
- 表单与错误：关联提示内容、朗读顺序。

#### 对话框 ARIA 模式

```html
<div role="dialog" aria-labelledby="dlgTitle" aria-modal="true" hidden>
  <h2 id="dlgTitle">标题</h2>
  <p>内容</p>
  <button aria-label="关闭">×</button>
</div>
```

管理焦点：打开时将焦点移入对话框，关闭时还原；设置焦点陷阱避免泄露到背景。

#### 测试要点

- 使用屏幕阅读器（NVDA/VoiceOver）检查朗读顺序与可达性；
- 键盘遍历：Tab/Shift+Tab/Arrows；
- 对比度工具核验文字与背景。

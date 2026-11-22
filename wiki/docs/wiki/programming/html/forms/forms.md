### 表单与校验

覆盖输入类型、可访问性标注、浏览器内建约束校验与自定义校验实践。

#### 要点
- 输入类型：`type=email/url/number/date` 等；占位符 vs 标签；
- 可访问性：`<label for>`、`aria-describedby`、焦点顺序与键盘可用；
- 约束校验 API：`required`、`pattern`、`min/max`、`checkValidity()`、自定义 `setCustomValidity()`；
- 表单结构：`<fieldset>`/`<legend>`、错误提示与无障碍朗读；
- 安全：自动完成与敏感数据、CSRF token（与后端协同）。

#### 示例：原生约束 + 自定义消息

```html
<form id="f">
  <label for="email">邮箱</label>
  <input id="email" name="email" type="email" required />
  <span id="emailHelp" aria-live="polite"></span>
  <button>提交</button>
</form>
<script>
  const email = document.getElementById('email');
  const help = document.getElementById('emailHelp');
  email.addEventListener('input', () => {
    if (email.validity.typeMismatch) {
      email.setCustomValidity('请输入有效邮箱');
    } else {
      email.setCustomValidity('');
    }
    help.textContent = email.validationMessage;
  });
  document.getElementById('f').addEventListener('submit', (e) => {
    if (!email.checkValidity()) e.preventDefault();
  });
  // 服务端仍需验证，防止绕过
</script>
```

#### 自定义控件的 A11y

- 使用 `role`（如 `role="switch"`）、`aria-checked` 表示状态；
- 可聚焦与键盘交互：`tabindex="0"`、Space/Enter 切换；
- 关联说明：`aria-labelledby`/`aria-describedby`。

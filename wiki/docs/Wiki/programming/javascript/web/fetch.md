### Fetch API 与实践

#### ToC

- 基本用法与超时
- JSON/表单/流式响应
- 重试与中断

#### 基本用法与超时

```js
const ac = new AbortController()
const t = setTimeout(() => ac.abort(), 8000)
const res = await fetch(url, { method: 'GET', signal: ac.signal })
clearTimeout(t)
```

#### JSON/表单/流式响应

- `await res.json()` / `await res.text()`；
- 表单：`new FormData(form)`；
- 流式：`res.body`（ReadableStream）配合 `getReader()` 按块处理。

#### 重试与中断

- 幂等请求才重试；指数退避 + 抖动；
- 使用 `AbortController` 取消挂起请求，避免泄漏。


### Promise/async-await 原理

#### ToC

- Promise 状态机
- 链式调用与返回规则
- async/await 语义
- 错误处理与取消

#### Promise 状态机

- 三态：pending → fulfilled/rejected；状态只迁移一次；
- `then(onFulfilled, onRejected)` 返回新的 Promise，回调结果决定下一步状态。

#### 链式调用与返回规则

- 返回值为普通值 → 包装为 fulfilled；
- 返回另一个 Promise → “采纳”其状态；
- 抛异常 → 转为 rejected；
- then 回调总在微任务队列中执行。

#### async/await 语义

- `async` 函数返回 Promise；`await` 会暂停函数并在 Promise 解决后恢复；
- `await` 只“顺序化”当前异步函数，外部仍不阻塞主线程；
- 并发场景使用 `Promise.all/any/allSettled` 提升吞吐。

#### 错误处理与取消

- 用 `try/catch` 捕获 `await` 抛出的拒绝；链路末端使用 `.catch` 防止未处理拒绝；
- 取消（AbortController）：

```js
const ac = new AbortController();
fetch(url, { signal: ac.signal });
ac.abort();
```


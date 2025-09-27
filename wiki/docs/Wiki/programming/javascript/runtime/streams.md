### Node Streams（流）

#### ToC

- 类型与模式
- 背压与管道
- 异步与 Promise 化
- 常见坑与实践

#### 类型与模式

- 可读流（Readable）/可写流（Writable）/双工（Duplex）/转换（Transform）。
- 模式：flowing 模式（自动 `data` 事件）与 paused 模式（手动 `read()`）。

#### 背压与管道

- 背压：下游处理不过来时上游应暂停推送；
- 使用 `stream.pipeline` 处理背压与错误冒泡：

```js
import { pipeline } from 'node:stream/promises'
await pipeline(src, transform, dest)
```

#### 异步与 Promise 化

- Node 16+ 推荐 `node:stream/promises`；老版本可使用 `util.promisify(stream.pipeline)`。

#### 常见坑与实践

- 统一错误处理（监听 `error`）；
- 避免混用旧 API 与新 API（callback vs promises）；
- 大文件/网络中优先流式处理而非一次性读入内存。


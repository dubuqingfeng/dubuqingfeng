### 流与背压（Streams）

Node 的 Stream 抽象支持高效 I/O 与背压控制，类型包含 Readable/Writable/Duplex/Transform。

#### 要点
- 模式：flowing 与 paused；`pipeline` 组合与错误传播；
- 背压：`write()` 返回值与 `drain` 事件；
- Promise 化与 async iterator；
- 参考：更系统的内容见 JavaScript 章节的[Node Streams（流）](../../javascript/runtime/streams.md)。

#### 示例：文件压缩管道

```js
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';

await pipeline(
  createReadStream('input.txt'),
  zlib.createGzip(),
  createWriteStream('output.txt.gz')
);
```

#### 示例：手动处理背压

```js
import { once } from 'node:events';

async function writeMany(writable, chunks) {
  for (const chunk of chunks) {
    if (!writable.write(chunk)) {
      await once(writable, 'drain'); // 背压释放后继续
    }
  }
  writable.end();
}
```

#### 示例：Async iterator 读取

```js
for await (const buf of createReadStream('big.bin')) {
  // 逐块处理
}
```

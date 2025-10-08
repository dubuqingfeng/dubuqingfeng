### NIO/NIO.2 核心概念

#### ToC

- Buffer/Channel/Selector
- 阻塞 IO vs NIO vs AIO
- 零拷贝与直接缓冲区
- 文件与网络常用示例

#### Buffer/Channel/Selector

- `Buffer`：容量/位置/界限的抽象，常见 `ByteBuffer`、`CharBuffer`；
- `Channel`：双向通道，`FileChannel`、`SocketChannel` 等；
- `Selector`：多路复用，注册通道的感兴趣事件（OP_READ/OP_WRITE/OP_ACCEPT）。

```java
Selector selector = Selector.open();
ServerSocketChannel ssc = ServerSocketChannel.open();
ssc.configureBlocking(false);
ssc.register(selector, SelectionKey.OP_ACCEPT);
while (true) {
  selector.select();
  for (SelectionKey key : selector.selectedKeys()) {
    // 处理 accept/read/write
  }
}
```

#### 阻塞 IO vs NIO vs AIO（NIO.2）

- 阻塞 IO：每连接一线程，简单但扩展性差；
- NIO：单线程处理多连接事件，减少线程上下文切换；
- AIO：异步通道与回调/`Future`，由系统完成异步操作（需要 OS 支持）。

#### 零拷贝与直接缓冲区

- `MappedByteBuffer`/`FileChannel#transferTo` 等可减少用户态与内核态拷贝；
- 直接缓冲区（`allocateDirect`）在堆外，减少一次拷贝，但分配/回收成本更高。

#### 文件与网络常用示例

- 文件复制：`Files.copy`、`FileChannel#transferTo/transferFrom`；
- 异步文件 IO：`AsynchronousFileChannel` 结合回调或 `Future`。

```java
// Files.copy 简单复制
Files.copy(Path.of("a.dat"), Path.of("b.dat"), StandardCopyOption.REPLACE_EXISTING);

// 零拷贝传输（可能由内核优化）
try (FileChannel in = FileChannel.open(Path.of("a.dat"));
     FileChannel out = FileChannel.open(Path.of("b.dat"), StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
  long pos = 0, size = in.size();
  while (pos < size) pos += in.transferTo(pos, size - pos, out);
}
```

### 异常机制与最佳实践

#### ToC

- 受检异常 vs 非受检异常
- 异常的传播与屏蔽
- 资源管理与 try-with-resources
- 设计与分层

#### 受检异常 vs 非受检异常

- 受检（`Exception` 但不含 `RuntimeException`）：必须显式处理或声明；适合可恢复/可预期错误；
- 非受检（`RuntimeException`/`Error`）：编程错误或不可恢复情况；
- 过度使用受检异常会污染调用栈签名，现代实践倾向于少量受检 + 语义明确的非受检异常。

#### 异常的传播与屏蔽

- 切勿吞掉异常：至少记录上下文并重新抛出（可包裹为领域异常）；
- 注意异常屏蔽：在 `finally`/`close()` 抛出的异常可能覆盖主异常。`try-with-resources` 会将关闭时异常作为“抑制异常”附加。

#### 资源管理与 try-with-resources

```java
try (InputStream in = Files.newInputStream(p);
     OutputStream out = Files.newOutputStream(q)) {
  in.transferTo(out);
} // 自动 close，抑制异常可从 e.getSuppressed() 获取
```

#### 设计与分层

- 为不同层定义合适的异常边界：DAO → Service → API，避免底层细节渗出；
- 结合错误码与可观察性（日志/追踪）定位问题；
- 在异步/线程池中，使用 `Future`/`CompletableFuture` 统一处理异常。


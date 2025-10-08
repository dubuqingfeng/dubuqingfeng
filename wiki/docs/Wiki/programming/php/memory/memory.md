### 内存管理与性能要点

OPcache、JIT、内存占用与对象复制，性能调优的常见抓手。

#### OPcache 与 JIT

`php.ini`：

```ini
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=256
opcache.validate_timestamps=0
opcache.jit=tracing
opcache.jit_buffer_size=128M
```

生产建议：禁用 timestamp 验证、发布后 `opcache_reset()` 或重启 FPM。

#### Profiling

- Xdebug profiler：生成 cachegrind，用 KCachegrind 分析；
- XHProf/Tideways：在线采样分析，开销更小；
- 结合 APM 与系统指标定位瓶颈。

#### 内存与字符串优化

- 避免不必要复制：对大字符串使用流式处理（fopen/stream_filter）；
- 谨慎 `json_encode/decode` 热路径；
- 使用生成器 `yield` 处理大数据集合。

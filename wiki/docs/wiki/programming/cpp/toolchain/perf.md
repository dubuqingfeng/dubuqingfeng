### 性能分析（perf/valgrind）

Linux perf（采样）：

```bash
perf record -g -- ./app
perf report
```

Valgrind Callgrind（调用图）：

```bash
valgrind --tool=callgrind ./app
kcachegrind callgrind.out.*
```

注意：采样对优化敏感；插桩工具开销大，适合离线分析与热点确认。


### 浏览器渲染与性能优化（概览）

- 关键渲染路径：HTML/样式计算/布局/绘制/合成；
- 避免强制同步布局（layout thrashing）：合并读写 DOM，使用 `requestAnimationFrame`；
- 复合层提升与 `will-change`：谨慎使用，避免内存浪费；
- 长任务分片（`requestIdleCallback`/`scheduler.postTask`）；
- 网络优化：HTTP/2 多路复用、gzip/brotli、缓存策略；
- 性能度量：Performance API、LCP/FID/CLS、Lighthouse/Profiler。


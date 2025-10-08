### 浏览器渲染与性能优化（概览）

- 关键渲染路径：HTML/样式计算/布局/绘制/合成；
- 避免强制同步布局（layout thrashing）：合并读写 DOM，使用 `requestAnimationFrame`；
- 复合层提升与 `will-change`：谨慎使用，避免内存浪费；
- 长任务分片（`requestIdleCallback`/`scheduler.postTask`）；
- 网络优化：HTTP/2 多路复用、gzip/brotli、缓存策略；
- 性能度量：Performance API、LCP/FID/CLS、Lighthouse/Profiler。

#### 示例：rAF 中批量 DOM 更新

```js
requestAnimationFrame(() => {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 1000; i++) {
    const li = document.createElement('li');
    li.textContent = String(i);
    frag.appendChild(li);
  }
  list.appendChild(frag);
});
```

#### RUM：关键指标上报

```js
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    // 上报 e.name/e.value 等
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

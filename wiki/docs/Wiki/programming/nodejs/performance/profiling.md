### 性能分析与定位

CPU/内存/事件循环延迟的可观测性，工具链包含内置 inspector、Chrome DevTools、clinic.js 等。

#### 要点
- CPU 分析：`--cpu-prof`、inspector、`0x`、clinic flame；
- 堆与泄漏：堆快照、`--heap-prof`、`leakage`/`memlab` 等；
- 事件循环延迟：`perf_hooks.monitorEventLoopDelay`；
- 跟踪：`async_hooks` 与 AsyncLocalStorage；
- 指标：p99 延迟、RPS、错误率与背压信号。

#### 示例：CPU/堆分析（最小侵入）

```bash
node --cpu-prof app.js     # 生成 isolate-*.cpuprofile
node --heap-prof app.js    # 采集堆快照
```

在 Chrome DevTools → Performance/Memory 打开文件查看火焰图与分配情况。

#### 示例：Inspector 与 Clinic

```bash
node --inspect=0.0.0.0:9229 app.js  # DevTools 远程调试
npx clinic flame -- node app.js      # 采集 CPU 火焰图
```

#### 事件循环延迟监控

```js
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay();
h.enable();
setInterval(() => console.log('p99(ms)=', (h.percentile(99)/1e6).toFixed(1)), 1000);
```

定位流程示例：先看指标（CPU/内存/EL 迟滞）→ 采样 CPU/堆 → 关联路由与外部依赖 → 重放最小复现。

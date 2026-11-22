### 性能与最佳实践

围绕关键渲染路径优化、资源加载策略与首屏交互体验。

#### 要点
- 关键渲染路径（HTML/CSSOM/布局/绘制/合成）；
- 资源加载：`<link rel=preconnect|dns-prefetch|preload />`、`defer/async`；
- 图片/字体优化：现代格式、懒加载、字体显示策略（`font-display`）；
- 减少阻塞：内联关键 CSS、减少同步脚本；
- 指标参考：LCP/CLS/INP/TTFB。

#### 资源提示示例

```html
<!-- 预连接第三方域名（DNS/TLS 预热） -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin />
<!-- 关键字体/样式预加载 -->
<link rel="preload" as="style" href="/css/critical.css" />
<link rel="preload" as="font" type="font/woff2" href="/fonts/Inter.woff2" crossorigin />
```

#### 实测与监控

- Lighthouse/Pagespeed 分析实验环境；
- Navigation Timing/Performance API 采集真实用户数据（RUM）；
- 关注 LCP/CLS/INP 与资源阻塞点。

### 阴影与滤镜

`box-shadow`/`filter` 提升层次与质感，注意性能与可访问性。

#### 要点
- 投影与分层：多重阴影、内阴影；
- 滤镜：`blur`/`brightness`/`grayscale` 等；
- 性能：GPU 合成与重绘成本；
- 对比度与可读性：避免过度模糊影响可访问性。

#### 毛玻璃（frosted glass）

```css
.glass {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
}
```

动画优化：对 `filter/blur` 动画谨慎使用，优先 `transform/opacity`，必要时降低半径与帧率。

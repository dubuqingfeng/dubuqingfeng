### 多媒体与图片

图片与媒体加载的语义、性能与自适应处理。

#### 要点
- 图片：`<img />` 与懒加载 `loading="lazy"`；响应式 `srcset`/`sizes`；`<picture>`/`<source />` 选择不同格式；
- 视频/音频：`<video>`/`<audio>` 与 `controls`/`preload`；字幕/描述 `track kind="captions"`；
- 性能：现代格式（WebP/AVIF）、尺寸裁剪、解码时机与占位（LQIP）。

#### 示例：`<picture>` 响应式图片

```html
<picture>
  <source type="image/avif" srcset="/img/hero.avif" />
  <source type="image/webp" srcset="/img/hero.webp" />
  <img src="/img/hero.jpg" alt="某场景照片" width="1200" height="600" loading="lazy" />
  <figcaption>示例图</figcaption>
</picture>
```

#### 可访问性

- 视频添加字幕：

```html
<video controls preload="metadata">
  <source src="movie.mp4" type="video/mp4" />
  <track kind="captions" src="movie.zh.vtt" srclang="zh" label="中文字幕" default />
</video>
```

- 避免自动播放有声视频；为音频提供文字替代。

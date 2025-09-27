### Service Worker 概览

#### ToC

- 生命周期与作用域
- 缓存与离线
- 更新策略

#### 生命周期与作用域

- 安装（install）→ 激活（activate）→ 运行；作用域由注册路径决定；仅 HTTPS 环境。

#### 缓存与离线

- 使用 Cache Storage：

```js
self.addEventListener('fetch', e => {
  e.respondWith((async () => {
    const cache = await caches.open('v1')
    const cached = await cache.match(e.request)
    if (cached) return cached
    const res = await fetch(e.request)
    cache.put(e.request, res.clone())
    return res
  })())
})
```

#### 更新策略

- Cache-first / Network-first / Stale-while-revalidate；
- 处理好跳版本激活与客户端刷新（`skipWaiting`/`clients.claim`）。


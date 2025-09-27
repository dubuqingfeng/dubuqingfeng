### ts-reset 实战

- ts-reset 通过覆盖 lib 定义修正 JS 标准库的一些宽松类型（如 `Object.keys` 返回更窄的键联合）。
- 用法：

```ts
// 安装后在项目入口最前导入
import 'ts-reset'
```

- 注意：与部分 polyfill 类型可能冲突，逐步引入并在 CI 中观察类型差异。


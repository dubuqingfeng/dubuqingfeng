### 构建工具（esbuild/Rollup/tsup）

- esbuild：极快的打包/转译器；适合工具/服务端构建；
- Rollup：库打包首选，产物精简；
- tsup：基于 esbuild 封装，零配置打包 TS 库（支持 cjs/esm/dts）。

示例（tsup.config.ts）：

```ts
import { defineConfig } from 'tsup'
export default defineConfig({ entry: ['src/index.ts'], dts: true, format: ['esm', 'cjs'], sourcemap: true, clean: true })
```


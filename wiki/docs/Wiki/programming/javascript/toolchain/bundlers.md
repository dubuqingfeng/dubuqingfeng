### 打包与 Tree Shaking（Vite/Webpack/Rollup）

#### 要点

- Tree Shaking 前提：ESM 静态导入、无副作用；
- 标注副作用：`package.json` 中 `sideEffects: false | ["*.css", "polyfills.js"]`；
- Vite 基于 ESBuild/Rollup，开发快、生产用 Rollup 打包；
- Webpack 侧：开启 `optimization.usedExports`、`concatenateModules`、`splitChunks`；
- Rollup 偏库打包，产物精简。

#### 调试 Tree Shaking

- 查看产物分析（`rollup-plugin-visualizer`/`webpack-bundle-analyzer`/`vite --profile`）。
- 避免动态 `require` 与通配导入；优先命名导出；
- 副作用模块隔离到显式入口。


### ESM 与 CommonJS 模块系统

#### ToC

- 语法与差异
- 加载与缓存
- 互操作

#### 语法与差异

- ESM：`import/export` 静态语法，支持 Tree Shaking；默认严格模式；
- CJS：`require/module.exports` 动态；
- 浏览器与 Node 均支持 ESM（Node 需 `.mjs` 或 `package.json"type":"module"`）。

#### 加载与缓存

- 模块只初始化一次，后续导入复用缓存；
- ESM 的绑定是 live binding（导出引用值，更新可见）。

#### 互操作

- 在 Node 中通过 `createRequire` 或打包工具实现互操作；
- 默认导出与命名导出的互转需注意打包工具配置。


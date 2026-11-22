### 模块系统：ESM 与 CommonJS

Node 同时支持 CJS（`require/module.exports`）与 ESM（`import/export`），两者有差异与互操作边界。

#### 要点
- 识别：`type: module`、`.mjs`/`.cjs`、`package.json#exports`；
- 互操作：`import()` 动态加载 CJS、`createRequire` 在 ESM 中使用 CJS；
- 路径与解析：URL vs 相对路径、裸模块解析策略；
- 顶层 await：仅 ESM 支持；
- Tree Shaking 与打包器：ESM 友好，注意运行时差异。

#### 示例：双包导出（CJS/ESM）

`package.json`：

```json
{
  "name": "awesome-pkg",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

在 ESM 中使用 CJS：

```js
// index.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cjsOnly = require('some-cjs-lib');
```

在 CJS 中动态导入 ESM：

```js
// index.cjs
async function load() {
  const esm = await import('some-esm-lib');
}
```

Monorepo 建议：使用 workspace + `exports` 限制私有路径；统一 TS 路径别名与打包/测试工具的解析策略。

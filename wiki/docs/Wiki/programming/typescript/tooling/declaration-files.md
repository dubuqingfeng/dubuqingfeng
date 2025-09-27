### 声明文件与 ambient 模块

#### ToC

- .d.ts 基础
- 模块补充与合并
- 发布类型与三方库类型

#### .d.ts 基础

- 为 JS 提供类型：`declare function f(x: number): void;`；
- 全局扩展：`declare global { interface Window { myApi: any } }`；

#### 模块补充与合并

- 模块补充（module augmentation）：

```ts
declare module 'foo' { export function bar(x: number): string }
```

- 声明合并：接口、命名空间同名会合并成员。

#### 发布类型与三方库类型

- 优先自带 `types`；否则使用 `@types/xxx`；
- 发布库时在 `package.json` 指定 `types` 并生成 `.d.ts`；


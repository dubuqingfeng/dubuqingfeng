### 严格模式与 any 最小化

- 开启 `strict` 并尽量用 `unknown` 代替 `any`；
- 外部输入尽早校验与窄化（zod/io-ts/yup）；
- 使用 `satisfies` 保留字面量推断同时做约束检查；
- 渐进式改造：引入 `eslint` 规则限制 `any` 与 `@ts-ignore`。


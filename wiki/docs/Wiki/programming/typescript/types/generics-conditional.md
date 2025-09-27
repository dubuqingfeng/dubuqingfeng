### 泛型与条件类型

#### ToC

- 泛型与约束
- 默认类型参数
- 条件类型与分配律
- `infer` 与模式匹配

#### 泛型与约束

```ts
function id<T>(x: T): T { return x }
function pluck<T, K extends keyof T>(obj: T, keys: K[]): T[K][] { return keys.map(k => obj[k]) }
```

#### 默认类型参数

```ts
type Box<T = unknown> = { value: T };
```

#### 条件类型与分配律

`T extends U ? X : Y`；当 `T` 为联合类型时具有分配律（对每个成员分配计算）。

```ts
type Nullish = null | undefined;
type NonNull<T> = T extends Nullish ? never : T;
```

#### infer 与模式匹配

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;
type ReturnTypeOf<T> = T extends (...args: any) => infer R ? R : never;
```


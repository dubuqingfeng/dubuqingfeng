### 高级技巧与类型体操（实用）

#### ToC

- 递归与深层工具类型
- 可选键提取与过滤
- 字符串/数组类型运算

#### 递归与深层工具类型

```ts
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] }
```

#### 可选键提取与过滤

```ts
type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T]
type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }
```

#### 字符串/数组类型运算

```ts
type Split<S extends string, D extends string> =
  S extends `${infer A}${D}${infer B}` ? [A, ...Split<B, D>] : [S]
type Join<T extends string[], D extends string> =
  T extends [infer A extends string, ...infer R extends string[]] ? `${A}${R['length'] extends 0 ? '' : D}${Join<R, D>}` : ''
```


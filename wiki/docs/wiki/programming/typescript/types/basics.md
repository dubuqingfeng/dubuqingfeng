### 类型基础与常用内置

#### ToC

- 基本类型与对象类型
- 数组/元组与 `readonly`
- `any/unknown/never/void`
- 枚举与字面量类型

#### 基本类型与对象类型

```ts
let s: string = 'x';
let n: number = 42;
let b: boolean = true;
let o: { id: string; name?: string } = { id: '1' };
```

可选属性 `?` 与索引签名：`{ [k: string]: number }`。

#### 数组/元组与 readonly

```ts
const xs: number[] = [1, 2];
const ys: Array<number> = [1, 2];
const pair: readonly [number, string] = [1, 'a'];
```

`readonly` 防止写入但不深层不可变；可与 `as const` 配合生成字面量类型。

#### any/unknown/never/void

- `any` 放弃类型检查；尽量避免。
- `unknown` 更安全，使用前需窄化。
- `never` 表示不可能触达的类型（抛异常、无限循环、穷尽检查）。
- `void` 表示无返回值。

#### 枚举与字面量类型

- 推荐使用联合字面量替代传统 `enum`：

```ts
type Color = 'red' | 'green' | 'blue';
```


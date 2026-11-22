### 映射类型与模板字面量类型

#### ToC

- keyof/in 与映射类型
- 可选/只读修饰符
- 模板字面量类型与字符串操作

#### keyof/in 与映射类型

```ts
type Flags<T> = { [K in keyof T]: boolean };
```

#### 可选/只读修饰符

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
```

#### 模板字面量类型与字符串操作

```ts
type EventName<T extends string> = `on${Capitalize<T>}`;
type Getter<T extends string> = `get${Capitalize<T>}`;
```


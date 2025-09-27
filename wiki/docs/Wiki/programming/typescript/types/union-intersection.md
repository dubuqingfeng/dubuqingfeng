### 联合/交叉与控制流分析

#### ToC

- 联合与可判别联合
- 交叉类型
- 控制流分析与窄化

#### 联合与可判别联合

```ts
type Res = { ok: true; value: string } | { ok: false; error: Error };
function f(r: Res) { if (r.ok) console.log(r.value); else console.error(r.error); }
```

共享的判别字段（如 `type`/`kind`/`ok`）让编译器自动窄化。

#### 交叉类型

`A & B` 组合两个对象类型；若成员冲突需处理兼容性。

#### 控制流分析与窄化

- `typeof/instanceof/in`、判空、等值比较、用户自定义守卫可触发窄化。

```ts
function isStr(x: unknown): x is string { return typeof x === 'string'; }
```


### 泛型与类型擦除

#### ToC

- 类型擦除与桥接方法
- 通配符与边界
- 类型推断与方法泛型
- 受限与局限

#### 类型擦除与桥接方法

Java 泛型在编译期生效，运行期类型被擦除为原始类型，并通过合成的桥接方法保持多态一致性：

```java
class Box<T> { T value; void set(T v) { value = v; } }
class StringBox extends Box<String> {
  @Override void set(String v) { super.set(v); }
  // 编译器可能生成 bridge: void set(Object v) { set((String)v); }
}
```

后果：不能直接创建泛型数组、不能在运行时获取精确类型参数（需借助 `TypeToken`/`Class<T>` 传递）。

#### 通配符与边界

- 上界 `? extends T`：生产者使用上界（PECS 原则），可读不可写（除了 `null`）；
- 下界 `? super T`：消费者使用下界，可安全写入 `T` 及其子类，读为 `Object`；
- 多重边界：`<T extends A & B>`。

#### 类型推断与方法泛型

方法级泛型：

```java
static <T> T pick(T a, T b) { return a != null ? a : b; }
var x = pick("a", null); // 推断 T 为 String
```

菱形语法：`new HashMap<String, Integer>()` → `new HashMap<>()`。

#### 受限与局限

- 无法重载仅参数化不同的泛型方法（擦除后签名冲突）；
- 不能直接 `new T()`（需传 `Supplier<T>` 或 `Class<T>` 反射）；
- 若需要运行期保留类型参数，考虑使用 Kotlin/Scala 或在 Java 中通过 `TypeReference` 间接实现。


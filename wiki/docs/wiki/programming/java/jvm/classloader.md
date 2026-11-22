### 类加载与初始化

#### ToC

- 类加载阶段
- 双亲委派模型
- 自定义 ClassLoader
- 初始化顺序与静态块

#### 类加载阶段

类从 `.class` → 运行时可用经历：加载（Load）→ 连接（Link：验证 Verify、准备 Prepare、解析 Resolve）→ 初始化（Initialize）。

- 验证：字节码结构、符号引用等正确性检查；
- 准备：为静态字段分配内存并设默认值；
- 解析：符号引用→直接引用（可能延迟）；
- 初始化：执行 `<clinit>`（静态初始化块/静态字段初始化）。

#### 双亲委派模型

Bootstrap → Platform → App（系统）ClassLoader，自上而下委派加载，防止核心类被篡改，确保同类唯一性。

- 委派顺序：先问父加载器能否加载，不能再自己尝试；
- 破坏委派：某些容器/插件系统需“倒置”或组合策略（如 OSGi、Tomcat WebAppClassLoader）。

#### 自定义 ClassLoader

覆盖 `findClass`/`loadClass` 实现自定义来源（网络、加密文件等），典型伪代码：

```java
class XClassLoader extends ClassLoader {
  @Override protected Class<?> findClass(String name) throws ClassNotFoundException {
    byte[] bytes = fetchBytes(name); // 从自定义介质读取
    return defineClass(name, bytes, 0, bytes.length);
  }
}
```

注意：

- 同一个 `Class` 由不同 `ClassLoader` 加载即视为不同类型；
- 类卸载与 `Metaspace`：仅当 `ClassLoader` 可达性断开且无类实例存活时才可卸载。

#### 初始化顺序与静态块

- 子类初始化前先初始化父类；
- 同一类只初始化一次；
- 触发初始化的时机：`new`、访问静态字段/方法、反射、`main` 所在类等。


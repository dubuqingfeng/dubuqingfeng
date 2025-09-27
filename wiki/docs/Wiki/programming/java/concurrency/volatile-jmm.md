### Java 内存模型 JMM 与 volatile

#### ToC

- JMM 概念与重排序
- happens-before 规则
- volatile 语义
- final 字段语义
- 双重检查锁定 DCL

#### JMM 概念与重排序

Java 内存模型（JMM）定义了线程与主内存之间的交互、可见性与有序性规则。编译器与 CPU 可能进行重排序优化，但需在 JMM 约束下保持程序在多线程下的正确性（happens-before 一致）。

常见重排序：

- 编译器重排：指令选择、合并等
- CPU 重排：乱序执行、存储缓冲区
- 内存系统：高速缓存、写缓冲导致的可见性延迟

#### happens-before 规则（部分）

- 程序次序：单线程内按代码顺序
- 监视器锁：解锁 happens-before 随后对同一锁的加锁
- volatile：对一个 volatile 写 happens-before 随后的读
- 线程启动：`Thread.start()` happens-before 子线程中任何动作
- 线程终止：线程中动作 happens-before 其他线程成功 `join()`
- 传递性：若 A happens-before B，B happens-before C，则 A happens-before C

#### volatile 语义

- 可见性：对 volatile 变量的写入立刻对其他线程可见。
- 有序性：禁止特定方向的重排序（写-读加内存屏障），常用于发布标志/单次写多次读。
- 不保证原子性：`count++` 在并发下仍然竞态，需使用原子类或显式同步。

发布-订阅示例：

```java
class ConfigHolder { volatile Config cfg; }
// 写线程
holder.cfg = newCfg; // 对后续读线程可见
// 读线程
Config c = holder.cfg;
```

#### final 字段语义

- 对象构造完成后，对 `final` 字段的初始化对其他线程可见（安全发布的重要前提：不发生 `this` 逸出）。
- 允许编译器对 `final` 进行更激进优化（不可变对象）。

#### 双重检查锁定 DCL

正确示例必须结合 `volatile` 防止重排序：

```java
class Singleton {
  private static volatile Singleton INSTANCE;
  private Singleton() {}
  public static Singleton get() {
    if (INSTANCE == null) {
      synchronized (Singleton.class) {
        if (INSTANCE == null) INSTANCE = new Singleton();
      }
    }
    return INSTANCE;
  }
}
```

若未使用 `volatile`，构造与赋值可能被重排，其他线程读到“未完全构造”的对象。


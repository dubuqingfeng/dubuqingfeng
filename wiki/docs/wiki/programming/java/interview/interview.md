### Java 高频题要点

整理一些常问知识点与速记：

#### 并发

- JMM happens-before 规则、volatile 语义、DCL 单例；
- synchronized vs ReentrantLock、Condition、AQS 队列；
- ThreadPoolExecutor 参数、拒绝策略、execute vs submit；
- ConcurrentHashMap 设计、size 近似计算、compute 系列；

#### JVM

- 类加载阶段、双亲委派、自定义 ClassLoader；
- GC 收集器对比：G1/ZGC 特点、GC Roots、Safepoint；
- 逃逸分析、内联、去虚拟化；

#### 集合

- HashMap 扩容与树化条件、fail-fast；
- ArrayList 扩容、CopyOnWriteArrayList 适用场景；

#### 语言与实践

- 泛型擦除、通配符 PECS、桥接方法；
- 异常设计、try-with-resources 抑制异常；
- NIO 的 Channel/Buffer/Selector 模型与零拷贝；

更多详解见各专题页面链接。


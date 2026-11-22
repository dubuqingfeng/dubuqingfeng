### ZGC 低停顿收集器

#### ToC

- 特性与适用场景
- 启用与关键参数
- 观察与排查
- 与 G1 的取舍

#### 特性与适用场景

- 目标：低停顿（通常 < 10ms），几乎与堆大小无关；
- 技术：并发标记/重定位、着色指针（colored pointers）、读屏障；
- 场景：超大堆、严格尾延迟要求的在线服务。

#### 启用与关键参数

```bash
JAVA_TOOL_OPTIONS='-XX:+UseZGC -Xms4g -Xmx4g -Xlog:gc*:tags,uptime,level'
```

- `-XX:ZUncommitDelay=300`：未使用内存回收延迟（s）；
- `-XX:SoftMaxHeapSize=6g`：软上限，ZGC 尝试将堆维持在此大小；
- `-XX:+ZGenerational`（JDK21+ 实验特性，分代 ZGC）。

#### 观察与排查

- 日志关注并发周期、Relocate/Mark 阶段时间；
- 监控：堆使用、暂停 p99、分配速率；
- 调整软上限与初始/最大堆、线程数（`-XX:ConcGCThreads`）。

#### 与 G1 的取舍

- ZGC：更稳定低停顿，但依赖屏障开销、对诊断工具链要求更高；
- G1：成熟、通用，暂停可控但受堆与 Region 设计影响更大；
- 经验法则：延迟要求苛刻/大堆优先 ZGC；通用负载优先 G1。


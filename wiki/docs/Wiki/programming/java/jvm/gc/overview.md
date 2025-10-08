### GC 概览与内存区域

#### ToC

- 运行时内存布局
- GC Roots 与 Safepoint
- 分代假说与常见收集器
- 调优维度与指标

#### 运行时内存布局（HotSpot）

- Java Heap（新生代/老年代，G1 等为 Region 化）：对象主要分配地；
- Metaspace：类元数据（替代 PermGen）；
- Thread Stack：每线程私有栈帧；
- Code Cache：JIT 生成的机器码；
- 其他：TLAB、C1/C2 编译缓存等。

#### GC Roots 与 Safepoint

- GC Roots：栈上的局部变量、静态字段、JNI 本地引用等；
- Safepoint：JVM 在特定安全点挂起/检查线程以执行 STW 阶段（如根可达性扫描、转移/重定位）；
- 写屏障/读屏障：辅助并发/增量式收集（如 SATB/卡表）。

#### 分代假说与常见收集器

- “大多数对象朝生夕死，少数对象存活时间较长” → 新生代采用复制算法，老年代采用标记-整理/压缩；
- 典型收集器：
  - Serial/Parallel：吞吐优先；
  - CMS（已废弃）：并发标记清除，碎片问题；
  - G1：Region 化、并发标记、可预测暂停；
  - ZGC/Shenandoah：低停顿收集器（读屏障/染色指针）。

#### 调优维度与指标

- 目标：吞吐率、最大暂停时间、尾延迟；
- 指标：年轻代/老年代占用、晋升失败、Full GC 次数与时长、对象分配速率、幸存区复制失败；
- 工具：JFR、`jstat -gcutil`、`jcmd GC.heap_info`、`jmap -histo`、GC 日志（`-Xlog:gc*`）。

#### 常用命令与日志

```bash
# 概览与监控
jcmd <pid> GC.heap_info
jstat -gcutil <pid> 1s 20     # 每秒输出 20 次 GC 利用率
jmap -histo:live <pid> | head # 活对象直方图

# 打开 GC 日志（JDK 9+）
JAVA_TOOL_OPTIONS="-Xlog:gc*,safepoint:file=gc.log:tags,uptime,level"
```

日志要点：年轻代/混合/Full GC 次数与暂停、晋升失败（promotion failed）、Humongous 对象、并发标记时间、回收集大小等。

#### 内存与目标设定

- 初始与最大堆：`-Xms`/`-Xmx`，生产建议设置为相等减少扩容；
- 目标优先级：吞吐（Parallel）vs 暂停（G1/ZGC）；
- 指标闭环：设定 `MaxGCPauseMillis`/SLA → 监控 → 调整 Region/阈值/软上限（如 ZGC 的 `SoftMaxHeapSize`）。

### JIT 与运行时优化

#### ToC

- 解释执行与即时编译
- C1/C2 编译器与分层编译
- 逃逸分析与标量替换
- 内联与去虚拟化

#### 解释执行与即时编译

HotSpot 采用解释器 + JIT 编译：热点方法/循环被编译为本地机器码以提升性能。热点探测基于计数器（调用/回边），达到阈值后触发编译。

#### C1/C2 编译器与分层编译

- C1（Client）：编译快、优化较少，适合启动快；
- C2（Server）：优化激进、编译慢，适合长时间运行；
- 分层编译（Tiered）：结合两者优势，先 C1（含 profiling），再升级至 C2。

常用参数：`-XX:+TieredCompilation`（默认开）、`-XX:CompileThreshold=`、`-XX:CICompilerCount=`。

#### 逃逸分析与标量替换

- 逃逸分析：判断对象是否逃出方法/线程范围；
  - 未逃逸 → 栈上分配/标量替换、锁消除；
  - 线程内逃逸 → 锁消除；
- 标量替换：将对象拆为局部标量存储于寄存器/栈，减少分配与 GC 压力。

相关参数：`-XX:+DoEscapeAnalysis`、`-XX:+EliminateLocks`。

#### 内联与去虚拟化

- 内联：将被调方法体嵌入调用点，消除调用开销并暴露更多优化机会；受限于方法大小与复杂度阈值；
- 去虚拟化：基于类型分析将虚调用转为直调（甚至内联），典型于单态/少态调用点；
- 假设可能失效（如类热替换/类加载变化）时依赖去优化与 OSR（On-Stack Replacement）。

观测与诊断：JFR 编译事件、`-XX:+PrintCompilation`、`-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining`。


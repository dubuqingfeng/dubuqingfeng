### GC



#### ToC



#### 源码地址



https://github.com/golang/go/blob/master/src/runtime/mgc.go



#### 发展历史



1. [v1.0](https://github.com/golang/go/blob/go1.0.1/src/pkg/runtime/mgc0.c#L882) — 完全串行的标记和清除过程，需要暂停整个程序；
2. [v1.1](https://github.com/golang/go/blob/go1.1/src/pkg/runtime/mgc0.c#L1938) — 在多核主机并行执行垃圾收集的标记和清除阶段[11](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:11)；
3. v1.3 — 运行时基于只有指针类型的值包含指针的假设增加了对栈内存的精确扫描支持，实现了真正精确的垃圾收集[12](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:12)；
   - 将 `unsafe.Pointer` 类型转换成整数类型的值认定为不合法的，可能会造成悬挂指针等严重问题；
4. v1.5 — 实现了基于三色标记清扫的并发垃圾收集器[13](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:13)；
   - 大幅度降低垃圾收集的延迟从几百 ms 降低至 10ms 以下；
   - 计算垃圾收集启动的合适时间并通过并发加速垃圾收集的过程；
5. v1.6 — 实现了去中心化的垃圾收集协调器；
   - 基于显式的状态机使得任意 Goroutine 都能触发垃圾收集的状态迁移；
   - 使用密集的位图替代空闲链表表示的堆内存，降低清除阶段的 CPU 占用[14](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:14)；
6. [v1.7](https://github.com/golang/go/blob/go1.7/src/runtime/mgc.go#L884) — 通过**并行栈收缩**将垃圾收集的时间缩短至 2ms 以内[15](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:15)；
7. [v1.8](https://github.com/golang/go/blob/go1.8/src/runtime/mgc.go#L930) — 使用**混合写屏障**将垃圾收集的时间缩短至 0.5ms 以内[16](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:16)；
8. [v1.9](https://github.com/golang/go/blob/go1.9/src/runtime/mgc.go#L1187) — 彻底移除暂停程序的重新扫描栈的过程[17](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:17)；
9. [v1.10](https://github.com/golang/go/blob/go1.10/src/runtime/mgc.go#L1239) — 更新了垃圾收集调频器（Pacer）的实现，分离软硬堆大小的目标[18](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:18)；
10. [v1.12](https://github.com/golang/go/blob/go1.12/src/runtime/mgc.go#L1199) — 使用**新的标记终止算法**简化垃圾收集器的几个阶段[19](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:19)；
11. [v1.13](https://github.com/golang/go/blob/go1.13/src/runtime/mgc.go#L1200) — 通过新的 Scavenger 解决瞬时内存占用过高的应用程序向操作系统归还内存的问题[20](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:20)；
12. [v1.14](https://github.com/golang/go/blob/go1.14/src/runtime/mgc.go#L1221) — 使用全新的页分配器**优化内存分配的速度**[21](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:21)；



#### 过程



We consider a cycle to be: sweep termination, mark, mark termination, and sweep.

清扫终止，标记，标记终止，交换



#### 三色标记



![img](https://433327134-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LjLtSYqqsBQODAJIhQ5%2F-Lxxz34HPuUqSYyGYrbb%2F-Lxxz3wrkAVKZ93IQ_MI%2Fgc-blueprint.png?generation=1578366688391319&alt=media)



 

### STW



从 ``` stop the world``` 到 ``` start the world``` 的时间





#### 混合屏障



#### 参考链接



码农桃花源：



https://qcrao91.gitbook.io/go/gc/gc


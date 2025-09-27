### JDK 工具速览（诊断与打包）

#### ToC

- 运行时诊断：jcmd/jstack/jmap/jstat
- 性能分析：JFR（Java Flight Recorder）
- 依赖与模块：jdeps/jlink
- 打包与分发：jpackage

#### 运行时诊断

- `jcmd <pid> VM.flags` / `GC.heap_info` / `Thread.print`：通用入口；
- `jstack <pid>`：线程栈快照，定位死锁/阻塞；
- `jmap -histo[:live] <pid>`：对象直方图，找到大对象/泄漏热点；
- `jstat -gcutil <pid> 1s`：GC 统计，观察幸存/老年代使用与回收节奏。

#### 性能分析：JFR

- 低开销事件采集，生产可用：

```bash
java -XX:StartFlightRecording=filename=app.jfr,duration=120s,settings=profile -jar app.jar
```

- 使用 JMC 打开 `.jfr` 进行分析：方法热点、分配火焰图、锁竞争、GC 事件等。

#### 依赖与模块

- `jdeps`：分析 jar 依赖；
- `jlink`：基于 JPMS 生成定制最小化运行时镜像，减小分发体积：

```bash
jlink --module-path $JAVA_HOME/jmods:mods -addmods app.main -output runtime
```

#### 打包与分发

- `jpackage`：生成原生安装包（.msi/.pkg/.deb...）：

```bash
jpackage --name MyApp --input target/ --main-jar app.jar --type pkg
```


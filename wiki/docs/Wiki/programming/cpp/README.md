---
title: C++
slug: /wiki/programming/cpp
---

这里汇总了与 C++ 相关的笔记与链接，按主题快速导航。

## 并发 Concurrency

- [线程 std::thread](concurrency/thread.md)
- [互斥锁 std::mutex](concurrency/mutex.md)
- [原子操作 std::atomic](concurrency/atomic.md)
- [条件变量 std::condition_variable](concurrency/condition-variable.md)
- [读写锁 std::shared_mutex](concurrency/shared-mutex.md)
- [异步与期约 std::future/std::promise/std::async](concurrency/future-promise-async.md)
- [线程池思路](concurrency/thread-pool.md)
- [无锁结构与注意事项](concurrency/lock-free.md)

## 内存与对象生命周期

- [内存模型与 RAII](memory/memory.md)
- [智能指针 unique_ptr/shared_ptr](memory/smart-pointer.md)
- [移动语义与右值引用](memory/move-semantics.md)
- [内存对齐 alignas/alignof](memory/alignment.md)
- [分配器与 pmr](memory/allocator.md)

## STL 与算法

- [容器概览与选择](stl/containers.md)
- [算法与迭代器](stl/algorithms.md)
- [文件系统 std::filesystem](stl/filesystem.md)

## 语言特性

- [模板与泛型编程](language/templates.md)
- [Lambda 与捕获](language/lambda.md)
- [Concepts 约束](language/concepts.md)
- [Ranges 范围适配](language/ranges.md)
- [异常处理与 noexcept](language/exceptions.md)
- [C++20 Modules 概览](language/modules.md)
- [协程（C++20）](language/coroutines.md)
- [optional/variant](language/variant-optional.md)
- [constexpr 与常量表达式](language/constexpr.md)

## 构建与工具链

- [CMake 基础](toolchain/cmake.md)
- [编译与链接（gcc/clang/msvc）](toolchain/compiler.md)
- [Sanitizers（ASan/UBSan/TSan）](toolchain/sanitizers.md)
- [调试（gdb/lldb）](toolchain/debugging.md)
- [性能分析（perf/valgrind）](toolchain/perf.md)
- [格式与静态检查（clang-format/clang-tidy）](toolchain/format-lint.md)
- [CMake 进阶](toolchain/cmake-advanced.md)

## 网络与 I/O

- [IO 模型概览（select/poll/epoll/kqueue/IOCP）](network/io-models.md)
- [Asio 基础](network/asio.md)

## 面试与练习

- [面试题整理](interview/interview.md)
- [代码练习](interview/code.md)

若有新增条目或分类需要调整，按需补充即可。

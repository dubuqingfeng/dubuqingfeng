---
title: Rust
slug: /wiki/programming/rust
---

这里整理与 Rust 相关的笔记与工程实践，包含与 Golang 风格（cmd/pkg）的对照与迁移方式。

## 工程与工具链

- [Go 风格的 Rust Workspace（cmd/pkg 结构）](./toolchain/workspace-cmd-pkg.md)
- [Cargo 基本用法](./toolchain/cargo.md)
- [格式化与静态检查（rustfmt/clippy）](./toolchain/clippy-fmt.md)

## 语言基础

- [所有权、借用与生命周期](./language/ownership-borrowing.md)
- [Traits 与泛型](./language/traits-generics.md)
- [unsafe 与内存模型](./memory/unsafe-and-model.md)

## 内存模型深入

- [别名、起源（provenance）与有效性](./memory/aliasing-provenance-validity.md)
- [原子与内存序（Acquire/Release/SeqCst）](./memory/atomics-and-ordering.md)
- [Pin 与自引用类型、不动性](./memory/pin-self-referential.md)
- [内存布局与 repr、niche 优化](./memory/layout-repr-niches.md)
- [方差与 PhantomData、Drop 检查](./memory/variance-phantomdata.md)
- [内部可变性：UnsafeCell/Cell/RefCell](./memory/interior-mutability.md)
- [借用检查进阶：NLL、两阶段借用、重借用](./memory/borrow-advanced.md)
- [指针与切片安全边界](./memory/pointers-slices-safety.md)
- [Drop 顺序与 panic 展开/abort](./memory/drop-unwind-abort.md)
- [错误处理：Result/anyhow/thiserror](./error/error-handling.md)
- [宏：声明式与过程宏](./macros/macros.md)

## 并发与异步

- [线程、共享内存与消息传递](./concurrency/threading.md)
- [异步 async/await 与 Future](./async/async-await.md)

## 实战方向

- [Web: Axum 快速上手](./web/axum-quickstart.md)
- [测试：单元、集成与基准](./testing/testing.md)
- [FFI：与 C 交互](./ffi/c-ffi.md)

## 性能与宏

- [性能与优化手段](./perf/performance-optimization.md)
- [宏进阶：过程宏实战](./macros/advanced.md)

如需新增条目或分类，保持与 Go/C++ 等目录一致的层级与命名即可。

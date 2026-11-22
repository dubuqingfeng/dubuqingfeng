---
title: "Rust：内存模型"
slug: "/wiki/programming/rust/memory/"
---

# Rust：内存模型

本目录收录Drop 顺序与 panic：展开（unwind）与中止（abort）、Pin 与自引用类型、unsafe 与内存模型等内容，可从下列入口阅读。


## 本级目录 {#directory-index}

### 本级文章 {#directory-articles}

- [Drop 顺序与 panic：展开（unwind）与中止（abort）](./drop-unwind-abort.md)
- [Pin 与自引用类型](./pin-self-referential.md)
- [unsafe 与内存模型](./unsafe-and-model.md)
- [借用检查进阶：NLL、两阶段借用、重借用](./borrow-advanced.md)
- [内存布局：repr、透明与 niche 优化](./layout-repr-niches.md)
- [内部可变性：UnsafeCell、Cell、RefCell](./interior-mutability.md)
- [别名（Aliasing）、起源（Provenance）与有效性（Validity）](./aliasing-provenance-validity.md)
- [原子与内存序（Acquire/Release/SeqCst）](./atomics-and-ordering.md)
- [指针与切片安全边界（offset/add/wrapping 与 from\_raw\_parts 不变量）](./pointers-slices-safety.md)
- [方差（Variance）与 PhantomData、Drop 检查](./variance-phantomdata.md)

返回[上一级：Rust](./../README.md)。

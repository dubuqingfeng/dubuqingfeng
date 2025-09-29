---
title: 压缩与 Codec
---

列式压缩提升存储与 IO 效率；可按列设置不同 codec。

## 常见 Codec

- LZ4（默认，速度快）、ZSTD（压缩高）、Delta/DoubleDelta、Gorilla 等。

## 示例

```sql
CREATE TABLE t (
  ts DateTime CODEC(Delta, ZSTD),
  value Float64 CODEC(Gorilla)
) ENGINE = MergeTree ORDER BY ts;
```


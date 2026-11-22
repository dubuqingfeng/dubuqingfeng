### Web Storage 与 IndexedDB

#### ToC

- localStorage/sessionStorage
- IndexedDB 基础
- 持久化与配额

#### localStorage/sessionStorage

- 同源下的键值存储，容量小（~5MB），同步 API，适合小量配置/状态缓存；
- 注意序列化与异常捕获（配额满）。

#### IndexedDB 基础

- 事务型键值数据库，异步 API；适合大数据/离线缓存；推荐使用 idb 封装库。

#### 持久化与配额

- StorageManager：`navigator.storage.persist()` 请求持久化；`estimate()` 查询容量与使用量。


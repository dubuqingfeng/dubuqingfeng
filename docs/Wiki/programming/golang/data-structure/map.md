### map



#### 目录



+ 线程安全
+ 冲突解决



#### 线程安全



map 并不是一个线程安全的结构，如果需要多个 goroutine 读写，可以使用读写锁或者是 sync.map



具体原因：



```go
if h.flags&hashWriting == 0 {
	throw("concurrent map writes")
}
```





如果同时多个 goroutine 读写会怎样？



example：





#### 参考链接




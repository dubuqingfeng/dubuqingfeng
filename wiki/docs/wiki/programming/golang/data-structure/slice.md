### Slice



#### 源码



源码地址为：

https://github.com/golang/go/blob/master/src/runtime/slice.go



具体部分：



````go
type slice struct {
	array unsafe.Pointer
	len   int
	cap   int
}
````



常见的一些函数：



```
// growslice handles slice growth during append.
func growslice(et *_type, old slice, cap int) slice
// slicecopy is used to copy from a string or slice of pointerless elements into a slice.
func slicecopy(toPtr unsafe.Pointer, toLen int, fromPtr unsafe.Pointer, fromLen int, width uintptr) int
// makeslicecopy allocates a slice of "tolen" elements of type "et",
func makeslicecopy(et *_type, tolen int, fromlen int, from unsafe.Pointer) unsafe.Pointer
```





#### Question



1. 在源码中，有一个 notInHeapSlice ，用来 go:notinheap memory 的，那么是不是意味着 unsafe.pointer 在堆上呢？





#### 参考链接



【Go】深入剖析slice和array

https://zhuanlan.zhihu.com/p/54780689



深入解析 Go 中 Slice 底层实现

https://halfrost.com/go_slice/


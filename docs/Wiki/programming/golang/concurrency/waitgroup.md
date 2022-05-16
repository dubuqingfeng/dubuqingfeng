### Sync.WaitGroup



https://github.com/golang/go/blob/master/src/sync/waitgroup.go



#### ToC



+ Example
+ 



#### Example



```
package main

import (
    "fmt"
    "sync"
)
var wg sync.WaitGroup
func handle(num int) {
    defer wg.Done()
    fmt.Println(num, "handle.")
}
func main() {
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go handle(i)
    }
    fmt.Println("main goroutine do something.")
    wg.Wait()
    fmt.Println("main goroutine end.")
}
```





#### 核心内容



信号量计数



```
type WaitGroup struct {
	noCopy noCopy
	// 64 位和 32 位使用的不同
	state1 uint64
	state2 uint32
}
```



Add 方法的实现：



```
func (wg *WaitGroup) Add(delta int) {
	statep, semap := wg.state()
	state := atomic.AddUint64(statep, uint64(delta)<<32)
	v := int32(state >> 32)
	w := uint32(state)
	if v < 0 {
		panic("sync: negative WaitGroup counter")
	}
	if w != 0 && delta > 0 && v == int32(delta) {
		panic("sync: WaitGroup misuse: Add called concurrently with Wait")
	}
	if v > 0 || w == 0 {
		return
	}
	// This goroutine has set counter to 0 when waiters > 0.
	// Now there can't be concurrent mutations of state:
	// - Adds must not happen concurrently with Wait,
	// - Wait does not increment waiters if it sees counter == 0.
	// Still do a cheap sanity check to detect WaitGroup misuse.
	if *statep != state {
		panic("sync: WaitGroup misuse: Add called concurrently with Wait")
	}
	// Reset waiters count to 0.
	*statep = 0
	for ; w != 0; w-- {
		runtime_Semrelease(semap, false, 0)
	}
}
```



Done 的方法是 Add(-1)



Wait 方法实现：



for 循环不断检查 state，如果计数器为 0，则所有 goroutine 全部执行完毕。



```
// Wait blocks until the WaitGroup counter is zero.
func (wg *WaitGroup) Wait() {
	statep, semap := wg.state()
	for {
		state := atomic.LoadUint64(statep)
		v := int32(state >> 32)
		w := uint32(state)
		if v == 0 {
			return
		}
		// Increment waiters count.
		if atomic.CompareAndSwapUint64(statep, state, state+1) {
			runtime_Semacquire(semap)
			if *statep != 0 {
				panic("sync: WaitGroup is reused before previous Wait has returned")
			}
			return
		}
	}
}
```





#### ErrorGroup 扩展



`Go`扩展库通过 `errorgroup.Group `提供 `ErrorGroup` 原语的功能



```go
func WithContext(ctx context.Context) (*Group, context.Context)
func (g *Group) Go(f func() error)
func (g *Group) Wait() error
```



会返回所有执行任务的`goroutine`遇到的第一个错误。

底层原理的话：



```
type Group struct {
    cancel func()

    wg sync.WaitGroup

    errOnce sync.Once
    err     error
}
```



通过 sync.Once 保证返回所有执行任务遇到的第一个错误。





#### 参考链接



深度解析sync WaitGroup源码

https://zhuanlan.zhihu.com/p/352329481
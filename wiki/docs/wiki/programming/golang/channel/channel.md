### Channel 通道



#### ToC



#### 源码地址



https://github.com/golang/go/blob/master/src/runtime/chan.go



#### 内部实现



维护了两个 Goroutine 队列，一个是接收数据的，一个是发送数据的。



```
type hchan struct {
	qcount   uint           // total data in the queue
	dataqsiz uint           // size of the circular queue
	buf      unsafe.Pointer // points to an array of dataqsiz elements
	elemsize uint16
	closed   uint32
	elemtype *_type // element type
	sendx    uint   // send index
	recvx    uint   // receive index
	recvq    waitq  // list of recv waiters
	sendq    waitq  // list of send waiters

	// lock protects all fields in hchan, as well as several
	// fields in sudogs blocked on this channel.
	//
	// Do not change another G's status while holding this lock
	// (in particular, do not ready a G), as this can deadlock
	// with stack shrinking.
	lock mutex
}

type waitq struct {
	first *sudog
	last  *sudog
}

type sudog struct{
   g *g
   isSelect bool
   next *sudog
   prev *sudog
   elem unsafe.Pointer //data element
   ...
}
```



有缓冲的利用循环数组，buf 为指向数组的指针。



新建一个 chan 后，内存会在堆上分配。



#### 使用方法



1. 不断读取 channel



```
for i := range ch {
    fmt.Println(i)
}
```



2. 判断 channel 是否关闭



```
if v, ok := <- ch; ok {
    fmt.Println(v)
}
```



3. 使用 select 读取多个 channel



```
for{
    select {
    	case <-ch1:
    		process1()
    		return
    	case <-ch2:
    		process2()
    		return
    }
}
```



#### nil 和关闭



1. 向一个 nil 的 channel 发送和接收，会导致永远阻塞
2. 向已经关闭的 channel 发送，会导致 panic





#### select 的原理







#### 参考资料



channel

https://tiancaiamao.gitbooks.io/go-internals/content/zh/07.1.html

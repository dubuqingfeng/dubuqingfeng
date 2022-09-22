### GMP 模型

<!-- <img src="https://cdn.learnku.com/uploads/images/202105/12/81958/afJZIYgr3E.webp!large" alt="图片" style="zoom:50%;" /> -->



#### ToC







#### 源码地址



https://github.com/golang/go/blob/master/src/runtime/proc.go



#### 源码分析



```
// The bootstrap sequence is:
//
//	call osinit
//	call schedinit
//	make & queue new G
//	call runtime·mstart
//
// The new G calls runtime·main.
```



G 代表 goroutine，M 代表 工作线程，P 代表处理器，一个 M 要绑定一个 P，每个 P 有一个自己的本地队列。



```
// G - goroutine.
// M - worker thread, or machine.
// P - processor, a resource that is required to execute Go code.
//     M must have an associated P to execute Go code, however it can be
//     blocked or in a syscall w/o an associated P.
```



状态：Gidle,Grunnable,Grunning,Gsyscall,Gwaiting,Gdead



```
struct P
{
    Lock;
    G *gfree; // freelist, moved from sched
    G *ghead; // runnable, moved from sched
    G *gtail;
    MCache *mcache; // moved from M
    FixAlloc *stackalloc; // moved from M
    uint64 ncgocall;
    GCStats gcstats;
    // etc
...
};
```





#### M:N 模型



#### 参考链接



https://golang.org/s/go11sched

golang 源码学习之GMP (goroutine)

https://www.jianshu.com/p/665aca7af949
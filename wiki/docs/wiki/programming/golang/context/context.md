



#### 底层 结构



专门用来简化处理多个goroutine之间与请求域的数据、取消信号、截止时间等相关操作



```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    
    Done() <-chan struct{}
    
    Err() error
    
    Value(key interface{}) interface{}
}
```






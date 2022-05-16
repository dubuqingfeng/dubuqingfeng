### Mutex



#### ToC



主要用来访问竞争资源的互斥锁，



读写锁



```
var rwlock sync.RWMutex

func read(){
    rwlock.RLock()
    // read
    rwlock.RUnlock()
}

func write(){
    rwlock.Lock()
    // writen
    rwlock.Unlock()
}
```






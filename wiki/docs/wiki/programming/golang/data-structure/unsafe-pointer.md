### unsafe.pointer



特殊类型的一种指针，类似于 C++ 的 void*



#### ToC



#### 指针类型转换



正常的话，是不能进行指针转换的。



```go
func main() {
	i:= 10
	ip:=&i
	var fp *float64 = (*float64)(unsafe.Pointer(ip))
	*fp = *fp * 3
	fmt.Println(i)
}
```

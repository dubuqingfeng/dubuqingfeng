### Chaos 混沌工程（Golang）



#### ToC



+ 背景与目标
+ 故障注入类型
+ 代码层注入（Go）
+ HTTP 客户端注入示例
+ gRPC 拦截器注入示例
+ 系统层工具
+ 验证与度量
+ 最佳实践
+ 参考链接



#### 背景与目标



混沌工程通过在可控范围内主动制造故障，验证系统在异常情况下的鲁棒性与可观测性，提前发现薄弱环节。



目标：在不影响核心业务与安全前提下，系统性地验证超时、错误、抖动、资源紧张、依赖异常等情况下的行为是否符合预期（超时、重试、熔断、降级、告警、SLO）。



#### 故障注入类型



常见注入维度：

- 网络：延迟、抖动、丢包、限速、连接拒绝、RST
- 依赖：返回错误码、慢响应、间歇性失败、不可用
- 资源：CPU 打满、内存耗尽、磁盘 I/O 慢/满、句柄耗尽
- 进程：崩溃、重启、暂停（SIGSTOP）、时间回拨/跳跃
- 并发：锁竞争、死锁、数据竞争、上下文取消



#### 代码层注入（Go）



优先在“代码边界”处做注入，方便启停与定位：

- HTTP/gRPC 客户端与服务端中间件
- 存储/缓存/队列 SDK 的封装层
- 统一的重试/超时/熔断组件（例如 `gobreaker`、`backoff`）

启用方式建议：

- 通过构建标签 `//go:build chaos` 或环境变量 `CHAOS=1` 开关
- 注入强度参数化：失败比例、最大延迟、失败类型白名单
- 保持可复现：允许设置随机种子（seed），支持按请求 key/用户灰度



#### HTTP 客户端注入示例



在 `net/http` 中自定义 `RoundTripper`，对下游请求随机注入延迟或错误：

```go
package chaoshttp

import (
    "errors"
    "math/rand"
    "net/http"
    "time"
)

type Transport struct {
    Base        http.RoundTripper // 透传到底层传输
    Rate        float64           // 故障比例 [0,1]
    MaxLatency  time.Duration     // 最大注入延迟
    Seed        int64             // 随机种子（可选，便于复现）
}

func (t *Transport) RoundTrip(req *http.Request) (*http.Response, error) {
    base := t.Base
    if base == nil {
        base = http.DefaultTransport
    }
    r := rand.New(rand.NewSource(t.Seed + time.Now().UnixNano()))

    // 可选：按 header/user 做灰度
    // user := req.Header.Get("X-User")

    if t.Rate > 0 && r.Float64() < t.Rate {
        // 在延迟与错误之间随机选择
        if t.MaxLatency > 0 && r.Intn(2) == 0 {
            d := time.Duration(r.Int63n(int64(t.MaxLatency)))
            select {
            case <-time.After(d):
            case <-req.Context().Done():
                return nil, req.Context().Err()
            }
        } else {
            return nil, errors.New("chaos: injected transport error")
        }
    }
    return base.RoundTrip(req)
}

// NewClient 返回带混沌注入的 http.Client
func NewClient(rate float64, maxLatency time.Duration) *http.Client {
    return &http.Client{
        Transport: &Transport{Rate: rate, MaxLatency: maxLatency},
        Timeout:   0, // 交由上层或 context 控制
    }
}
```

使用示例：

```go
cli := chaoshttp.NewClient(0.2, 200*time.Millisecond) // 20% 注入，最大 200ms 延迟
req, _ := http.NewRequest("GET", "https://api.example.com", nil)
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
defer cancel()
req = req.WithContext(ctx)
resp, err := cli.Do(req)
// 结合重试/熔断处理 err
```



#### gRPC 拦截器注入示例



对 gRPC 加入 Unary 拦截器，按比例注入延迟/错误：

```go
package chaosgrpc

import (
    "context"
    "errors"
    "math/rand"
    "time"

    "google.golang.org/grpc"
)

func UnaryClientInterceptor(rate float64, maxLatency time.Duration, seed int64) grpc.UnaryClientInterceptor {
    return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
        r := rand.New(rand.NewSource(seed + time.Now().UnixNano()))
        if rate > 0 && r.Float64() < rate {
            if maxLatency > 0 && r.Intn(2) == 0 {
                d := time.Duration(r.Int63n(int64(maxLatency)))
                var t = time.NewTimer(d)
                defer t.Stop()
                select {
                case <-t.C:
                case <-ctx.Done():
                    return ctx.Err()
                }
            } else {
                return errors.New("chaos: injected grpc error")
            }
        }
        return invoker(ctx, method, req, reply, cc, opts...)
    }
}
```

客户端创建：

```go
conn, err := grpc.Dial(
    target,
    grpc.WithInsecure(),
    grpc.WithUnaryInterceptor(chaosgrpc.UnaryClientInterceptor(0.1, 150*time.Millisecond, 0)),
)
```



#### 系统层工具



- Toxiproxy：为外部依赖制造网络毒性（延迟、丢包、限速）
  - CLI 示例：`toxiproxy-cli toxic add --type latency --toxicName slow --attribute latency=200 --upstream localhost:6379 redis`
- Linux `tc/netem`：
  - 延迟与丢包：`sudo tc qdisc add dev eth0 root netem delay 200ms loss 5%`
  - 清理：`sudo tc qdisc del dev eth0 root`
- 容器/主机资源：
  - CPU/内存：`stress-ng --cpu 2 --timeout 30s`，或使用 cgroups 限制
  - 文件句柄：`ulimit -n 1024`，配合压测
- 进程信号：`kill -STOP <pid>` 暂停，`kill -CONT <pid>` 恢复



#### 验证与度量



- 基线与假设：明确期望行为（超时、重试、降级、告警）与可观测性指标（成功率、P95 延迟、错误率）
- 覆盖测试：
  - 数据竞争：`go test -race ./...`
  - 模糊测试：`go test -fuzz=Fuzz -fuzztime=10s`（Go 1.18+）
  - pprof/trace：定位热点与抖动
- 验证流程：
  - 小流量灰度 → 扩大范围 → 回滚预案
  - 与重试/熔断/限流联动验证



#### 最佳实践



- 默认关闭、显式启用：构建标签/环境变量/配置中心开关
- 精准注入：仅在边界层注入，避免污染业务核心
- 幂等与超时优先：先保证超时、重试、幂等语义，再做混沌
- 观测先行：日志、指标、追踪三件套准备充分
- 可复现：可控随机种子、记录实验参数
- 安全边界：限定环境/账户/请求范围，避免误伤生产



#### 参考链接



- Principles of Chaos Engineering：https://principlesofchaos.org/
- Chaos Mesh（Kubernetes 混沌）：https://chaos-mesh.org/
- Toxiproxy：https://github.com/Shopify/toxiproxy
- Go net/http RoundTripper 文档：https://pkg.go.dev/net/http#RoundTripper
- Go Fuzzing（1.18+）：https://go.dev/doc/fuzz/

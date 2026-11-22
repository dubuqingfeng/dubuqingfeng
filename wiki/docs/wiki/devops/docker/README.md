---
title: Docker
slug: /wiki/devops/docker
---

# Docker

Docker 的便利来自“把进程和它的依赖打包成一个镜像”，风险也来自同一件事：镜像里有什么、容器以什么身份运行、它能看到宿主机的哪些资源。

这篇文章从镜像/容器边界讲到 Dockerfile、存储、网络、资源限制和安全加固，最后给一份排障清单。

## 1. 镜像与容器：分层与可写层 {#model}

- **镜像**由只读层（layer）叠加而成；每条 `RUN`、`COPY` 通常产生一层。
- **容器**在镜像之上加一个可写层；删除容器，可写层默认一起消失。
- 容器不是轻量虚拟机；它仍然是宿主机上的进程，只是被 namespace 隔离、被 cgroup 限制。

```bash
docker image history app:1.0
docker inspect app:1.0 --format '{{json .Config}}'
docker diff <container>
```

> **边界：** 容器内的 root 默认接近宿主机 root（除非启用 user namespace/rootless）。不要把“容器”当成安全边界。

## 2. Dockerfile：可复现、最小、非 root {#dockerfile}

多阶段构建 + distroless/非 root 的基础示例：

```dockerfile
FROM golang:1.24 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

要点：

- 固定基础镜像的 tag/digest，不要用 `latest`。
- 多阶段构建，最终镜像只保留运行时文件。
- 用 `.dockerignore` 排除 `.git`、测试数据、密钥、`node_modules`。
- 不要把密钥写进 `ARG`/`ENV`/镜像层；构建密钥用 BuildKit secret。
- 默认 `USER` 非 root；需要绑定低端口时用反向代理或 `CAP_NET_BIND_SERVICE`。

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t app:1.0 .
```

## 3. 存储：volume、bind mount、tmpfs {#storage}

| 方式 | 位置 | 适用 | 注意 |
| --- | --- | --- | --- |
| volume | Docker 管理目录 | 数据库、持久数据 | 备份/迁移要用 `docker volume` |
| bind mount | 宿主机任意路径 | 开发、配置注入 | 容器可改宿主机文件，权限要对齐 |
| tmpfs | 内存 | 临时文件、敏感缓存 | 容器停止即丢失 |

```bash
docker run -d --name pg \
  -v pgdata:/var/lib/postgresql/data \
  -v /etc/app/config.yaml:/etc/app/config.yaml:ro \
  postgres:16
```

> **安全：** 不要把宿主机的 `/`、`/etc`、`docker.sock` 挂进不可信容器；bind mount 默认是可写的。

## 4. 网络：bridge、host、none {#network}

- 默认 `bridge`：容器有独立网络命名空间，通过 veth 连接 `docker0`，端口用 `-p` 发布。
- `host`：共享宿主机网络栈，性能好但隔离弱，端口冲突直接暴露。
- `none`：只有 loopback，适合完全离线的批处理。
- 容器间用自定义 bridge 网络 + 服务名做 DNS，不要依赖 `--link`。

```bash
docker network create app-net
docker run -d --name api --network app-net -p 127.0.0.1:8080:8080 app:1.0
docker run --rm --network app-net curlimages/curl:8.10.1 http://api:8080/healthz
```

> **发布端口：** `-p 8080:8080` 默认监听 `0.0.0.0`。只想本机访问时写 `-p 127.0.0.1:8080:8080`。

## 5. 资源限制：cgroups {#resources}

```bash
docker run --rm \
  --memory=512m --memory-swap=512m \
  --cpus=1.5 \
  --pids-limit=256 \
  --ulimit nofile=1024:1024 \
  app:1.0
```

- `--memory` 触发 cgroup 内存限制；超过会 OOM kill，不是“变慢”。
- `--cpus` 是 CPU 配额，不是核数绑定；需要绑核时用 `--cpuset-cpus`。
- `--pids-limit` 防止 fork 炸弹。
- 生产要监控 `docker stats`、cgroup `memory.events`、容器重启次数。

## 6. 安全加固：把容器当不可信进程 {#security}

| 措施 | 作用 |
| --- | --- |
| `--user 10001:10001` | 非 root 运行 |
| `--read-only` + `--tmpfs /tmp` | 根文件系统只读，减少落地写入 |
| `--cap-drop ALL` + 按需 `--cap-add` | 去掉不需要的 Linux capabilities |
| `--security-opt no-new-privileges` | 阻止 setuid 提权 |
| `--security-opt seccomp=...` | 限制系统调用 |
| rootless / userns-remap | 把容器 root 映射到宿主机非特权用户 |
| 不挂 `docker.sock` | 挂载等于把宿主机 root 交给容器 |

```bash
docker run --rm \
  --user 10001:10001 \
  --read-only --tmpfs /tmp \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  -p 127.0.0.1:8080:8080 \
  app:1.0
```

> **最常见的错误：** 为了“方便”把 `/var/run/docker.sock` 挂进容器。容器内进程可以借此创建特权容器、挂载宿主机根目录，等同于宿主机 root。

## 7. 调试与排障 {#troubleshooting}

```bash
docker ps -a
docker logs --tail=200 -f <container>
docker exec -it <container> sh
docker inspect <container> --format '{{.State.Status}} {{.State.OOMKilled}}'
docker stats --no-stream
docker system df
```

| 现象 | 先看什么 | 常见原因 |
| --- | --- | --- |
| 容器启动即退出 | `docker logs`、`docker inspect .State` | 入口命令错误、配置缺失、权限不足 |
| 端口冲突 | `ss -lntp`、`docker port` | 宿主机已有进程占用 |
| 磁盘满 | `docker system df`、`/var/lib/docker` | 镜像/日志/volume 未清理 |
| 容器内 DNS 失败 | `/etc/resolv.conf`、自定义网络 | 用了默认 bridge、宿主 DNS 配置异常 |
| 内存被杀 | `OOMKilled`、`memory.events` | 限制太小、泄漏、JVM 堆未按容器配置 |
| 文件权限错误 | `id`、mount 的 UID/GID | 容器用户与宿主机目录属主不一致 |

## 8. 最小检查清单 {#checklist}

- [ ] 基础镜像固定 digest/tag，不用 `latest`。
- [ ] 多阶段构建，最终镜像不含编译器和源码。
- [ ] 默认非 root，根文件系统只读，`/tmp` 用 tmpfs。
- [ ] `--cap-drop ALL`，只加必要 capability。
- [ ] 不挂 `docker.sock`，不挂宿主机敏感目录。
- [ ] 端口只发布到需要的地址（优先 `127.0.0.1`）。
- [ ] 设置 memory/CPU/pids 限制。
- [ ] 日志有轮转，镜像/volume 有清理策略。
- [ ] 生产考虑 rootless 或 userns-remap。

## 相关阅读 {#related}

- [运维与交付](./../README.md)
- [Kubernetes](./../kubernetes/README.md)
- [Jenkins](./../jenkins/README.md)
- [Linux](./../linux/README.md)

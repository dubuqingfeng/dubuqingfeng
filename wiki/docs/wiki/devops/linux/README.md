---
title: Linux
slug: /wiki/devops/linux
---

# Linux

Linux 排障的难点通常不是“命令不会”，而是不知道先看哪一层。一个进程变慢，可能是 CPU、内存、磁盘 IO、网络、锁、cgroup 限制，或者 systemd 重启策略导致的假象。

这篇文章按“进程 → 内存 → 磁盘 → 网络 → 权限 → systemd → 加固”的顺序，给出常用命令和判断路径。

## 1. 进程与资源：先定位是谁 {#process}

```bash
ps -eo pid,ppid,user,%cpu,%mem,rss,stat,etime,cmd --sort=-%cpu | head
top -H -p <pid>          # 线程级
cat /proc/<pid>/status   # VmRSS、Threads、CapEff
cat /proc/<pid>/limits   # 文件句柄、进程数限制
```

- `STAT` 里的 `D` 是不可中断睡眠，通常卡在 IO；`R` 是运行/可运行；`Z` 是僵尸。
- `RSS` 是常驻内存，不等于实际占用（共享库、page cache 要分开看）。
- 容器内看 `/proc` 可能被 namespace 隔离；必要时在宿主机用 `docker inspect`/`crictl` 对照。

```bash
pidstat -p <pid> 1 5     # CPU、IO、上下文切换
perf top -p <pid>        # 采样热点（需要 perf 权限）
```

## 2. 内存：page cache、swap 与 OOM {#memory}

```bash
free -h
vmstat 1 5
cat /proc/meminfo | grep -E 'MemAvailable|Dirty|Writeback|Swap'
```

判断顺序：

1. **`MemAvailable` 是否持续下降**；只看 `free` 的 `free` 列会被 page cache 误导。
2. **`Dirty/Writeback` 是否很高**：说明写回跟不上，可能拖慢所有写操作。
3. **是否发生 swap**：`si/so` 持续非零，延迟会明显上升。
4. **是否 OOM**：

```bash
dmesg -T | grep -i -E 'oom|killed process'
journalctl -k --since "1 hour ago" | grep -i oom
```

> **容器注意：** 容器内 `free` 可能显示宿主机内存。看 cgroup：
> `cat /sys/fs/cgroup/memory.max`、`memory.current`、`memory.events`。

## 3. 磁盘与文件系统：空间、inode、被删除的文件 {#disk}

```bash
df -h
df -i
du -xhd1 /var | sort -h
lsof +L1                 # 已删除但仍被进程占用的文件
```

常见“磁盘满了但 `du` 找不到大文件”：

- 进程还持有已删除文件的句柄，空间未释放；重启/重开文件后释放。
- 日志被 `rsyslog`/`journald` 持有；检查 `journalctl --disk-usage`。
- 容器可写层、镜像层、volume 占用；`docker system df`。
- inode 耗尽：`df -i` 显示 `IUse%` 100%，常见于大量小文件。

IO 诊断：

```bash
iostat -xz 1 5
iotop -oPa
```

看 `%util`、`await`、`aqu-sz`；`%util` 高不一定慢，`await` 和队列长度更能说明排队。

## 4. 网络：监听、连接、抓包 {#network}

```bash
ss -lntup                 # 监听端口与进程
ss -s                     # 连接状态汇总
ss -tan state time-wait | wc -l
ip addr
ip route
```

- `TIME_WAIT` 多通常是短连接多，不一定是故障；先看是否端口耗尽、是否应复用连接。
- `CLOSE_WAIT` 多通常是对端关闭后本端没有 `close()`，是应用问题。
- `SYN_RECV` 多要怀疑 SYN flood 或后端不可达。

```bash
tcpdump -ni any -c 50 'tcp port 8080 and (tcp[tcpflags] & tcp-syn != 0)'
conntrack -L 2>/dev/null | wc -l
```

DNS 排查：

```bash
cat /etc/resolv.conf
getent hosts example.com
dig +short example.com
```

## 5. 权限：UID/GID、capabilities、ACL {#permissions}

```bash
id
umask
getfacl /path
setfacl -m u:deploy:rx /path
getcap -r / 2>/dev/null
capsh --print
```

- 不要用 `chmod 777` 解决权限问题；先确认进程 UID、目录属主、父目录执行位。
- `setuid` 二进制是提权面；用 `find / -perm -4000 -type f` 盘点。
- 需要低端口/原始套接字时优先用 capability，而不是 root：

```bash
setcap cap_net_bind_service=+ep /usr/local/bin/app
```

> **容器边界：** 容器内的 `root` 默认接近宿主机 root；不要用“容器内是 root”作为安全假设。

## 6. systemd：服务生命周期与日志 {#systemd}

```bash
systemctl status app --no-pager
systemctl restart app
journalctl -u app --since "10 min ago" -o short-precise
systemctl cat app
systemctl show app -p Restart -p RestartUSec -p LimitNOFILE
```

一个最小 unit：

```ini
[Unit]
Description=Example API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/opt/app
ExecStart=/opt/app/bin/server
Restart=on-failure
RestartSec=2
LimitNOFILE=65535
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/app

[Install]
WantedBy=multi-user.target
```

> `Restart=always` 会把“配置错误”变成“无限重启”。先用 `on-failure` + 退避，确认日志后再放宽。

## 7. 安全加固：SSH、防火墙、内核参数 {#hardening}

SSH：

```bash
sshd -T | grep -E 'permitrootlogin|passwordauthentication|pubkeyauthentication'
```

建议：

- `PermitRootLogin no`；
- `PasswordAuthentication no`，只用密钥/证书；
- 限制 `AllowUsers`/`AllowGroups`；
- 变更前保留一个已登录会话，避免把自己锁在外面。

防火墙用 nftables/ufw/firewalld 之一，默认拒绝入站，只放行必要端口。内核参数按需：

```bash
sysctl net.ipv4.tcp_syncookies
sysctl net.ipv4.ip_forward
sysctl fs.file-max
```

> 不要照抄“优化参数”。`tcp_tw_reuse`、`swappiness`、`overcommit_memory` 都有适用边界，改之前先记录基线。

## 8. 排障路径速查 {#troubleshooting}

| 现象 | 第一命令 | 常见原因 |
| --- | --- | --- |
| CPU 高 | `top -H`、`pidstat`、`perf top` | 忙循环、GC、锁竞争、加密/压缩 |
| 内存涨 | `free`、`/proc/meminfo`、`smem` | 泄漏、缓存未回收、堆外内存 |
| 磁盘满 | `df -h`、`df -i`、`lsof +L1` | 日志、已删除文件、inode、容器层 |
| IO 慢 | `iostat -xz`、`iotop` | 写回、fsync、磁盘故障、队列打满 |
| 端口占用 | `ss -lntp` | 旧进程、容器端口映射、SO_REUSEPORT |
| 连接异常 | `ss -s`、`tcpdump`、`conntrack` | 防火墙、NAT、DNS、半开连接 |
| 服务起不来 | `systemctl status`、`journalctl -u` | 权限、配置、依赖、端口 |
| 登录不了 | 控制台/救援模式 | SSH 配置、防火墙、PAM、磁盘满 |

## 9. 最小检查清单 {#checklist}

- [ ] 关键服务用 systemd 管理，设置 `Restart`、`LimitNOFILE`、日志轮转。
- [ ] 监控 CPU、内存、磁盘、inode、网络连接和文件句柄。
- [ ] SSH 禁用密码登录和 root 直登，保留应急通道。
- [ ] 入站默认拒绝，只放行必要端口。
- [ ] 定期盘点 setuid、capabilities、sudoers。
- [ ] 容器/服务使用非 root，限制 capability 和可写路径。
- [ ] 变更内核参数前记录基线，并有回滚方案。

## 相关阅读 {#related}

- [运维与交付](./../README.md)
- [Docker](./../docker/README.md)
- [Kubernetes](./../kubernetes/README.md)
- [Jenkins](./../jenkins/README.md)

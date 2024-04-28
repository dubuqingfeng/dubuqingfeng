## uptimekuma

```
version: '3.3'
services:
    uptime-kuma:
        container_name: uptime_kuma
        ports:
            - '3444:3001'
        environment:
            - PUID=1026
            - PGID=100
            - TZ=Asia/Shanghai
        volumes:
            - '/volume1/docker/uptimekuma/data:/app/data'
            - '/var/run/docker.sock:/var/run/docker.sock'
        restart: always
        image: louislam/uptime-kuma
```
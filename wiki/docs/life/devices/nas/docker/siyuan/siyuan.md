## siyuan

```yaml
version: "3"
services:
    siyuan:
        image: b3log/siyuan # chown -R 1000:1000 data/
        container_name: siyuan
        restart: always
        expose:
            - 6806
        ports:
            - 6806:6806
        user: 1000:1000
        command: -workspace /siyuan/
        environment:
            - TZ=Asia/Shanghai
            - DOCKER_USER=dubuqingfeng
            - PGID=101
            - PUID=1026
        volumes:
            - /etc/localtime:/etc/localtime:ro
            - /volume1/docker/siyuan/data:/siyuan:rw
        logging:
            driver: "json-file"
            options:
                max-size: "1m"

```
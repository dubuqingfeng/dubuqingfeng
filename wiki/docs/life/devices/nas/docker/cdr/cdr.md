## cdr

```yaml
version: "3"
services:
    cdr:
        image: codercom/code-server
        container_name: cdr
        restart: always
        expose:
            - 8080
        ports:
            - 9100:8080
        user: 1026:101
        environment:
            - TZ=Asia/Shanghai
            - DOCKER_USER=dubuqingfeng
            - PGID=101
            - PUID=1026
        volumes:
            - /etc/localtime:/etc/localtime:ro
            - /volume1/0x20vscode/config:/home/coder/.config:rw
            - /volume1/0x10projects:/home/coder/project:rw
        logging:
            driver: "json-file"
            options:
                max-size: "1m"

```
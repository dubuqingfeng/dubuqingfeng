## zerotier

```
version: '3.3'
services:
    zerotier-synology:
        container_name: zerotier
        restart: always
        devices:
            - /dev/net/tun
        network_mode: host
        cap_add:
            - NET_ADMIN
            - SYS_ADMIN
        volumes:
            - '/volume1/docker/zerotier/data:/var/lib/zerotier-one'
        image: 'zerotier/zerotier-synology:latest'
```
## dufs


```
version: '3.3'
services:
    data:
        volumes:
            - '/volume1/docker/dufs/data:/data'
        ports:
            - 'port:5000'
        image: sigoden/dufs
        command: "/data -A"
        container_name: "dufs"
```
## registry

```
version: "3"
services:
    registery:
        ports:
            - 3700:5000
        volumes:
            - ./storage:/var/lib/registry
        container_name: registry
        image: registry
```
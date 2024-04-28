## wallabag

```
version: "3"
services:
    wallabag:
        volumes:
            - ./data:/var/www/wallabag/data
            - ./images:/var/www/wallabag/web/assets/images
        ports:
            - 8065:80
        environment:
            - SYMFONY__ENV__DOMAIN_NAME=http://192.168.xxx.xxx:8065
        image: wallabag/wallabag
```
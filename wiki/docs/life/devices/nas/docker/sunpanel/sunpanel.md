## sunpanel

```
version: '3.3'
services:
    sun-panel:
        image: hslr/sun-panel
        container_name: sun-panel
        volumes:
            - './docker_data/sun-panel/database:/app/database'
            - './docker_data/sun-panel/uploads:/app/uploads'
            - './docker_data/sun-panel/conf:/app/conf'
        ports:
            - '3002:3002'
        restart: always

```
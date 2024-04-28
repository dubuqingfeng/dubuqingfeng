## gitea

```
version: "3"

networks:
  gitea:
    external: false

services:
  server:
    image: dockerproxy.com/gitea/gitea:1.21
    container_name: gitea
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    networks:
      - gitea
    environment:
      - GITEA__cors__ENABLED=true
      - GITEA__cors__X_FRAME_OPTIONS="ALLOW-FROM ip"
    volumes:
      - ./data:/data
#   - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3010:3000"
      - "222:22"
```
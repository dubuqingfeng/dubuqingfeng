## clash

```
version: "3"
services:
  clash:
    image: dockerproxy.com/dreamacro/clash
    container_name: clash-premium
    ports:
      - 7880:7890
      - 7881:7891
      - 9090:9090
    restart: always
    volumes:
      - ./clash.yaml:/root/.config/clash/config.yaml
```
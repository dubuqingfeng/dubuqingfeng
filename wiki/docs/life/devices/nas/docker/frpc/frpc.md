## frpc

```
version: "3"
services:
  frpc:
    image: snowdreamtech/frpc
    container_name: frpc
    restart: always
    volumes:
      - ./frp.ini:/etc/frp/frpc.ini
```
## cadvisor

```
version: "3"
services:
  cadvisor:
    image: gcr.nju.edu.cn/cadvisor/cadvisor:v0.47.1    
    container_name: cadvisor
    user: "1000:1000"
    ports:
      - "8083:8083"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
#      - /var/lib/docker/:/var/lib/docker:ro
#      - /dev/disk/:/dev/disk:ro
#      - /etc/machine-id:/etc/machine-id:ro
#      - /var/lib/dbus/machine-id:/var/lib/dbus/machine-id:ro
    devices:
      - /dev/kmsg:/dev/kmsg
    restart: unless-stopped
    privileged: true
```
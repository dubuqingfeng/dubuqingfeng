## freshrss

```
version: "3"

volumes:
  data:
  extensions:

services:
  freshrss:
    image:  dockerproxy.com/freshrss/freshrss:latest
    # Optional build section if you want to build the image locally:
    container_name: freshrss
    ports:
      - "${PUBLISHED_PORT:-3080}:${LISTEN:-80}"
    hostname: freshrss
    restart: unless-stopped
    logging:
      options:
        max-size: 10m
    volumes:
      - data:/var/www/FreshRSS/data
      - extensions:/var/www/FreshRSS/extensions
    environment:
      TZ: Europe/Paris
      CRON_MIN: '3,33'
      TRUSTED_PROXY: 172.16.0.1/12 192.168.0.1/16
```
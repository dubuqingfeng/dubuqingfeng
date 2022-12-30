## nginx-proxy-manager

```yaml
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '8086:81'
      - '8087:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```
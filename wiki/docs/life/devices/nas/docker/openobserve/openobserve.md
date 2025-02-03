## openobserve

```
services:
  openobserve:
    image: public.ecr.aws/zinclabs/openobserve:latest
    restart: unless-stopped
    environment:
      ZO_ROOT_USER_EMAIL: "root@example.com"
      ZO_ROOT_USER_PASSWORD: ""
      ZO_COMPACT_DATA_RETENTION_DAYS: 30
    ports:
      - "5080:5080"
    volumes:
      - ./data:/data
```
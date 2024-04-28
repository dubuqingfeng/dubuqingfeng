## filecodebox

```
version: '3'
services:
  filecodebox:
    image: lanol/filecodebox:beta
    container_name: filecodebox
    restart: always
    ports:
      - "7000:12345"
    volumes:
      - /volume1/docker/filecodebox/data:/app/data
```
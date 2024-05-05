## dootask

nginx:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
map $http_host $this_host {
    "" $host;
    default $http_host;
}
map $http_x_forwarded_proto $the_scheme {
     default $http_x_forwarded_proto;
     "" $scheme;
}
map $http_x_forwarded_host $the_host {
    default $http_x_forwarded_host;
    "" $this_host;
}
upstream service {
    server php:20000 weight=5 max_fails=3 fail_timeout=30s;
    keepalive 16;
}
server {
    listen 80;

    include /etc/nginx/conf.d/site/*.conf;

    root /var/www/public;

    client_max_body_size  1024M;

    autoindex off;
    index index.html index.htm index.php;

    charset utf-8;

    location / {
        try_files $uri @laravels;
    }

    location ~ \.well-known{
        allow all;
    }

    location =/ws {
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Real-PORT $remote_port;
        proxy_set_header X-Forwarded-Host $the_host;
        proxy_set_header X-Forwarded-Proto $the_scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header Server-Protocol $server_protocol;
        proxy_set_header Server-Name $server_name;
        proxy_set_header Server-Addr $server_addr;
        proxy_set_header Server-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_pass http://service;
    }

    location @laravels {
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Real-PORT $remote_port;
        proxy_set_header X-Forwarded-Host $the_host;
        proxy_set_header X-Forwarded-Proto $the_scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header Scheme $scheme;
        proxy_set_header Server-Protocol $server_protocol;
        proxy_set_header Server-Name $server_name;
        proxy_set_header Server-Addr $server_addr;
        proxy_set_header Server-Port $server_port;
        proxy_pass http://service;
    }
}

include /etc/nginx/conf.d/conf.d/*.conf;
```

docker-compose:

```
services:
  php:
    container_name: "dootask-php-${APP_ID}"
    image: "kuaifan/php:swoole-8.0.rc14"
    shm_size: "2gb"
    ulimits:
      core:
        soft: 0
        hard: 0
    volumes:
      - ./docker/crontab/crontab.conf:/etc/supervisor/conf.d/crontab.conf
      - ./docker/php/php.conf:/etc/supervisor/conf.d/php.conf
      - ./docker/php/php.ini:/usr/local/etc/php/php.ini
      - ./docker/log/supervisor:/var/log/supervisor
      - ./:/var/www
    environment:
      LANG: "C.UTF-8"
      MODE: "production"
      MYSQL_HOST: "${DB_HOST}"
      MYSQL_PORT: "${DB_PORT}"
      MYSQL_DB_NAME: "${DB_DATABASE}"
      MYSQL_USERNAME: "${DB_USERNAME}"
      MYSQL_PASSWORD: "${DB_PASSWORD}"
    networks:
      extnetwork:
        ipv4_address: "${APP_IPPR}.2"
    depends_on:
      - redis
      - mariadb
    restart: unless-stopped

  nginx:
    container_name: "dootask-nginx-${APP_ID}"
    image: "nginx:alpine"
    ports:
      - "${APP_PORT}:80"
      - "${APP_SSL_PORT:-}:443"
    volumes:
      - ./docker/nginx:/etc/nginx/conf.d
      - ./public:/var/www/public
    networks:
      extnetwork:
        ipv4_address: "${APP_IPPR}.3"
    links:
      - php
      # - office
      # - fileview
      # - drawio-webapp
      # - drawio-export
      # - minder
      - okr
      # - ai
    restart: unless-stopped

  redis:
    container_name: "dootask-redis-${APP_ID}"
    image: "redis:alpine"
    networks:
      extnetwork:
        ipv4_address: "${APP_IPPR}.4"
    restart: unless-stopped

  mariadb:
    container_name: "dootask-mariadb-${APP_ID}"
    image: "mariadb:10.7.3"
    ports:
      - "${DB_OPEN_PORT:-}:3306"
    volumes:
      - ./docker/mysql/repassword.sh:/etc/mysql/repassword.sh
      - ./docker/mysql/conf.d:/etc/mysql/conf.d
      - ./docker/mysql/data:/var/lib/mysql
    environment:
      MYSQL_PREFIX: "${DB_PREFIX}"
      MYSQL_ROOT_PASSWORD: "${DB_ROOT_PASSWORD}"
      MYSQL_DATABASE: "${DB_DATABASE}"
      MYSQL_USER: "${DB_USERNAME}"
      MYSQL_PASSWORD: "${DB_PASSWORD}"
    networks:
      extnetwork:
        ipv4_address: "${APP_IPPR}.5"
    restart: unless-stopped

  # office:
  #   container_name: "dootask-office-${APP_ID}"
  #   image: "onlyoffice/documentserver:7.5.1.1"
  #   volumes:
  #     - ./docker/office/logs:/var/log/onlyoffice
  #     - ./docker/office/data:/var/www/onlyoffice/Data
  #     - ./docker/office/resources/require.js:/var/www/onlyoffice/documentserver/web-apps/vendor/requirejs/require.js
  #     - ./docker/office/resources/documenteditor/main/resources/css/app.css:/var/www/onlyoffice/documentserver/web-apps/apps/documenteditor/main/resources/css/app.css
  #     - ./docker/office/resources/documenteditor/mobile/css/964.css:/var/www/onlyoffice/documentserver/web-apps/apps/documenteditor/mobile/css/964.css
  #     - ./docker/office/resources/presentationeditor/main/resources/css/app.css:/var/www/onlyoffice/documentserver/web-apps/apps/presentationeditor/main/resources/css/app.css
  #     - ./docker/office/resources/presentationeditor/mobile/css/612.css:/var/www/onlyoffice/documentserver/web-apps/apps/presentationeditor/mobile/css/612.css
  #     - ./docker/office/resources/spreadsheeteditor/main/resources/css/app.css:/var/www/onlyoffice/documentserver/web-apps/apps/spreadsheeteditor/main/resources/css/app.css
  #     - ./docker/office/resources/spreadsheeteditor/mobile/css/887.css:/var/www/onlyoffice/documentserver/web-apps/apps/spreadsheeteditor/mobile/css/887.css
  #   environment:
  #     JWT_SECRET: ${APP_KEY}
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.6"
  #   restart: unless-stopped

  # fileview:
  #   container_name: "dootask-fileview-${APP_ID}"
  #   image: "kuaifan/fileview:4.2.0-SNAPSHOT-RC25"
  #   environment:
  #     KK_CONTEXT_PATH: "/fileview"
  #     KK_OFFICE_PREVIEW_SWITCH_DISABLED: true
  #     KK_FILE_UPLOAD_ENABLED: true
  #     KK_MEDIA: "mp3,wav,mp4,mov,avi,wmv"
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.7"
  #   restart: unless-stopped

  # drawio-webapp:
  #   container_name: "dootask-drawio-webapp-${APP_ID}"
  #   image: "jgraph/drawio:20.8.20"
  #   volumes:
  #     - ./docker/drawio/webapp/index.html:/usr/local/tomcat/webapps/draw/index.html
  #     - ./docker/drawio/webapp/stencils:/usr/local/tomcat/webapps/draw/stencils
  #     - ./docker/drawio/webapp/js/app.min.js:/usr/local/tomcat/webapps/draw/js/app.min.js
  #     - ./docker/drawio/webapp/js/croppie/croppie.min.css:/usr/local/tomcat/webapps/draw/js/croppie/croppie.min.css
  #     - ./docker/drawio/webapp/js/diagramly/ElectronApp.js:/usr/local/tomcat/webapps/draw/js/diagramly/ElectronApp.js
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.8"
  #   depends_on:
  #     - drawio-export
  #   restart: unless-stopped

  # drawio-export:
  #   container_name: "dootask-drawio-export-${APP_ID}"
  #   image: "kuaifan/export-server:0.0.1"
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.9"
  #   volumes:
  #     - ./docker/drawio/export/fonts:/usr/share/fonts/drawio
  #   restart: unless-stopped

  # minder:
  #   container_name: "dootask-minder-${APP_ID}"
  #   image: "kuaifan/minder:0.1.3"
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.10"
  #   restart: unless-stopped

  # approve:
  #   container_name: "dootask-approve-${APP_ID}"
  #   image: "kuaifan/dooapprove:0.0.10"
  #   environment:
  #     TZ: "${TIMEZONE:-PRC}"
  #     MYSQL_HOST: "${DB_HOST}"
  #     MYSQL_PORT: "${DB_PORT}"
  #     MYSQL_DBNAME: "${DB_DATABASE}"
  #     MYSQL_USERNAME: "${DB_USERNAME}"
  #     MYSQL_PASSWORD: "${DB_PASSWORD}"
  #     MYSQL_Prefix: "${DB_PREFIX}approve_"
  #     DEMO_DATA: true
  #     KEY: ${APP_KEY}
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.11"
  #   depends_on:
  #     - mariadb
  #   restart: unless-stopped

  # ai:
  #   container_name: "dootask-ai-${APP_ID}"
  #   image: "kuaifan/dooai:0.1.8"
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.12"
  #   restart: unless-stopped

  # okr:
  #   container_name: "dootask-okr-${APP_ID}"
  #   image: "kuaifan/doookr:0.4.2"
  #   environment:
  #     TZ: "${TIMEZONE:-PRC}"
  #     DOO_TASK_URL: "http://${APP_IPPR}.3"
  #     MYSQL_HOST: "${DB_HOST}"
  #     MYSQL_PORT: "${DB_PORT}"
  #     MYSQL_DBNAME: "${DB_DATABASE}"
  #     MYSQL_USERNAME: "${DB_USERNAME}"
  #     MYSQL_PASSWORD: "${DB_PASSWORD}"
  #     MYSQL_PREFIX: "${DB_PREFIX}"
  #     DEMO_DATA: true
  #     KEY: ${APP_KEY}
  #   networks:
  #     extnetwork:
  #       ipv4_address: "${APP_IPPR}.13"
  #   depends_on:
  #     - mariadb
  #   restart: unless-stopped

networks:
  extnetwork:
    name: "dootask-networks-${APP_ID}"
    ipam:
      config:
        - subnet: "${APP_IPPR}.0/24"
          gateway: "${APP_IPPR}.1"
```
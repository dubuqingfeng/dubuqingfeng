```
version: '3'
services:                                      # 集合
  docker_jenkins:
    container_name: jenkins
    user: root
    image: jenkins/jenkins:lts                 # 指定服务所使用的镜像 在这里我选择了 LTS (长期支持)
    container_name: jenkins                    # 容器名称
    ports:                                     # 对外暴露的端口定义
      - 8882:8080                              # 访问Jenkins服务端口
      - 50000:50000
    volumes:                                   # 卷挂载路径
      - /data/jenkins/data:/var/jenkins_home  # 这是我们一开始创建的目录挂载到容器内的jenkins_home目录
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker                # 这是为了我们可以在容器内使用docker命令
      - /usr/local/bin/docker-compose:/usr/local/bin/docker-compose
```

build:

```
BUILD_COIN_OSS_URL
BUILD_COIN_IMAGE

1. apt install wget && wget ${BUILD_COIN_OSS_URL} -O ${BUILD_COIN_IMAGE}.tar.gz
2. rm -rf /project && mkdir /project && tar zxvf ${BUILD_COIN_IMAGE}.tar.gz -C /project
3. cd $(ls -ld /project/* | awk '{print $NF}') && docker build . -t ${BUILD_COIN_IMAGE}
4. curl -X POST -H "Content-Type: application/json" \
    -d '{"msg_type":"text","content":{"text":"'"${BUILD_COIN_IMAGE} build success."'"}}' \
  https://open.larksuite.com/open-apis/bot/v2/hook/xxx


BUILD_COIN_OSS_URL
BUILD_COIN_IMAGE
BUILD_COIN_BIN_PATH

1. apt install wget && wget ${BUILD_COIN_OSS_URL} -O ${BUILD_COIN_IMAGE}.tar.gz
2. rm -rf /fproject && mkdir /fproject && tar zxvf ${BUILD_COIN_IMAGE}.tar.gz -C /fproject
3. cd $(ls -ld /fproject/* | awk '{print $NF}') && docker build . -t ${BUILD_COIN_IMAGE}
4. docker run --name jenkins-fork-coin-project -d ${BUILD_COIN_IMAGE} tail -f /dev/null
5. docker cp jenkins-fork-coin-project:${BUILD_COIN_BIN_PATH} /output/${BUILD_COIN_IMAGE}
6. docker rm -f jenkins-fork-coin-project
7. docker save
8. curl -X POST -H "Content-Type: application/json" \
    -d '{"msg_type":"text","content":{"text":"'"${BUILD_COIN_IMAGE} build success."'"}}' \
  https://open.larksuite.com/open-apis/bot/v2/hook/xxx
```

## vscode

```
version: '3.3'
services:
    vscode-server:
        container_name: vscode-server
        hostname: vscode
        ports:
            - '8010:8000'
        environment:
            - VSCODE_KEYRING_PASS=mysecretpassword
            - VSCODE_SERVE_MODE=serve-local
        volumes:
            - '/volume1/projects:/home/vscode/project:rw'
            - './data:/root/.vscode-server'
        image: 'ahmadnassri/vscode-server:latest'
```
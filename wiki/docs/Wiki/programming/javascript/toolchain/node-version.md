### Node 版本管理（nvm/nodenv/Volta）

- nvm：常用 `nvm install 20 && nvm use 20 && nvm alias default 20`；
- Volta：按项目固定 Node/npm/yarn 版本，跨平台体验更佳；
- CI 中使用官方 setup-node/cache 策略并启用 lockfile 缓存可显著提速。


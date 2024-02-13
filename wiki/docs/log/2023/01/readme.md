# 01.05

https://github.com/syscoin/eth-proof

```
remote=origin ; for brname in `git branch -r | grep $remote | grep -v master | grep -v HEAD | awk '{gsub(/^[^\/]+\//,"",$1); print $1}'`; do git branch --track $brname $remote/$brname || true; done 2>/dev/null
git fetch --all
git pull --all
git push --all local
git branch --track v0.3.3-dev local/v0.3.3-dev
```

# 01.19

cors 的解决方案：

https://github.com/chanmyaemaung/cors-proxy

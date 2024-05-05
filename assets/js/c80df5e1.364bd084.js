"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[7179],{54740:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>d,contentTitle:()=>s,default:()=>u,frontMatter:()=>t,metadata:()=>i,toc:()=>a});var c=r(74848),o=r(28453);const t={},s=void 0,i={id:"life/devices/nas/docker/cdr/cdr",title:"cdr",description:"cdr",source:"@site/docs/life/devices/nas/docker/cdr/cdr.md",sourceDirName:"life/devices/nas/docker/cdr",slug:"/life/devices/nas/docker/cdr/",permalink:"/docs/life/devices/nas/docker/cdr/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"cadvisor",permalink:"/docs/life/devices/nas/docker/cadvisor/"},next:{title:"docker",permalink:"/docs/life/devices/nas/docker/clash/docker"}},d={},a=[{value:"cdr",id:"cdr",level:2}];function l(e){const n={code:"code",h2:"h2",pre:"pre",...(0,o.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(n.h2,{id:"cdr",children:"cdr"}),"\n",(0,c.jsx)(n.pre,{children:(0,c.jsx)(n.code,{className:"language-yaml",children:'version: "3"\nservices:\n    cdr:\n        image: codercom/code-server\n        container_name: cdr\n        restart: always\n        expose:\n            - 8080\n        ports:\n            - 9100:8080\n        user: 1026:101\n        environment:\n            - TZ=Asia/Shanghai\n            - DOCKER_USER=dubuqingfeng\n            - PGID=101\n            - PUID=1026\n        volumes:\n            - /etc/localtime:/etc/localtime:ro\n            - /volume1/0x20vscode/config:/home/coder/.config:rw\n            - /volume1/0x10projects:/home/coder/project:rw\n        logging:\n            driver: "json-file"\n            options:\n                max-size: "1m"\n\n'})})]})}function u(e={}){const{wrapper:n}={...(0,o.R)(),...e.components};return n?(0,c.jsx)(n,{...e,children:(0,c.jsx)(l,{...e})}):l(e)}},28453:(e,n,r)=>{r.d(n,{R:()=>s,x:()=>i});var c=r(96540);const o={},t=c.createContext(o);function s(e){const n=c.useContext(t);return c.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:s(e.components),c.createElement(t.Provider,{value:n},e.children)}}}]);
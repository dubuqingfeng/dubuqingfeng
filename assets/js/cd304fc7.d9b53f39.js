"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[9951],{47644:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>t,contentTitle:()=>c,default:()=>l,frontMatter:()=>o,metadata:()=>d,toc:()=>a});var s=r(74848),i=r(28453);const o={},c=void 0,d={id:"life/devices/nas/docker/cadvisor/cadvisor",title:"cadvisor",description:"cadvisor",source:"@site/docs/life/devices/nas/docker/cadvisor/cadvisor.md",sourceDirName:"life/devices/nas/docker/cadvisor",slug:"/life/devices/nas/docker/cadvisor/",permalink:"/docs/life/devices/nas/docker/cadvisor/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"alfred",permalink:"/docs/life/devices/alfred"},next:{title:"cdr",permalink:"/docs/life/devices/nas/docker/cdr/"}},t={},a=[{value:"cadvisor",id:"cadvisor",level:2}];function v(e){const n={code:"code",h2:"h2",pre:"pre",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h2,{id:"cadvisor",children:"cadvisor"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:'version: "3"\nservices:\n  cadvisor:\n    image: gcr.nju.edu.cn/cadvisor/cadvisor:v0.47.1    \n    container_name: cadvisor\n    user: "1000:1000"\n    ports:\n      - "8083:8083"\n    volumes:\n      - /:/rootfs:ro\n      - /var/run:/var/run:ro\n      - /sys:/sys:ro\n#      - /var/lib/docker/:/var/lib/docker:ro\n#      - /dev/disk/:/dev/disk:ro\n#      - /etc/machine-id:/etc/machine-id:ro\n#      - /var/lib/dbus/machine-id:/var/lib/dbus/machine-id:ro\n    devices:\n      - /dev/kmsg:/dev/kmsg\n    restart: unless-stopped\n    privileged: true\n'})})]})}function l(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(v,{...e})}):v(e)}},28453:(e,n,r)=>{r.d(n,{R:()=>c,x:()=>d});var s=r(96540);const i={},o=s.createContext(i);function c(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:c(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);
"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[2957],{26124:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>l,contentTitle:()=>c,default:()=>m,frontMatter:()=>o,metadata:()=>s,toc:()=>i});var r=a(74848),t=a(28453);const o={},c=void 0,s={id:"life/devices/nas/docker/crawlab/crawlab",title:"crawlab",description:"crawlab",source:"@site/docs/life/devices/nas/docker/crawlab/crawlab.md",sourceDirName:"life/devices/nas/docker/crawlab",slug:"/life/devices/nas/docker/crawlab/",permalink:"/docs/life/devices/nas/docker/crawlab/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"docker",permalink:"/docs/life/devices/nas/docker/clash/docker"},next:{title:"dufs",permalink:"/docs/life/devices/nas/docker/dufs/"}},l={},i=[{value:"crawlab",id:"crawlab",level:2}];function d(e){const n={code:"code",h2:"h2",pre:"pre",...(0,t.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h2,{id:"crawlab",children:"crawlab"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:'version: \'3.3\'\nservices:\n  master: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_master\n    environment:\n      CRAWLAB_NODE_MASTER: "Y"\n      CRAWLAB_MONGO_HOST: "mongo"\n    volumes:\n      - "./.crawlab/master:/root/.crawlab"\n    ports:    \n      - "8080:8080"\n    depends_on:\n      - mongo\n\n  worker01: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_worker01\n    environment:\n      CRAWLAB_NODE_MASTER: "N"\n      CRAWLAB_GRPC_ADDRESS: "master"\n      CRAWLAB_FS_FILER_URL: "http://master:8080/api/filer"\n    volumes:\n      - "./.crawlab/worker01:/root/.crawlab"\n    depends_on:\n      - master\n\n  worker02: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_worker02\n    environment:\n      CRAWLAB_NODE_MASTER: "N"\n      CRAWLAB_GRPC_ADDRESS: "master"\n      CRAWLAB_FS_FILER_URL: "http://master:8080/api/filer"\n    volumes:\n      - "./.crawlab/worker02:/root/.crawlab"\n    depends_on:\n      - master\n\n  mongo:\n    image: mongo:4.2\n    container_name: crawlab_example_mongo\n    restart: always\n'})})]})}function m(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},28453:(e,n,a)=>{a.d(n,{R:()=>c,x:()=>s});var r=a(96540);const t={},o=r.createContext(t);function c(e){const n=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:c(e.components),r.createElement(o.Provider,{value:n},e.children)}}}]);
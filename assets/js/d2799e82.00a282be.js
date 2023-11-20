"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[3638],{3905:(e,r,n)=>{n.d(r,{Zo:()=>m,kt:()=>b});var a=n(67294);function t(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);r&&(a=a.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){t(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,a,t=function(e,r){if(null==e)return{};var n,a,t={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],r.indexOf(n)>=0||(t[n]=e[n]);return t}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(t[n]=e[n])}return t}var i=a.createContext({}),s=function(e){var r=a.useContext(i),n=r;return e&&(n="function"==typeof e?e(r):c(c({},r),e)),n},m=function(e){var r=s(e.components);return a.createElement(i.Provider,{value:r},e.children)},p={inlineCode:"code",wrapper:function(e){var r=e.children;return a.createElement(a.Fragment,{},r)}},d=a.forwardRef((function(e,r){var n=e.components,t=e.mdxType,o=e.originalType,i=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),d=s(n),b=t,u=d["".concat(i,".").concat(b)]||d[b]||p[b]||o;return n?a.createElement(u,c(c({ref:r},m),{},{components:n})):a.createElement(u,c({ref:r},m))}));function b(e,r){var n=arguments,t=r&&r.mdxType;if("string"==typeof e||t){var o=n.length,c=new Array(o);c[0]=d;var l={};for(var i in r)hasOwnProperty.call(r,i)&&(l[i]=r[i]);l.originalType=e,l.mdxType="string"==typeof e?e:t,c[1]=l;for(var s=2;s<o;s++)c[s]=n[s];return a.createElement.apply(null,c)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},84377:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>i,contentTitle:()=>c,default:()=>p,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var a=n(87462),t=(n(67294),n(3905));const o={},c=void 0,l={unversionedId:"life/devices/nas/docker/crawlab/crawlab",id:"life/devices/nas/docker/crawlab/crawlab",title:"crawlab",description:"crawlab",source:"@site/docs/life/devices/nas/docker/crawlab/crawlab.md",sourceDirName:"life/devices/nas/docker/crawlab",slug:"/life/devices/nas/docker/crawlab/",permalink:"/docs/life/devices/nas/docker/crawlab/",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/life/devices/nas/docker/crawlab/crawlab.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"cdr",permalink:"/docs/life/devices/nas/docker/cdr/"},next:{title:"nginx-proxy-manager",permalink:"/docs/life/devices/nas/docker/nginx-proxy-manager/"}},i={},s=[{value:"crawlab",id:"crawlab",level:2}],m={toc:s};function p(e){let{components:r,...n}=e;return(0,t.kt)("wrapper",(0,a.Z)({},m,n,{components:r,mdxType:"MDXLayout"}),(0,t.kt)("h2",{id:"crawlab"},"crawlab"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-yaml"},'version: \'3.3\'\nservices:\n  master: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_master\n    environment:\n      CRAWLAB_NODE_MASTER: "Y"\n      CRAWLAB_MONGO_HOST: "mongo"\n    volumes:\n      - "./.crawlab/master:/root/.crawlab"\n    ports:    \n      - "8080:8080"\n    depends_on:\n      - mongo\n\n  worker01: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_worker01\n    environment:\n      CRAWLAB_NODE_MASTER: "N"\n      CRAWLAB_GRPC_ADDRESS: "master"\n      CRAWLAB_FS_FILER_URL: "http://master:8080/api/filer"\n    volumes:\n      - "./.crawlab/worker01:/root/.crawlab"\n    depends_on:\n      - master\n\n  worker02: \n    image: crawlabteam/crawlab:latest\n    container_name: crawlab_example_worker02\n    environment:\n      CRAWLAB_NODE_MASTER: "N"\n      CRAWLAB_GRPC_ADDRESS: "master"\n      CRAWLAB_FS_FILER_URL: "http://master:8080/api/filer"\n    volumes:\n      - "./.crawlab/worker02:/root/.crawlab"\n    depends_on:\n      - master\n\n  mongo:\n    image: mongo:4.2\n    container_name: crawlab_example_mongo\n    restart: always\n')))}p.isMDXComponent=!0}}]);
"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[515],{3905:(e,n,t)=>{t.d(n,{Zo:()=>l,kt:()=>k});var r=t(67294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},l=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,s=e.parentName,l=a(e,["components","mdxType","originalType","parentName"]),d=p(t),k=o,f=d["".concat(s,".").concat(k)]||d[k]||u[k]||i;return t?r.createElement(f,c(c({ref:n},l),{},{components:t})):r.createElement(f,c({ref:n},l))}));function k(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,c=new Array(i);c[0]=d;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,c[1]=a;for(var p=2;p<i;p++)c[p]=t[p];return r.createElement.apply(null,c)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"},58535:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>c,default:()=>u,frontMatter:()=>i,metadata:()=>a,toc:()=>p});var r=t(87462),o=(t(67294),t(3905));const i={},c=void 0,a={unversionedId:"Wiki/devops/jenkins/docker",id:"Wiki/devops/jenkins/docker",title:"docker",description:"build:",source:"@site/docs/Wiki/devops/jenkins/docker.md",sourceDirName:"Wiki/devops/jenkins",slug:"/Wiki/devops/jenkins/docker",permalink:"/docs/Wiki/devops/jenkins/docker",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"quant",permalink:"/docs/Wiki/blockchain/quant/"},next:{title:"kubernetes",permalink:"/docs/Wiki/devops/kubernetes/"}},s={},p=[],l={toc:p};function u(e){let{components:n,...t}=e;return(0,o.kt)("wrapper",(0,r.Z)({},l,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"version: '3'\nservices:                                      # \u96c6\u5408\n  docker_jenkins:\n    container_name: jenkins\n    user: root\n    image: jenkins/jenkins:lts                 # \u6307\u5b9a\u670d\u52a1\u6240\u4f7f\u7528\u7684\u955c\u50cf \u5728\u8fd9\u91cc\u6211\u9009\u62e9\u4e86 LTS (\u957f\u671f\u652f\u6301)\n    container_name: jenkins                    # \u5bb9\u5668\u540d\u79f0\n    ports:                                     # \u5bf9\u5916\u66b4\u9732\u7684\u7aef\u53e3\u5b9a\u4e49\n      - 8882:8080                              # \u8bbf\u95eeJenkins\u670d\u52a1\u7aef\u53e3\n      - 50000:50000\n    volumes:                                   # \u5377\u6302\u8f7d\u8def\u5f84\n      - /data/jenkins/data:/var/jenkins_home  # \u8fd9\u662f\u6211\u4eec\u4e00\u5f00\u59cb\u521b\u5efa\u7684\u76ee\u5f55\u6302\u8f7d\u5230\u5bb9\u5668\u5185\u7684jenkins_home\u76ee\u5f55\n      - /var/run/docker.sock:/var/run/docker.sock\n      - /usr/bin/docker:/usr/bin/docker                # \u8fd9\u662f\u4e3a\u4e86\u6211\u4eec\u53ef\u4ee5\u5728\u5bb9\u5668\u5185\u4f7f\u7528docker\u547d\u4ee4\n      - /usr/local/bin/docker-compose:/usr/local/bin/docker-compose\n")),(0,o.kt)("p",null,"build:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},'BUILD_COIN_OSS_URL\nBUILD_COIN_IMAGE\n\n1. apt install wget && wget ${BUILD_COIN_OSS_URL} -O ${BUILD_COIN_IMAGE}.tar.gz\n2. rm -rf /project && mkdir /project && tar zxvf ${BUILD_COIN_IMAGE}.tar.gz -C /project\n3. cd $(ls -ld /project/* | awk \'{print $NF}\') && docker build . -t ${BUILD_COIN_IMAGE}\n4. curl -X POST -H "Content-Type: application/json" \\\n    -d \'{"msg_type":"text","content":{"text":"\'"${BUILD_COIN_IMAGE} build success."\'"}}\' \\\n  https://open.larksuite.com/open-apis/bot/v2/hook/xxx\n\n\nBUILD_COIN_OSS_URL\nBUILD_COIN_IMAGE\nBUILD_COIN_BIN_PATH\n\n1. apt install wget && wget ${BUILD_COIN_OSS_URL} -O ${BUILD_COIN_IMAGE}.tar.gz\n2. rm -rf /fproject && mkdir /fproject && tar zxvf ${BUILD_COIN_IMAGE}.tar.gz -C /fproject\n3. cd $(ls -ld /fproject/* | awk \'{print $NF}\') && docker build . -t ${BUILD_COIN_IMAGE}\n4. docker run --name jenkins-fork-coin-project -d ${BUILD_COIN_IMAGE} tail -f /dev/null\n5. docker cp jenkins-fork-coin-project:${BUILD_COIN_BIN_PATH} /output/${BUILD_COIN_IMAGE}\n6. docker rm -f jenkins-fork-coin-project\n7. docker save\n8. curl -X POST -H "Content-Type: application/json" \\\n    -d \'{"msg_type":"text","content":{"text":"\'"${BUILD_COIN_IMAGE} build success."\'"}}\' \\\n  https://open.larksuite.com/open-apis/bot/v2/hook/xxx\n')))}u.isMDXComponent=!0}}]);
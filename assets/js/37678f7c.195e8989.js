"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[973],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>p});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},c=Object.keys(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(r=0;r<c.length;r++)n=c[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),d=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=d(e.components);return r.createElement(l.Provider,{value:t},e.children)},h={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,c=e.originalType,l=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),u=d(n),p=o,_=u["".concat(l,".").concat(p)]||u[p]||h[p]||c;return n?r.createElement(_,i(i({ref:t},s),{},{components:n})):r.createElement(_,i({ref:t},s))}));function p(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var c=n.length,i=new Array(c);i[0]=u;var a={};for(var l in t)hasOwnProperty.call(t,l)&&(a[l]=t[l]);a.originalType=e,a.mdxType="string"==typeof e?e:o,i[1]=a;for(var d=2;d<c;d++)i[d]=n[d];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},33213:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>h,frontMatter:()=>c,metadata:()=>a,toc:()=>d});var r=n(87462),o=(n(67294),n(3905));const c={},i=void 0,a={unversionedId:"code/healthcheck",id:"code/healthcheck",title:"healthcheck",description:"healthcheck",source:"@site/docs/code/healthcheck.md",sourceDirName:"code",slug:"/code/healthcheck",permalink:"/docs/code/healthcheck",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/code/healthcheck.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"mddir",permalink:"/docs/code/dir/mddir"},next:{title:"alfred",permalink:"/docs/life/devices/alfred"}},l={},d=[{value:"healthcheck",id:"healthcheck",level:2},{value:"code",id:"code",level:3}],s={toc:d};function h(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"healthcheck"},"healthcheck"),(0,o.kt)("h3",{id:"code"},"code"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},'#!/bin/bash\n# apk add curl jq\n\nCUR_NODE_NAME="test-eth"\nCUR_NODE_RPC_URL="http://localhost:8545"\nLARK_WEBHOOK_URL=""\nPUBLIC_NODES="https://eth-mainnet.public.blastapi.io"\nTHRESHOLD=0\n\n# restart\nRESTART_THRESHOLD=10\n\nfunction parse_json(){\n     echo "${1//\\"/}"|sed "s/.*$2:\\([^,}]*\\).*/\\1/"\n}\n\ncur_node_block_height_result=$(curl -s -X POST $CUR_NODE_RPC_URL --header \'Content-Type: application/json\' \\\n    --data-raw \'{"jsonrpc":"2.0","method":"eth_blockNumber","params":[], "id": 1}\')\ncur_node_hex_height=$(parse_json $cur_node_block_height_result "result")\ncur_node_dec_height=$(echo -n $cur_node_hex_height | xargs printf "%d")\necho "-- $CUR_NODE_RPC_URL -- " $cur_node_dec_height\n\n# \u8282\u70b9 peer \u76d1\u63a7\ncur_node_peer_result=`curl -H "Content-Type: application/json" --data \'{"jsonrpc":"2.0","method":"net_peerCount","id":64}\' $CUR_NODE_RPC_URL 2>/dev/null`\npeers_count=$(parse_json $cur_node_peer_result "result")\necho "Number of Node Connections: $((16#${peers_count:2}))"\nif [[ `printf "%d" $peers_count` == "0" || `printf "%d" $peers_count` == "1" ]]; then\n    peer_message="The node $CUR_NODE_NAME peer is low."\n    curl -X POST -H "Content-Type: application/json" -d \'{"msg_type":"text","content":{"text":"\'"${peer_message}"\'"}}\' $LARK_WEBHOOK_URL\n    exit 1;\nfi\n\nneed_exit=false\nfor value in $PUBLIC_NODES\ndo\n    cur_hex_height=$(curl -s -X POST $value --header \'Content-Type: application/json\' \\\n    --data-raw \'{"jsonrpc":"2.0","method":"eth_blockNumber","params":[], "id": 1}\' | jq -r .result)\n    cur_dec_height=$(echo -n $cur_hex_height | xargs printf "%d")\n    diff="$(($cur_dec_height-$cur_node_dec_height))"\n    echo "-- $value -- " $cur_dec_height "diff:" $diff\n    if [ "$diff" -gt "$THRESHOLD" ]; then\n        message="The node $CUR_NODE_NAME is not in sync, diff is $diff, now height is $cur_node_dec_height, $value, public node height is $cur_dec_height"\n        echo $message\n        curl -X POST -H "Content-Type: application/json" -d \'{"msg_type":"text","content":{"text":"\'"${message}"\'"}}\' $LARK_WEBHOOK_URL\n    fi\n    if [ "$diff" -gt "$RESTART_THRESHOLD" ]; then\n        need_exit=true\n    fi\ndone\n\nif $need_exit; then\n    echo "needExit";\n    exit 1;\nfi\nexit 0;\n')))}h.isMDXComponent=!0}}]);
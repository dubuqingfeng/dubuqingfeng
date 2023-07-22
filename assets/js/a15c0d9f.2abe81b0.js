"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[2070],{3905:(r,t,e)=>{e.d(t,{Zo:()=>p,kt:()=>s});var n=e(67294);function i(r,t,e){return t in r?Object.defineProperty(r,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):r[t]=e,r}function a(r,t){var e=Object.keys(r);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(r);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),e.push.apply(e,n)}return e}function o(r){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?a(Object(e),!0).forEach((function(t){i(r,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(e)):a(Object(e)).forEach((function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(e,t))}))}return r}function l(r,t){if(null==r)return{};var e,n,i=function(r,t){if(null==r)return{};var e,n,i={},a=Object.keys(r);for(n=0;n<a.length;n++)e=a[n],t.indexOf(e)>=0||(i[e]=r[e]);return i}(r,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(r);for(n=0;n<a.length;n++)e=a[n],t.indexOf(e)>=0||Object.prototype.propertyIsEnumerable.call(r,e)&&(i[e]=r[e])}return i}var c=n.createContext({}),u=function(r){var t=n.useContext(c),e=t;return r&&(e="function"==typeof r?r(t):o(o({},t),r)),e},p=function(r){var t=u(r.components);return n.createElement(c.Provider,{value:t},r.children)},f={inlineCode:"code",wrapper:function(r){var t=r.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(r,t){var e=r.components,i=r.mdxType,a=r.originalType,c=r.parentName,p=l(r,["components","mdxType","originalType","parentName"]),d=u(e),s=i,k=d["".concat(c,".").concat(s)]||d[s]||f[s]||a;return e?n.createElement(k,o(o({ref:t},p),{},{components:e})):n.createElement(k,o({ref:t},p))}));function s(r,t){var e=arguments,i=t&&t.mdxType;if("string"==typeof r||i){var a=e.length,o=new Array(a);o[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=r,l.mdxType="string"==typeof r?r:i,o[1]=l;for(var u=2;u<a;u++)o[u]=e[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,e)}d.displayName="MDXCreateElement"},59136:(r,t,e)=>{e.r(t),e.d(t,{assets:()=>c,contentTitle:()=>o,default:()=>f,frontMatter:()=>a,metadata:()=>l,toc:()=>u});var n=e(87462),i=(e(67294),e(3905));const a={},o=void 0,l={unversionedId:"Wiki/algorithm/sort/quick",id:"Wiki/algorithm/sort/quick",title:"quick",description:"Quick Sort",source:"@site/docs/Wiki/algorithm/sort/quick.md",sourceDirName:"Wiki/algorithm/sort",slug:"/Wiki/algorithm/sort/quick",permalink:"/docs/Wiki/algorithm/sort/quick",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/algorithm/sort/quick.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"wiki",permalink:"/docs/Wiki/"},next:{title:"address",permalink:"/docs/Wiki/blockchain/bitcoin/address/"}},c={},u=[{value:"Quick Sort",id:"quick-sort",level:2},{value:"\u4e2d\u5fc3\u601d\u60f3",id:"\u4e2d\u5fc3\u601d\u60f3",level:3},{value:"\u65f6\u95f4\u590d\u6742\u5ea6",id:"\u65f6\u95f4\u590d\u6742\u5ea6",level:3},{value:"\u5404\u8bed\u8a00\u5b9e\u73b0",id:"\u5404\u8bed\u8a00\u5b9e\u73b0",level:3},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:3}],p={toc:u};function f(r){let{components:t,...e}=r;return(0,i.kt)("wrapper",(0,n.Z)({},p,e,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"quick-sort"},"Quick Sort"),(0,i.kt)("p",null,"\u5feb\u901f\u6392\u5e8f"),(0,i.kt)("h3",{id:"\u4e2d\u5fc3\u601d\u60f3"},"\u4e2d\u5fc3\u601d\u60f3"),(0,i.kt)("p",null,"\u5206\u6cbb"),(0,i.kt)("h3",{id:"\u65f6\u95f4\u590d\u6742\u5ea6"},"\u65f6\u95f4\u590d\u6742\u5ea6"),(0,i.kt)("h3",{id:"\u5404\u8bed\u8a00\u5b9e\u73b0"},"\u5404\u8bed\u8a00\u5b9e\u73b0"),(0,i.kt)("p",null,"go:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"func quickSort(arr []int) []int {\n        return _quickSort(arr, 0, len(arr)-1)\n}\n\nfunc _quickSort(arr []int, left, right int) []int {\n        if left < right {\n                partitionIndex := partition(arr, left, right)\n                _quickSort(arr, left, partitionIndex-1)\n                _quickSort(arr, partitionIndex+1, right)\n        }\n        return arr\n}\n\nfunc partition(arr []int, left, right int) int {\n        pivot := left\n        index := pivot + 1\n\n        for i := index; i <= right; i++ {\n                if arr[i] < arr[pivot] {\n                        swap(arr, i, index)\n                        index += 1\n                }\n        }\n        swap(arr, pivot, index-1)\n        return index - 1\n}\n\nfunc swap(arr []int, i, j int) {\n        arr[i], arr[j] = arr[j], arr[i]\n}\n")),(0,i.kt)("p",null,"python:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"def quickSort(arr, left=None, right=None):\n    left = 0 if not isinstance(left,(int, float)) else left\n    right = len(arr)-1 if not isinstance(right,(int, float)) else right\n    if left < right:\n        partitionIndex = partition(arr, left, right)\n        quickSort(arr, left, partitionIndex-1)\n        quickSort(arr, partitionIndex+1, right)\n    return arr\n\ndef partition(arr, left, right):\n    pivot = left\n    index = pivot+1\n    i = index\n    while  i <= right:\n        if arr[i] < arr[pivot]:\n            swap(arr, i, index)\n            index+=1\n        i+=1\n    swap(arr,pivot,index-1)\n    return index-1\n\ndef swap(arr, i, j):\n    arr[i], arr[j] = arr[j], arr[i]\n")),(0,i.kt)("p",null,"php:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"function quickSort($arr)\n{\n    if (count($arr) <= 1)\n        return $arr;\n    $middle = $arr[0];\n    $leftArray = array();\n    $rightArray = array();\n\n    for ($i = 1; $i < count($arr); $i++) {\n        if ($arr[$i] > $middle)\n            $rightArray[] = $arr[$i];\n        else\n            $leftArray[] = $arr[$i];\n    }\n    $leftArray = quickSort($leftArray);\n    $leftArray[] = $middle;\n\n    $rightArray = quickSort($rightArray);\n    return array_merge($leftArray, $rightArray);\n}\n")),(0,i.kt)("h3",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"))}f.isMDXComponent=!0}}]);
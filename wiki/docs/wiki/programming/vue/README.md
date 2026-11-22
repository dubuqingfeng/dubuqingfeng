---
title: Vue
slug: /wiki/programming/vue
---

# Vue

Vue 的核心是“用响应式状态驱动视图”。理解 `ref/reactive` 的追踪边界、组件的 props/emits 契约、以及构建时的拆包，比记一堆指令更重要。

这篇文章以 Vue 3 + Composition API + Vite 为主线，覆盖状态、组件、路由、构建、安全和性能。

## 1. 响应式：ref、reactive、computed {#reactivity}

```ts
import { ref, reactive, computed, watch } from "vue";

const count = ref(0);
const form = reactive({ name: "", age: 0 });

const double = computed(() => count.value * 2);

watch(count, (next, prev) => {
  console.log(`count: ${prev} -> ${next}`);
});
```

- `ref` 适合基本类型和需要整体替换的对象；模板里自动解包，脚本里用 `.value`。
- `reactive` 适合对象/数组，但不能整体替换（会丢失响应性）。
- `computed` 有缓存，依赖不变不会重算；不要在 computed 里做副作用。
- `watch` 默认懒执行；需要立即执行用 `{ immediate: true }`，需要深度监听用 `{ deep: true }`（谨慎，成本高）。

> **解构陷阱：** `const { name } = form` 会丢失响应性；用 `toRefs(form)` 或直接访问 `form.name`。

## 2. 组件契约：props、emits、slots {#components}

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string;
  items: Array<{ id: string; label: string }>;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
}>();
</script>

<template>
  <h2>{{ title }}</h2>
  <ul>
    <li v-for="item in props.items" :key="item.id">
      <button @click="emit('select', item.id)">{{ item.label }}</button>
    </li>
  </ul>
  <slot name="footer" />
</template>
```

- props 是单向数据流；子组件不要直接改 props。
- 需要双向绑定用 `v-model`（本质是 `modelValue` + `update:modelValue`）。
- 跨层级传值用 `provide/inject`，但要有明确的 key 和默认值。
- 列表 `:key` 用稳定 ID，不要用数组下标。

## 3. 组合式函数：把逻辑从组件里拿出来 {#composables}

```ts
// useCounter.ts
import { ref } from "vue";

export function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => count.value++;
  const reset = () => (count.value = initial);
  return { count, increment, reset };
}
```

```vue
<script setup lang="ts">
import { useCounter } from "./useCounter";
const { count, increment, reset } = useCounter(10);
</script>
```

组合式函数适合复用“带状态的行为”（请求、轮询、表单、权限）。纯函数不需要包装成 composable。

## 4. 路由与状态：vue-router + Pinia {#router-state}

```ts
// router.ts
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("./pages/Home.vue") },
    { path: "/orders/:id", component: () => import("./pages/Order.vue"), props: true },
  ],
});
```

```ts
// stores/cart.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref<Array<{ id: string; qty: number }>>([]);
  const totalQty = computed(() => items.value.reduce((n, i) => n + i.qty, 0));
  function add(id: string) {
    const found = items.value.find((i) => i.id === id);
    found ? found.qty++ : items.value.push({ id, qty: 1 });
  }
  return { items, totalQty, add };
});
```

- 路由懒加载 `() => import(...)` 可以按页面拆包。
- Pinia store 用 setup 语法时，返回的 `ref` 在组件里会自动解包。
- 需要持久化的状态只存必要字段，不要整仓 `JSON.stringify`。

## 5. 构建：Vite、环境变量、拆包 {#build}

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
        },
      },
    },
  },
});
```

- 只有 `VITE_` 前缀的环境变量会暴露给客户端；不要把密钥放进去。
- `import.meta.env.PROD`/`DEV` 做环境分支，不要靠运行时域名判断。
- 生产开启 sourcemap 并上传到错误监控，不要公开部署 sourcemap。
- 大依赖按需引入；图表/编辑器等重组件用动态 import。

## 6. 安全：XSS 与 URL 处理 {#security}

Vue 默认对插值做 HTML 转义，但以下入口会绕过：

```vue
<!-- 危险：把用户输入当 HTML -->
<div v-html="userHtml" />

<!-- 危险：动态 href/src 未校验 -->
<a :href="userUrl">open</a>
<img :src="userImage" />
```

- 尽量避免 `v-html`；必须用时先做白名单 sanitize（如 DOMPurify）。
- 动态 `href` 只允许 `http/https`，拒绝 `javascript:`、`data:`。
- 不要把用户输入拼进 `innerHTML`、`eval`、`new Function`。
- 配置 CSP，减少内联脚本和第三方脚本；CSP 是纵深防御，不是替代转义。
- 富文本编辑器/ Markdown 渲染要在服务端或客户端做统一 sanitize。

## 7. 性能：减少无效渲染 {#performance}

- 列表 `:key` 稳定；大列表用虚拟滚动。
- 频繁变化且不需要深度响应的大对象用 `shallowRef`/`shallowReactive`。
- 计算属性缓存结果；不要在模板里做重计算。
- 路由级懒加载；重组件异步加载。
- `v-memo` 只对确实昂贵的子树使用，滥用会增加复杂度。
- 用 Vue DevTools 的 performance 面板定位组件重渲染。

## 8. 测试 {#test}

```ts
// Counter.spec.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Counter from "./Counter.vue";

describe("Counter", () => {
  it("increments", async () => {
    const wrapper = mount(Counter);
    await wrapper.get("button").trigger("click");
    expect(wrapper.text()).toContain("1");
  });
});
```

- 纯逻辑用 Vitest 单测；组件用 Vue Test Utils。
- 网络层用 MSW/Mock Service Worker，不要在每个测试里手写 fetch mock。
- E2E 用 Playwright/Cypress 覆盖关键路径。

## 9. 最小检查清单 {#checklist}

- [ ] 响应式对象不被整体替换；解构用 `toRefs`。
- [ ] props 单向，子组件通过 emit 改父状态。
- [ ] 列表 key 稳定；大列表虚拟滚动。
- [ ] 路由懒加载，重依赖动态 import。
- [ ] `v-html` 有 sanitize；动态 URL 有协议白名单。
- [ ] 环境变量不含密钥；sourcemap 不公开。
- [ ] 关键逻辑有单测，关键路径有 E2E。
- [ ] 生产有 CSP、错误监控和性能基线。

## 相关阅读 {#related}

- [编程与数据库](./../README.md)
- [JavaScript](./../javascript/README.md)
- [TypeScript](./../typescript/README.md)
- [安全：Web](./../../security/web/README.md)

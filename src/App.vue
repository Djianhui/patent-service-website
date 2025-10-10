<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 初始化认证
const authStore = useAuthStore()

onMounted(async () => {
  // 初始化认证状态
  await authStore.init()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
}
</style>

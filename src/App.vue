<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 初始化认证
const authStore = useAuthStore()

let tokenCheckInterval: number | null = null

onMounted(async () => {
  console.log('=== App.vue: onMounted 开始 ===')
  // 初始化认证状态
  await authStore.init()
  console.log('=== App.vue: 认证状态初始化完成 ===')
  console.log('用户登录状态:', authStore.isLoggedIn)
  console.log('用户信息:', authStore.user)

  // 设置定时检查 token 有效性（每1分钟检查一次）
  console.log('=== App.vue: 设置定时检查 token 有效性（每1分钟） ===')
  tokenCheckInterval = window.setInterval(async () => {
    console.log('\n=== Token 定时检查触发 ===')
    console.log('检查时间:', new Date().toLocaleTimeString())

    // 只在用户已登录且不在首页/登录页/注册页时检查
    const currentPath = window.location.pathname
    console.log('当前路径:', currentPath)
    console.log('用户登录状态:', authStore.isLoggedIn)
    console.log('检查条件:')
    console.log('  - isLoggedIn:', authStore.isLoggedIn)
    console.log('  - 不在首页:', !currentPath.startsWith('/home'))
    console.log('  - 不在登录页:', currentPath !== '/login')
    console.log('  - 不在注册页:', currentPath !== '/register')

    if (authStore.isLoggedIn && !currentPath.startsWith('/home') && currentPath !== '/login' && currentPath !== '/register') {
      console.log('✅ 满足检查条件，开始检查 token')
      try {
        // 尝试调用一个轻量级接口检查 token 是否有效
        console.log('调用 authStore.checkAuth()...')
        const isValid = await authStore.checkAuth()
        console.log('checkAuth 结果:', isValid)
        if (!isValid) {
          console.log('❌ Token 已失效，将由 HTTP 拦截器处理跳转')
          // HTTP 拦截器会处理 401 错误并跳转，这里不需要重复处理
        } else {
          console.log('✅ Token 仍然有效')
        }
      } catch (error) {
        console.error('❌ Token 检查失败:', error)
        // HTTP 拦截器会处理 401 错误
      }
    } else {
      console.log('⏭️ 不满足检查条件，跳过此次检查')
    }
    console.log('=== Token 定时检查结束 ===\n')
  }, 5 * 60 * 1000) // 5分钟

  console.log('定时器ID:', tokenCheckInterval)
  console.log('=== App.vue: onMounted 完成 ===')
})

onUnmounted(() => {
  console.log('=== App.vue: onUnmounted 被调用 ===')
  // 清除定时器
  if (tokenCheckInterval) {
    console.log('清除定时器 ID:', tokenCheckInterval)
    clearInterval(tokenCheckInterval)
    tokenCheckInterval = null
  } else {
    console.log('没有定时器需要清除')
  }
  console.log('=== App.vue: onUnmounted 完成 ===')
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

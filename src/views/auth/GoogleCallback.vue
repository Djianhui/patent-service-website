<template>
  <div class="callback-container">
    <div class="callback-content">
      <el-spin size="large" />
      <p class="callback-text">{{ $t('auth.processingGoogleLogin') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const processing = ref(true)

onMounted(async () => {
  try {
    // 获取URL参数
    const code = route.query.code as string
    const state = route.query.state as string
    const error = route.query.error as string

    // 检查是否有错误
    if (error) {
      throw new Error(error)
    }

    // 验证state参数
    const savedState = sessionStorage.getItem('google_oauth_state')
    if (!state || state !== savedState) {
      throw new Error('Invalid state parameter')
    }

    // 清除保存的state
    sessionStorage.removeItem('google_oauth_state')

    // 检查是否有授权码
    if (!code) {
      throw new Error('Missing authorization code')
    }

    console.log('获取到Google授权码:', code)

    // 调用后端API进行验证和登录
    await authStore.googleLogin({ code })

    ElMessage.success(t('auth.googleLoginSuccess'))

    // 登录成功后跳转到仪表板
    const redirectPath = (route.query.redirect as string) || '/app/dashboard'
    router.push(redirectPath)
  } catch (error: any) {
    console.error('Google登录处理失败:', error)
    ElMessage.error(error.message || t('auth.googleLoginFailed'))

    // 失败后跳转回登录页面
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } finally {
    processing.value = false
  }
})
</script>

<style scoped lang="scss">
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.callback-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.callback-text {
  margin-top: 20px;
  font-size: 16px;
  color: #606266;
}
</style>

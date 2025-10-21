<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo">
          <img src="/favicon.ico" alt="Logo" class="logo-icon" />
          <span class="logo-text">{{ $t('auth.loginTitle') }}</span>
        </div>
        <div class="language-selector">
          <el-dropdown @command="handleLanguageChange">
            <el-button class="language-button" text>
              {{ currentLocaleName }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="lang in SUPPORT_LOCALES" :key="lang" :command="lang"
                  :disabled="currentLocale === lang">
                  {{ getLocaleDisplayText(lang) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <h2 class="login-title">{{ $t('auth.userLogin') }}</h2>
        <p class="login-subtitle">{{ $t('auth.loginPrompt') }}</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form"
        @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :prefix-icon="User"
            :placeholder="$t('auth.pleaseEnterUsernameOrPhone')" size="large" clearable @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" :prefix-icon="Lock"
            :placeholder="$t('auth.pleaseEnterPassword')" size="large" show-password clearable />
        </el-form-item>

        <el-form-item prop="code">
          <div class="captcha-container">
            <el-input v-model="loginForm.code" :prefix-icon="CircleCheck" :placeholder="$t('auth.pleaseEnterCaptcha')"
              size="large" clearable @keyup.enter="handleLogin" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaImg" :src="captchaImg" alt="验证码" />
              <span v-else>{{ $t('auth.getCaptcha') }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="login-button">
            {{ loading ? $t('auth.loginLoading') : $t('auth.loginButton') }}
          </el-button>
        </el-form-item>

        <div class="register-link">
          <span>{{ $t('auth.noAccountPrompt') }}</span>
          <el-link type="primary" @click="$router.push('/register')">
            {{ $t('auth.goToRegister') }}
          </el-link>
        </div>
      </el-form>
    </div>

    <div class="login-background">
      <div class="background-content">
        <h3>{{ $t('auth.professionalPlatform') }}</h3>
        <p>{{ $t('auth.oneStopService') }}</p>
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <Search />
            </div>
            <div class="feature-text">
              <h4>{{ $t('auth.smartSearch') }}</h4>
              <p>{{ $t('auth.smartSearchDesc') }}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <DataAnalysis />
            </div>
            <div class="feature-text">
              <h4>{{ $t('menu.threeAnalysis') }}</h4>
              <p>{{ $t('auth.threeAnalysisDesc') }}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <Edit />
            </div>
            <div class="feature-text">
              <h4>{{ $t('menu.patentDraft') }}</h4>
              <p>{{ $t('auth.patentDraftDesc') }}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <Document />
            </div>
            <div class="feature-text">
              <h4>{{ $t('menu.techReport') }}</h4>
              <p>{{ $t('auth.techReportDesc') }}</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <ChatDotSquare />
            </div>
            <div class="feature-text">
              <h4>{{ $t('menu.defenseSupport') }}</h4>
              <p>{{ $t('auth.defenseSupportDesc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  User,
  Lock,
  CircleCheck,
  Search,
  DataAnalysis,
  Edit,
  Document,
  ChatDotSquare,
  ArrowDown
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { validateEmail } from '@/utils'
import { useI18n } from 'vue-i18n'
import { setLocale, type SupportLocale, getLocaleName, SUPPORT_LOCALES } from '@/i18n'

// Composables
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { locale } = useI18n()

// 计算属性
const currentLocale = computed(() => locale.value)
const currentLocaleName = computed(() => getLocaleDisplayText(currentLocale.value))

// 响应式数据
const loading = ref(false)
const captchaImg = ref('')
const captchaUuid = ref('')
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  remember: false
})

// 自定义验证器
const validateCode = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'))
  } else {
    callback()
  }
}

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: validateCode, trigger: 'blur' }
  ]
}

// 方法
const getCaptcha = async () => {
  try {
    const response = await authStore.getCaptcha()
    captchaImg.value = response.img
    captchaUuid.value = response.uuid
  } catch (error: any) {
    ElMessage.error(error.message || '获取验证码失败')
  }
}

const refreshCaptcha = () => {
  getCaptcha()
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
  } catch (error) {
    return
  }

  if (!captchaUuid.value) {
    ElMessage.error('请先获取验证码')
    return
  }

  loading.value = true

  try {
    console.log('开始登录，用户名:', loginForm.username)

    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      code: loginForm.code,
      uuid: captchaUuid.value,
      remember: loginForm.remember
    })

    console.log('登录成功')
    ElMessage.success('登录成功')

    // 获取重定向路径
    const redirectPath = (route.query.redirect as string) || '/app/dashboard'
    console.log('准备跳转到:', redirectPath)
    router.push(redirectPath)
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMessage = error.message || '登录失败，请检查用户名和密码'
    ElMessage.error(errorMessage)
    // 登录失败后刷新验证码
    refreshCaptcha()
    loginForm.code = ''
  } finally {
    loading.value = false
  }
}

const handleLanguageChange = (lang: string) => {
  setLocale(lang as SupportLocale)
}

const getLocaleDisplayText = (lang: string) => {
  return getLocaleName(lang as SupportLocale)
}

// 生命周期
onMounted(async () => {
  // 获取验证码
  await getCaptcha()

  // 如果已经登录，直接跳转到主页
  if (authStore.isLoggedIn) {
    router.push('/app/dashboard')
  }
})
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  background-color: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-wrapper {
  flex: 1;
  max-width: 480px;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 32px 24px;
    box-shadow: none;
  }
}

.login-header {
  text-align: left;
  margin-bottom: 40px;

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;

    .logo-icon {
      width: 36px;
      height: 36px;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #2c3e50;
    }
  }

  .language-selector {
    position: absolute;
    top: 24px;
    right: 24px;

    .language-button {
      font-size: 14px;
      color: #6c757d;
      padding: 8px 12px;
      border-radius: 6px;

      &:hover {
        color: #2c3e50;
        background-color: #f1f3f4;
      }
    }
  }

  .login-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
    line-height: 1.3;
  }

  .login-subtitle {
    color: #6c757d;
    font-size: 16px;
    line-height: 1.5;
  }
}

.login-form {
  .captcha-container {
    display: flex;
    gap: 12px;
    width: 100%;

    .el-input {
      flex: 1;
    }

    .captcha-image {
      width: 120px;
      height: 48px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      span {
        font-size: 13px;
        color: #6c757d;
        padding: 0 8px;
        text-align: center;
      }
    }
  }

  .login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background-color: #3b82f6;
    border-color: #3b82f6;
    margin-top: 8px;

    &:hover {
      background-color: #2563eb;
      border-color: #2563eb;
    }

    &:active {
      background-color: #1d4ed8;
      border-color: #1d4ed8;
    }
  }

  .register-link {
    text-align: center;
    color: #6c757d;
    font-size: 15px;
    margin-top: 24px;

    span {
      margin-right: 8px;
    }

    :deep(.el-link) {
      font-weight: 500;
      font-size: 15px;
    }
  }
}

.login-background {
  flex: 1;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  padding: 40px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  @media (max-width: 768px) {
    display: none;
  }

  .background-content {
    text-align: left;
    z-index: 1;
    max-width: 500px;

    h3 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    p {
      font-size: 18px;
      margin-bottom: 40px;
      opacity: 0.9;
      line-height: 1.6;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .feature-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .el-icon {
            font-size: 24px;
          }
        }

        .feature-text {
          flex: 1;

          h4 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 6px;
            color: white;
          }

          p {
            font-size: 14px;
            margin: 0;
            opacity: 0.85;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    .login-wrapper {
      min-height: 100vh;
    }

    .captcha-container {
      .captcha-image {
        width: 100px !important;
      }
    }
  }
}
</style>

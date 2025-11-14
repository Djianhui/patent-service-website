<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <!-- <div class="logo-icon">
            <el-icon :size="40">
              <DataAnalysis />
            </el-icon>
          </div> -->
          <h1 class="brand-name" @click="$router.push('/')" style="cursor: pointer;">{{ $t('auth.loginTitle') }}</h1>
        </div>
        <p class="welcome-text">{{ $t('auth.loginPrompt') }}</p>
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
        <!--
        <div class="divider">
          <span class="divider-text">{{ $t('auth.or') }}</span>
        </div>

        <el-button size="large" class="google-login-button" @click="handleGoogleLogin">
          <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4"
                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853"
                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05"
                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335"
                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
          </svg>
          {{ $t('auth.googleLogin') }}
        </el-button> -->

        <div class="register-link">
          <span>{{ $t('auth.noAccountPrompt') }}</span>
          <el-link type="primary" @click="$router.push('/register')">
            {{ $t('auth.goToRegister') }}
          </el-link>
        </div>
      </el-form>
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
const { locale, t } = useI18n()

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
    callback(new Error(t('auth.pleaseEnterCaptchaCode')))
  } else {
    callback()
  }
}

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: t('auth.pleaseEnterUsernameOrEmail'), trigger: 'blur' },
    { min: 3, message: t('auth.usernameMinLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.pleaseEnterPassword'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('auth.captchaRequired'), trigger: 'blur' },
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
    ElMessage.error(error.message || t('auth.getCaptchaFailed'))
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
    ElMessage.error(t('auth.pleaseGetCaptcha'))
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
    ElMessage.success(t('auth.loginSuccess'))

    // 获取重定向路径
    const redirectPath = (route.query.redirect as string) || '/app/dashboard'
    console.log('准备跳转到:', redirectPath)
    router.push(redirectPath)
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMessage = error.message || t('auth.loginFailed')
    ElMessage.error(errorMessage)
    // 登录失败后刷新验证码
    refreshCaptcha()
    loginForm.code = ''
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    console.log('开始Google登录流程');

    // 先调用后端接口获取Google OAuth配置
    loading.value = true;
    console.log('调用后端接口获取Google OAuth配置');

    // 调用后端接口获取Google OAuth配置
    const response = await authStore.getGoogleOAuthConfig();

    // 使用后端返回的配置
    const clientId = response.clientId;
    const redirectUri = encodeURIComponent(response.redirectUri);
    const scope = encodeURIComponent('openid email profile');
    const state = Math.random().toString(36).substring(2, 15);

    console.log('从后端获取的配置:', { clientId, redirectUri, scope, state });

    // 保存state到sessionStorage用于验证
    sessionStorage.setItem('google_oauth_state', state);

    // 构建授权URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `state=${state}&` +
      `prompt=consent`;

    console.log('构建的授权URL:', authUrl);

    // 重定向到Google授权页面
    console.log('重定向前的window.location:', window.location.href);
    window.location.href = authUrl;


    // authStore.googleLogin({ code: "123456" })
    console.log('重定向命令已执行');
  } catch (error: any) {
    console.error('Google登录失败:', error);
    ElMessage.error(error.message || t('auth.googleLoginFailed'));
  } finally {
    loading.value = false;
  }
}

const handleLanguageChange = (lang: string) => {
  setLocale(lang as SupportLocale)
}

const getLocaleDisplayText = (lang: string) => {
  return getLocaleName(lang as SupportLocale)
}

// 获取国旗代码
const getFlagCode = (lang: string) => {
  const codeMap: Record<string, string> = {
    'zh-CN': 'cn',
    'en-US': 'us',
    'ja-JP': 'jp',
    'de-DE': 'de',
    'fr-FR': 'fr',
    'ru-RU': 'ru',
    'ar-SA': 'sa',
  }
  return codeMap[lang] || 'us'
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
  padding: 20px;
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 40px 24px;
    border-radius: 16px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .logo-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 8px 24px rgba(15, 76, 129, 0.25);
    }

    .brand-name {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
      letter-spacing: 0.5px;
    }
  }

  .welcome-text {
    font-size: 15px;
    color: #666;
    margin: 0;
    line-height: 1.6;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    height: 52px;
    border-radius: 12px;
    box-shadow: 0 0 0 1px #e5e7eb;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 0 0 1px #0F4C81;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px #0F4C81 !important;
    }
  }

  :deep(.el-input__prefix) {
    font-size: 18px;
    color: #999;
  }

  :deep(.el-input__inner) {
    font-size: 15px;

    &::placeholder {
      color: #aaa;
    }
  }

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
      border-radius: 12px;
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f9fafb;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        border-color: #0F4C81;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(15, 76, 129, 0.15);
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
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    border: none;
    margin-top: 12px;
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.25);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(15, 76, 129, 0.35);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 28px 0;

    .divider-text {
      font-size: 13px;
      color: #999;
      padding: 0 16px;
      background: #fff;
      white-space: nowrap;
    }

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }
  }

  .google-login-button {
    width: 100%;
    height: 52px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 12px;
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;

    &:hover {
      background: #f8f9fa;
      border-color: #d1d5db;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }
  }

  .register-link {
    text-align: center;
    margin-top: 28px;
    font-size: 14px;
    color: #666;

    span {
      margin-right: 6px;
    }

    :deep(.el-link) {
      font-weight: 600;
      font-size: 14px;
      color: #0F4C81;

      &:hover {
        color: #6A5ACD;
      }
    }
  }
}

// 响应式设计
@media (max-width: 640px) {
  .login-card {
    .login-header {
      .logo-section {
        .logo-icon {
          width: 64px;
          height: 64px;
        }

        .brand-name {
          font-size: 24px;
        }
      }

      .welcome-text {
        font-size: 14px;
      }
    }
  }

  .login-form {
    .captcha-container {
      .captcha-image {
        width: 100px;
      }
    }
  }
}
</style>

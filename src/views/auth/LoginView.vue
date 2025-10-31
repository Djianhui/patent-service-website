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
              <span :class="`fi fi-${getFlagCode(currentLocale)}`" class="flag-icon-round"></span>
              {{ currentLocaleName }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="lang in SUPPORT_LOCALES" :key="lang" :command="lang"
                  :disabled="currentLocale === lang">
                  <span :class="`fi fi-${getFlagCode(lang)}`" class="flag-icon-round"></span>
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

        <div class="divider">
          <span class="divider-text">{{ $t('auth.or') }}</span>
        </div>

        <el-form-item>
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
      color: #1a1a1a;
    }
  }

  .language-selector {
    position: absolute;
    top: 24px;
    right: 24px;

    .language-button {
      font-size: 14px;
      color: #666;
      padding: 8px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        color: #1a1a1a;
        background-color: #f8f9fa;
      }
    }

    .flag-icon-round {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      background-size: cover;
      background-position: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    :deep(.el-dropdown-menu__item) {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
    }
  }

  .login-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
    line-height: 1.3;
  }

  .login-subtitle {
    color: #666;
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
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.1);
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
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    margin-top: 8px;

    &:hover {
      background: linear-gradient(135deg, #5568d3 0%, #6a4093 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .divider {
    display: flex;
    justify-content: center;
    margin: 24px 0;
    position: relative;

    .divider-text {
      font-size: 14px;
      color: #666;
      padding: 0 16px;
      background-color: #ffffff;
      position: relative;
      z-index: 1;
    }

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #d1d5db;
      z-index: 0;
    }
  }

  .google-login-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background-color: #f8f9fa;
      border-color: #e5e7eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &:active {
      transform: translateY(0);
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }
  }

  .register-link {
    text-align: center;
    color: #666;
    font-size: 15px;
    margin-top: 24px;

    span {
      margin-right: 8px;
    }

    :deep(.el-link) {
      font-weight: 500;
      font-size: 15px;
      color: #667eea;

      &:hover {
        color: #764ba2;
      }
    }
  }
}

.login-background {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
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

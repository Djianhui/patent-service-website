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

        <!-- 默认账号提示 -->
        <!-- <div class="default-account-hint">
          <el-alert title="测试账号" type="info" :closable="false" show-icon>
            <template #default>
              <div class="account-info">
                <p>用户名：admin</p>
                <p>密码：admin123</p>
                <el-button size="small" type="primary" plain @click="quickLogin">
                  一键登录
                </el-button>
              </div>
            </template>
</el-alert>
</div> -->

        <!-- <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.remember">
              {{ $t('auth.rememberMe') }}
            </el-checkbox>
            <el-link type="primary" @click="$router.push('/forgot-password')">
              {{ $t('auth.forgotPassword') }}
            </el-link>
          </div>
        </el-form-item> -->

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="login-button">
            {{ loading ? $t('auth.loginLoading') : $t('auth.loginButton') }}
          </el-button>
        </el-form-item>

        <!-- <el-divider>
          <span class="divider-text">其他登录方式</span>
        </el-divider>

        <div class="social-login">
          <el-button circle :icon="Platform" @click="handleSocialLogin('wechat')" />
          <el-button circle :icon="Platform" @click="handleSocialLogin('qq')" />
          <el-button circle :icon="ChromeFilled" @click="handleSocialLogin('google')" />
        </div> -->

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
            <el-icon>
              <Search />
            </el-icon>
            <span>{{ $t('auth.smartSearch') }}</span>
          </div>
          <div class="feature-item">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            <span>{{ $t('menu.threeAnalysis') }}</span>
          </div>
          <div class="feature-item">
            <el-icon>
              <Edit />
            </el-icon>
            <span>{{ $t('menu.patentDraft') }}</span>
          </div>
          <div class="feature-item">
            <el-icon>
              <Edit />
            </el-icon>
            <span>{{ $t('menu.techReport') }}</span>
          </div>
          <div class="feature-item">
            <el-icon>
              <ChatDotSquare />
            </el-icon>
            <span>{{ $t('menu.defenseSupport') }}</span>
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
  Platform,
  ChromeFilled,
  Search,
  DataAnalysis,
  Edit,
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

const handleSocialLogin = (type: string) => {
  ElMessage.info(`${type}登录功能开发中...`)
}

const quickLogin = () => {
  loginForm.username = 'admin'
  loginForm.password = 'admin123'
  handleLogin()
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
  position: relative;
  overflow: hidden;
}

.login-wrapper {
  flex: 1;
  max-width: 480px;
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--color-bg-primary);
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: var(--spacing-lg);
  }
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);

    .logo-icon {
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
    }
  }

  .language-selector {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);

    .language-button {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-primary);
      }
    }
  }

  .login-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .login-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
}

.login-form {
  .captcha-container {
    display: flex;
    gap: var(--spacing-sm);
    width: 100%;

    .el-input {
      flex: 1;
    }

    .captcha-image {
      width: 120px;
      height: 40px;
      border: 1px solid var(--el-border-color);
      border-radius: var(--border-radius-base);
      cursor: pointer;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-secondary);
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      span {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        padding: 0 var(--spacing-xs);
        text-align: center;
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .login-button {
    width: 100%;
    height: 48px;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
  }

  .divider-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    .el-button {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }
  }

  .register-link {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);

    span {
      margin-right: var(--spacing-xs);
    }
  }

  .default-account-hint {
    margin-bottom: var(--spacing-lg);

    .account-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      p {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-text-regular);
      }

      .el-button {
        margin-top: var(--spacing-sm);
        align-self: flex-start;
      }
    }
  }
}

.login-background {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #40a9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    display: none;
  }

  .background-content {
    text-align: center;
    z-index: 1;
    max-width: 400px;
    padding: var(--spacing-xl);

    h3 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-md);
    }

    p {
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-2xl);
      opacity: 0.9;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);

      .feature-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius-base);
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 20px;
        }

        span {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
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

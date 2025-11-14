<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-section">
          <!-- <div class="logo-icon">
            <el-icon :size="40">
              <DataAnalysis />
            </el-icon>
          </div> -->
          <h1 class="brand-name" @click="$router.push('/')" style="cursor: pointer;">{{ $t('auth.loginTitle') }}</h1>
        </div>
        <p class="welcome-text">{{ $t('auth.registerPrompt') }}</p>
      </div>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form"
        @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" :prefix-icon="User" :placeholder="$t('auth.pleaseEnterUsername')"
            size="large" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" :prefix-icon="Lock"
            :placeholder="$t('auth.setPassword')" size="large" show-password clearable />
        </el-form-item>

        <el-form-item prop="code">
          <div class="captcha-container">
            <el-input v-model="registerForm.code" :prefix-icon="CircleCheck"
              :placeholder="$t('auth.pleaseEnterCaptcha')" size="large" clearable @keyup.enter="handleRegister" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaImg" :src="captchaImg" alt="验证码" />
              <span v-else>{{ $t('auth.getCaptcha') }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 密码强度指示器 -->
        <div class="password-strength" v-if="registerForm.password">
          <div class="strength-label">{{ $t('auth.passwordStrength') }}</div>
          <div class="strength-bar">
            <div class="strength-fill" :class="`strength-${passwordStrength.level}`"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"></div>
          </div>
          <div class="strength-text">{{ getStrengthText(passwordStrength.level) }}</div>
        </div>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleRegister" class="register-button">
            {{ loading ? $t('auth.registering') : $t('auth.registerButton') }}
          </el-button>
        </el-form-item>

        <div class="login-link">
          <span>{{ $t('auth.hasAccountPrompt') }}</span>
          <el-link type="primary" @click="$router.push('/login')">
            {{ $t('auth.goToLogin') }}
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
import { validatePasswordStrength } from '@/utils'
import { useI18n } from 'vue-i18n'
import { setLocale, type SupportLocale, getLocaleName, SUPPORT_LOCALES } from '@/i18n'

// Composables
const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

// 响应式数据
const loading = ref(false)
const captchaImg = ref('')
const captchaUuid = ref('')
const registerFormRef = ref<FormInstance>()

const registerForm = reactive({
  username: '',
  password: '',
  code: ''
})

// 计算属性
const passwordStrength = computed(() => {
  return validatePasswordStrength(registerForm.password)
})

const currentLocale = computed(() => locale.value)

const currentLocaleName = computed(() => {
  return getLocaleName(currentLocale.value as SupportLocale)
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
const registerRules: FormRules = {
  username: [
    { required: true, message: t('auth.pleaseEnterUsername'), trigger: 'blur' },
    { min: 3, max: 20, message: t('auth.usernameLength'), trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: t('auth.usernamePattern'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.setPassword'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('auth.captchaRequired'), trigger: 'blur' },
    { validator: validateCode, trigger: 'blur' }
  ]
}

// 方法
const getStrengthText = (level: string) => {
  const texts = {
    weak: t('auth.weak'),
    medium: t('auth.medium'),
    strong: t('auth.strong')
  }
  return texts[level as keyof typeof texts] || t('auth.weak')
}

// 获取验证码
const getCaptcha = async () => {
  try {
    const response = await authStore.getCaptcha()
    captchaImg.value = response.img
    captchaUuid.value = response.uuid
  } catch (error: any) {
    ElMessage.error(error.message || t('auth.getCaptchaFailed'))
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
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
    await authStore.register({
      username: registerForm.username,
      password: registerForm.password,
      code: registerForm.code,
      uuid: captchaUuid.value
    })

    ElMessage.success(t('auth.registerSuccessMsg'))
    router.push('/login')
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || t('auth.registerFailed'))
    // 注册失败后刷新验证码
    refreshCaptcha()
    registerForm.code = ''
  } finally {
    loading.value = false
  }
}

const getLocaleDisplayText = (lang: string) => {
  return getLocaleName(lang as SupportLocale)
}

const handleLanguageChange = (lang: string) => {
  setLocale(lang as SupportLocale)
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
  await getCaptcha()
})
</script>

<style scoped lang="scss">
.register-container {
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

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 32px;

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

.register-form {
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    font-size: 13px;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 12px;

    .strength-label {
      color: #666;
      min-width: 70px;
      font-weight: 500;
    }

    .strength-bar {
      flex: 1;
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;

      .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 4px;

        &.strength-weak {
          background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
        }

        &.strength-medium {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
        }

        &.strength-strong {
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
        }
      }
    }

    .strength-text {
      min-width: 40px;
      color: #666;
      font-weight: 600;
      font-size: 12px;
    }
  }

  .register-button {
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

  .login-link {
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
  .register-card {
    .register-header {
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

  .register-form {
    .captcha-container {
      .captcha-image {
        width: 100px;
      }
    }
  }
}
</style>

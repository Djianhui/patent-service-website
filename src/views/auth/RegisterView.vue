<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-header">
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
        <h2 class="register-title">{{ $t('auth.userRegister') }}</h2>
        <p class="register-subtitle">{{ $t('auth.registerPrompt') }}</p>
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

    <div class="register-background">
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
    callback(new Error('请输入验证码'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
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
    ElMessage.error(error.message || '获取验证码失败')
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
    ElMessage.error('请先获取验证码')
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

    ElMessage.success('注册成功！请登录您的账户')
    router.push('/login')
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
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
  background-color: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.register-wrapper {
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

.register-header {
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

  .register-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
    line-height: 1.3;
  }

  .register-subtitle {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
  }
}

.register-form {
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    font-size: 13px;

    .strength-label {
      color: #666;
      min-width: 70px;
    }

    .strength-bar {
      flex: 1;
      height: 6px;
      background-color: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;

      .strength-fill {
        height: 100%;
        transition: all 0.3s ease;

        &.strength-weak {
          background-color: #ef4444;
        }

        &.strength-medium {
          background-color: #f59e0b;
        }

        &.strength-strong {
          background-color: #10b981;
        }
      }
    }

    .strength-text {
      min-width: 40px;
      color: #666;
      font-weight: 500;
    }
  }

  .register-button {
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

  .login-link {
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

.register-background {
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
  .register-container {
    .register-wrapper {
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

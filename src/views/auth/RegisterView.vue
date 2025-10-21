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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  User,
  Lock,
  CircleCheck,
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

// 页面加载时获取验证码
const init = async () => {
  await getCaptcha()
}

init()

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

const currentLocale = computed(() => locale.value)

const currentLocaleName = computed(() => {
  return getLocaleName(currentLocale.value as SupportLocale)
})

const getLocaleDisplayText = (lang: string) => {
  return getLocaleName(lang as SupportLocale)
}

const handleLanguageChange = (lang: string) => {
  setLocale(lang as SupportLocale)
}

</script>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #40a9ff 100%);
}

.register-wrapper {
  width: 100%;
  max-width: 480px;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    max-width: 100%;
    padding: var(--spacing-lg);
    border-radius: 0;
  }
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

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
    }
  }

  .register-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  .register-subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
}

.register-form {
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

  .password-strength {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-xs);

    .strength-label {
      color: var(--color-text-secondary);
      min-width: 60px;
    }

    .strength-bar {
      flex: 1;
      height: 6px;
      background-color: var(--color-bg-tertiary);
      border-radius: 3px;
      overflow: hidden;

      .strength-fill {
        height: 100%;
        transition: all var(--transition-base);

        &.strength-weak {
          background-color: var(--color-error);
        }

        &.strength-medium {
          background-color: var(--color-warning);
        }

        &.strength-strong {
          background-color: var(--color-success);
        }
      }
    }

    .strength-text {
      min-width: 30px;
      color: var(--color-text-secondary);
    }
  }

  .register-button {
    width: 100%;
    height: 48px;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
  }

  .login-link {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-md);

    span {
      margin-right: var(--spacing-xs);
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

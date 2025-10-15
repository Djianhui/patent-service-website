<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-header">
        <div class="logo">
          <el-icon class="logo-icon">
            <Document />
          </el-icon>
          <span class="logo-text">专利服务平台</span>
        </div>
        <h2 class="register-title">用户注册</h2>
        <p class="register-subtitle">创建您的账户，开始使用专利服务</p>
      </div>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form"
        @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" :prefix-icon="User" placeholder="请输入用户名" size="large" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" :prefix-icon="Lock" placeholder="请设置密码" size="large"
            show-password clearable />
        </el-form-item>

        <el-form-item prop="code">
          <div class="captcha-container">
            <el-input v-model="registerForm.code" :prefix-icon="CircleCheck" placeholder="请输入验证码" size="large" clearable
              @keyup.enter="handleRegister" />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaImg" :src="captchaImg" alt="验证码" />
              <span v-else>获取验证码</span>
            </div>
          </div>
        </el-form-item>

        <!-- 密码强度指示器 -->
        <div class="password-strength" v-if="registerForm.password">
          <div class="strength-label">密码强度：</div>
          <div class="strength-bar">
            <div class="strength-fill" :class="`strength-${passwordStrength.level}`"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"></div>
          </div>
          <div class="strength-text">{{ getStrengthText(passwordStrength.level) }}</div>
        </div>

        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleRegister" class="register-button">
            {{ loading ? '注册中...' : '注册账户' }}
          </el-button>
        </el-form-item>

        <div class="login-link">
          <span>已有账户？</span>
          <el-link type="primary" @click="$router.push('/login')">
            立即登录
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
  Document,
  User,
  Lock,
  CircleCheck
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { validatePasswordStrength } from '@/utils'

// Composables
const router = useRouter()
const authStore = useAuthStore()

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
    weak: '弱',
    medium: '中等',
    strong: '强'
  }
  return texts[level as keyof typeof texts] || '弱'
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
      font-size: 32px;
      color: var(--color-primary);
    }

    .logo-text {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
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

<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-header">
        <div class="logo">
          <el-icon class="logo-icon"><Document /></el-icon>
          <span class="logo-text">专利服务平台</span>
        </div>
        <h2 class="register-title">用户注册</h2>
        <p class="register-subtitle">创建您的账户，开始使用专利服务</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            :prefix-icon="Message"
            placeholder="请输入邮箱地址"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            :prefix-icon="Phone"
            placeholder="请输入手机号码（可选）"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            :prefix-icon="Lock"
            placeholder="请设置密码"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            :prefix-icon="Lock"
            placeholder="请确认密码"
            size="large"
            show-password
            clearable
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <!-- 密码强度指示器 -->
        <div class="password-strength" v-if="registerForm.password">
          <div class="strength-label">密码强度：</div>
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="`strength-${passwordStrength.level}`"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
            ></div>
          </div>
          <div class="strength-text">{{ getStrengthText(passwordStrength.level) }}</div>
        </div>

        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" @click="showTerms = true">《用户协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy = true">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
            class="register-button"
          >
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

    <div class="register-background">
      <div class="background-content">
        <h3>加入我们</h3>
        <p>开启您的专利服务之旅</p>
        <div class="benefits">
          <div class="benefit-item">
            <el-icon><Checked /></el-icon>
            <span>免费技术方案分析</span>
          </div>
          <div class="benefit-item">
            <el-icon><Checked /></el-icon>
            <span>专业专利检索服务</span>
          </div>
          <div class="benefit-item">
            <el-icon><Checked /></el-icon>
            <span>智能三性分析工具</span>
          </div>
          <div class="benefit-item">
            <el-icon><Checked /></el-icon>
            <span>专利撰写辅助系统</span>
          </div>
          <div class="benefit-item">
            <el-icon><Checked /></el-icon>
            <span>答辩支持和策略指导</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog v-model="showTerms" title="用户协议" width="80%" max-width="600px">
      <div class="terms-content">
        <h4>1. 服务条款</h4>
        <p>欢迎使用专利服务平台。请仔细阅读以下条款...</p>
        <!-- 这里放置完整的用户协议内容 -->
      </div>
      <template #footer>
        <el-button @click="showTerms = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog v-model="showPrivacy" title="隐私政策" width="80%" max-width="600px">
      <div class="privacy-content">
        <h4>隐私保护承诺</h4>
        <p>我们重视您的隐私保护...</p>
        <!-- 这里放置完整的隐私政策内容 -->
      </div>
      <template #footer>
        <el-button @click="showPrivacy = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  Document, 
  User, 
  Message, 
  Phone, 
  Lock, 
  Checked 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, validatePhone, validatePasswordStrength } from '@/utils'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)
const registerFormRef = ref<FormInstance>()

const registerForm = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 计算属性
const passwordStrength = computed(() => {
  return validatePasswordStrength(registerForm.password)
})

// 自定义验证器
const validatePasswordMatch = (rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请同意用户协议和隐私政策'))
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
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  phone: [
    { validator: (rule, value, callback) => {
      if (value && !validatePhone(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      const strength = validatePasswordStrength(value)
      if (strength.level === 'weak') {
        callback(new Error('密码强度太弱，请设置更复杂的密码'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePasswordMatch, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
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

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
  } catch (error) {
    return
  }

  loading.value = true

  try {
    await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      phone: registerForm.phone,
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    })

    ElMessage.success('注册成功！请登录您的账户')
    router.push('/login')
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
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
}

.register-wrapper {
  flex: 1;
  max-width: 520px;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--color-bg-primary);
  position: relative;
  z-index: 2;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: var(--spacing-lg);
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

.register-background {
  flex: 1;
  background: linear-gradient(135deg, #52c41a 0%, #95de64 100%);
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
    background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"dots\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><circle cx=\"10\" cy=\"10\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23dots)\"/></svg>');
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

    .benefits {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .benefit-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius-base);
        backdrop-filter: blur(10px);

        .el-icon {
          color: #95de64;
          font-size: 16px;
        }

        span {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }
      }
    }
  }
}

.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-md);

  h4 {
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-md);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .register-container {
    .register-wrapper {
      min-height: 100vh;
    }
  }
}
</style>
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'
import { storage } from '@/utils'
import type { User, AuthState } from '@/types'
import { notificationService } from '@/services/notification'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(storage.get('token'))
  const user = ref<User | null>(storage.get('user'))
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role)
  const userName = computed(() => user.value?.username)

  // Actions
  const login = async (credentials: {
    username: string
    password: string
    code: string
    uuid: string
    remember?: boolean
  }) => {
    loading.value = true
    try {
      console.log('=== Store: 开始登录 ===')
      const response = await authService.login(credentials)

      console.log('=== Store: 登录响应 ===')
      console.log('Token:', response.token.substring(0, 30) + '...')
      console.log('Token长度:', response.token.length)
      console.log('用户信息:', response.user)

      // 保存token和用户信息
      token.value = response.token
      user.value = response.user

      // 持久化存储
      storage.set('token', response.token)
      storage.set('user', response.user)

      console.log('=== Store: 保存到localStorage ===')
      console.log('localStorage.token:', localStorage.getItem('token')?.substring(0, 30) + '...')
      console.log('localStorage.user:', localStorage.getItem('user')?.substring(0, 50) + '...')

      // 如果选择记住我，设置较长的过期时间
      if (credentials.remember) {
        const expireTime = Date.now() + response.expiresIn * 1000
        storage.set('tokenExpireTime', expireTime)
        console.log('Token过期时间:', new Date(expireTime).toLocaleString())
      }

      // 登录成功后立即获取用户详细信息并建立SSE连接
      console.log('=== Store: 获取用户详细信息并建立SSE连接 ===')
      try {
        const userInfo = await authService.getUserInfo()
        console.log('用户详细信息:', userInfo)

        // 更新用户信息，确保包含userId
        user.value = userInfo
        storage.set('user', userInfo)

        // 建立SSE连接
        if (userInfo.userId) {
          console.log('=== SSE: 开始连接 ===')
          console.log('userId:', userInfo.userId)
          notificationService.connect(userInfo.userId)
          console.log('=== SSE: 连接请求已发送 ===')
        } else {
          console.warn('=== SSE: userId 为空，无法建立SSE连接 ===')
        }
      } catch (error) {
        console.error('=== 获取用户信息或建立SSE连接失败 ===')
        console.error(error)
        // 不抛出错误，不影响登录流程
      }

      console.log('=====================')
      return response
    } catch (error) {
      console.error('=== Store: 登录失败 ===')
      console.error(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: {
    username: string
    password: string
    code: string
    uuid: string
  }) => {
    loading.value = true
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const googleLogin = async (data: { idToken?: string; code?: string }) => {
    loading.value = true
    try {
      const response = await authService.googleLogin(data)

      token.value = response.token
      user.value = response.user

      storage.set('token', response.token)
      storage.set('user', response.user)

      const expireTime = Date.now() + response.expiresIn * 1000
      storage.set('tokenExpireTime', expireTime)

      // 登录成功后立即获取用户详细信息并建立SSE连接
      try {
        const userInfo = await authService.getUserInfo()
        // 更新用户信息，确保包含userId
        user.value = userInfo
        storage.set('user', userInfo)

        // 建立SSE连接
        if (userInfo.userId) {
          notificationService.connect(userInfo.userId)
        }
      } catch (error) {
        console.error('获取用户信息或建立SSE连接失败:', error)
        // 不抛出错误，不影响登录流程
      }

      return response
    } catch (error) {
      console.error('Google登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getCaptcha = async () => {
    try {
      const response = await authService.getCaptcha()
      return response
    } catch (error) {
      console.error('获取验证码失败:', error)
      throw error
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await authService.logout()
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 断开SSE连接
      console.log('=== SSE: 登出时断开连接 ===')
      notificationService.disconnect()

      // 清除本地数据
      token.value = null
      user.value = null
      storage.remove('token')
      storage.remove('user')
      storage.remove('tokenExpireTime')
      loading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken()
      token.value = response.token
      storage.set('token', response.token)

      const expireTime = Date.now() + response.expiresIn * 1000
      storage.set('tokenExpireTime', expireTime)

      return response.token
    } catch (error) {
      console.error('刷新token失败:', error)
      await logout()
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    loading.value = true
    try {
      const updatedUser = await authService.updateProfile(data)
      user.value = updatedUser
      storage.set('user', updatedUser)
      return updatedUser
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
    loading.value = true
    try {
      await authService.changePassword(data)
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      // 检查token是否过期
      const expireTime = storage.get<number>('tokenExpireTime')
      if (expireTime && typeof expireTime === 'number' && Date.now() > expireTime) {
        await refreshToken()
      }

      // 获取最新用户信息
      if (!user.value || !user.value.userId) {
        console.log('=== checkAuth: 获取用户信息 ===')
        const userInfo = await authService.getUserInfo()
        user.value = userInfo
        storage.set('user', userInfo)

        // 如果有userId且SSE未连接，则建立连接
        if (userInfo.userId && !notificationService.isConnected()) {
          console.log('=== checkAuth: 建立SSE连接 ===')
          notificationService.connect(userInfo.userId)
        }
      }

      return true
    } catch (error) {
      console.error('认证检查失败:', error)
      await logout()
      return false
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false

    // 这里可以根据实际的权限系统来实现
    // 暂时简单返回true，实际项目中需要根据用户角色和权限来判断
    return true
  }

  const init = async () => {
    try {
      const savedToken = storage.get<string>('token')
      const savedUser = storage.get<User>('user')

      if (savedToken && savedUser && typeof savedToken === 'string') {
        token.value = savedToken
        user.value = savedUser
      }
    } catch (error) {
      console.error('初始化认证失败:', error)
      // 清除损坏的数据
      storage.remove('token')
      storage.remove('user')
      storage.remove('tokenExpireTime')
    }
  }

  // 获取Google OAuth配置
  const getGoogleOAuthConfig = async () => {
    // 这里可以调用后端接口获取Google OAuth配置
    // 暂时返回默认配置
    return {
      clientId: '122338399225-pbqagfd2n7fmmfmiq005enh04g2k9ofs.apps.googleusercontent.com',
      redirectUri: 'https://patent.langdetech.cn/google-callback',
    }
  }

  return {
    // State
    token,
    user,
    loading,

    // Getters
    isLoggedIn,
    userRole,
    userName,

    // Actions
    login,
    register,
    getCaptcha,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    checkAuth,
    hasPermission,
    googleLogin,
    getGoogleOAuthConfig,
    init,
  }
})

import { request } from './http'
import type { User, AuthState } from '@/types'

export interface LoginRequest {
  username: string
  password: string
  code: string
  uuid: string
  remember?: boolean
}

export interface RegisterRequest {
  username: string
  password: string
  code: string
  uuid: string
}

export interface CaptchaResponse {
  uuid: string
  img: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export const authService = {
  // 用户登录
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('=== 登录请求开始 ===')
      console.log('用户名:', data.username)

      // 调用后端登录接口
      const response = await request.post<any>('/login', {
        username: data.username,
        password: data.password,
        code: data.code,
        uuid: data.uuid,
      })

      console.log('后端返回数据:', response)

      // 检查后端返回的是否成功
      // 后端返回的数据结构: {code: 200, msg: "操作成功", token: "..."}
      if (response.code === 200 && response.token) {
        console.log('Token获取成功:', response.token.substring(0, 30) + '...')
        console.log('Token长度:', response.token.length)

        // 成功情况，返回标准格式
        const loginResponse = {
          token: response.token,
          user: response.user || {
            id: '1',
            username: data.username,
            email: `${data.username}@example.com`,
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          expiresIn: 7200,
        }

        console.log('登录响应数据:', loginResponse)
        console.log('==================')
        return loginResponse
      } else {
        // 失败情况，抛出后端返回的错误信息
        const errorMessage = response.msg || response.message || '登录失败'
        console.error('登录失败:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('=== 登录异常 ===')
      console.error('错误类型:', error.constructor.name)
      console.error('错误信息:', error.message)
      console.error('完整错误:', error)

      // 处理不同类型的错误
      if (error.response && error.response.data) {
        // HTTP 响应错误，获取后端返回的错误信息
        const backendError = error.response.data
        const errorMessage = backendError.msg || backendError.message || '登录失败'
        console.error('后端错误信息:', errorMessage)
        throw new Error(errorMessage)
      } else if (error.message) {
        // 前端处理过程中的错误
        throw new Error(error.message)
      } else {
        // 其他未知错误
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取验证码
  async getCaptcha(): Promise<CaptchaResponse> {
    try {
      const response = await request.get<any>('/captchaImage')

      if (response.code === 200) {
        // 后端返回的img是纯Base64字符串，需要添加前缀才能在img标签中显示
        const imgData = response.img.startsWith('data:')
          ? response.img
          : `data:image/jpeg;base64,${response.img}`

        return {
          uuid: response.uuid,
          img: imgData,
        }
      } else {
        throw new Error(response.msg || '获取验证码失败')
      }
    } catch (error: any) {
      console.error('获取验证码失败:', error)
      throw new Error(error.message || '获取验证码失败，请重试')
    }
  },

  // 用户注册
  async register(data: RegisterRequest): Promise<any> {
    try {
      console.log('=== 注册请求开始 ===')
      console.log('注册数据:', data)

      const response = await request.post<any>('/register', {
        username: data.username,
        password: data.password,
        code: data.code,
        uuid: data.uuid,
      })

      console.log('注册返回数据:', response)

      if (response.code === 200) {
        return response
      } else {
        throw new Error(response.msg || '注册失败')
      }
    } catch (error: any) {
      console.error('注册失败:', error)

      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '注册失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('注册失败，请重试')
      }
    }
  },

  // 刷新Token
  async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'refreshed-jwt-token-' + Date.now(),
          expiresIn: 7200,
        })
      }, 500)
    })
  },

  // 获取用户信息
  async getUserInfo(): Promise<User> {
    try {
      const response = await request.get<any>('/getInfo')

      if (response.code === 200 && response.user) {
        return {
          id: response.user.userId || response.user.id,
          username: response.user.userName || response.user.username,
          email: response.user.email || '',
          role: response.user.role || 'user',
          avatar: response.user.avatar,
          createdAt: response.user.createTime || new Date().toISOString(),
          updatedAt: response.user.updateTime || new Date().toISOString(),
          // 保存原始用户数据，包含userId用于SSE连接
          userId: response.user.userId,
        } as User
      } else {
        throw new Error(response.msg || '获取用户信息失败')
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw new Error(error.message || '获取用户信息失败')
    }
  },

  // 更新用户信息
  async updateProfile(data: Partial<User>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        })
      }, 500)
    })
  },

  // 修改密码
  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },

  // 用户登出
  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },

  // 重置密码
  async resetPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },

  // 验证邮箱
  async verifyEmail(token: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },

  // Google登录
  async googleLogin(data: { idToken?: string; code?: string }): Promise<LoginResponse> {
    try {
      console.log('=== Google登录请求开始 ===')

      let response: any

      // 根据传入的参数类型调用不同的后端接口
      if (data.code) {
        // 为测试添加默认值
        const codeToUse =
          data.code === 'test-default' ? '4/P7q7W91a-oMsCeLvIaQm6bTrgtp7' : data.code
        console.log('使用授权码进行登录:', codeToUse.substring(0, 30) + '...')
        // 调用正确的后端Google登录回调接口

        // 创建 URLSearchParams 对象并添加参数
        const params = new URLSearchParams()
        params.append('code', data.code)

        const encodedCode = encodeURIComponent(data.code)
        response = await request.get<any>(`/google/auth/callback?code=${encodedCode}`)
      } else if (data.idToken) {
        console.log('使用ID Token进行登录:', data.idToken.substring(0, 30) + '...')
        // 调用后端Google登录接口（ID Token流程）- 保持POST请求
        response = await request.post<any>('/google-login', {
          idToken: data.idToken,
        })
      } else {
        throw new Error('Missing Google authentication data')
      }

      console.log('后端返回数据:', response)

      // 检查后端返回的是否成功
      if (response.code === 200 && response.token) {
        console.log('Token获取成功:', response.token.substring(0, 30) + '...')
        console.log('Token长度:', response.token.length)

        // 成功情况，返回标准格式
        const loginResponse = {
          token: response.token,
          user: response.user || {
            id: '1',
            username: response.email?.split('@')[0] || 'google_user',
            email: response.email || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          expiresIn: 7200,
        }

        console.log('Google登录响应数据:', loginResponse)
        console.log('==================')
        return loginResponse
      } else {
        // 失败情况，抛出后端返回的错误信息
        const errorMessage = response.msg || response.message || 'Google登录失败'
        console.error('Google登录失败:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('=== Google登录异常 ===')
      console.error('错误类型:', error.constructor.name)
      console.error('错误信息:', error.message)
      console.error('完整错误:', error)

      // 处理不同类型的错误
      if (error.response && error.response.data) {
        // HTTP 响应错误，获取后端返回的错误信息
        const backendError = error.response.data
        const errorMessage = backendError.msg || backendError.message || 'Google登录失败'
        console.error('后端错误信息:', errorMessage)
        throw new Error(errorMessage)
      } else if (error.message) {
        // 前端处理过程中的错误
        throw new Error(error.message)
      } else {
        // 其他未知错误
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },
}

import { request } from './http'
import type { User, AuthState } from '@/types'

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
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
      // 调用后端登录接口
      const response = await request.post<any>('/login', {
        username: data.username,
        password: data.password
      })

      console.log('后端返回数据:', response)

      // 检查后端返回的是否成功
      // 后端返回的数据结构: {code: 200, msg: "操作成功", token: "..."}
      if (response.code === 200 && response.token) {
        // 成功情况，返回标准格式
        return {
          token: response.token,
          user: response.user || {
            id: '1',
            username: data.username,
            email: `${data.username}@example.com`,
            role: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          expiresIn: 7200
        }
      } else {
        // 失败情况，抛出后端返回的错误信息
        const errorMessage = response.msg || response.message || '登录失败'
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('登录失败:', error)

      // 处理不同类型的错误
      if (error.response && error.response.data) {
        // HTTP 响应错误，获取后端返回的错误信息
        const backendError = error.response.data
        const errorMessage = backendError.msg || backendError.message || '登录失败'
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

  // 用户注册
  async register(data: RegisterRequest): Promise<User> {
    // 模拟注册请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '2',
          username: data.username,
          email: data.email,
          phone: data.phone,
          role: 'user' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }, 1000)
    })
  },

  // 刷新Token
  async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'refreshed-jwt-token-' + Date.now(),
          expiresIn: 7200
        })
      }, 500)
    })
  },

  // 获取用户信息
  async getUserInfo(): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }, 500)
    })
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
          ...data
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
  }
}

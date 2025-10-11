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
    // 模拟登录请求
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 支持多个默认账号
        const validAccounts = [
          { username: 'admin', password: '123456', userInfo: { id: '1', username: 'admin', email: 'admin@example.com' } },
          { username: '15211191964', password: '123456', userInfo: { id: '2', username: '15211191964', email: '15211191964@example.com' } }
        ]

        const account = validAccounts.find(acc =>
          acc.username === data.username && acc.password === data.password
        )

        if (account) {
          resolve({
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              ...account.userInfo,
              role: 'admin' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            expiresIn: 7200
          })
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 1000)
    })
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

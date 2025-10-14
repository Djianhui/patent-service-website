import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://patent.langdetech.cn/api',
  timeout: 120000, // 增加超时时间为120秒，因为AI生成报告需要较长时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const tokenStr = localStorage.getItem('token')
    // 如果token是JSON字符串格式（带双引号），需要解析
    let token: string | null = null
    if (tokenStr) {
      try {
        // 尝试解析JSON（如果是通过storage.set存储的）
        token = JSON.parse(tokenStr)
      } catch {
        // 如果不是JSON格式，直接使用原始值
        token = tokenStr
      }
    }

    console.log('=== 请求拦截器调试信息 ===')
    console.log('请求URL:', config.url)
    console.log('请求方法:', config.method?.toUpperCase())
    console.log('localStorage原始值:', tokenStr?.substring(0, 35))
    console.log('Token是否存在:', !!token)

    if (token) {
      console.log('Token长度:', token.length)
      console.log('Token前30字符:', token.substring(0, 30))
      console.log('Token后10字符:', token.substring(token.length - 10))
      // 直接使用token，不添加Bearer前缀（因为后端返回的token可能已包含）
      config.headers.Authorization = token
      console.log('Authorization头已设置:', config.headers.Authorization.substring(0, 50))
    } else {
      console.warn('⚠️ Token不存在，请求可能会失败')
    }

    console.log('请求数据:', config.data)
    console.log('=========================')

    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('=== 响应成功 ===')
    console.log('URL:', response.config.url)
    console.log('状态码:', response.status)
    console.log('响应数据:', response.data)
    console.log('==================')

    // 直接返回响应，让具体的 service 层处理数据格式
    return response
  },
  (error: AxiosError) => {
    console.error('=== 响应错误 ===')
    console.error('错误信息:', error.message)
    console.error('错误代码:', error.code)
    console.error('请求URL:', error.config?.url)

    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response

      console.error('响应状态码:', status)
      console.error('响应数据:', data)
      console.error('响应头:', error.response.headers)

      switch (status) {
        case 401:
          console.error('⚠️ 401认证失败详情:')
          console.error('  - 请求URL:', error.config?.url)
          console.error('  - 请求头Authorization:', error.config?.headers?.Authorization)
          const storedTokenStr = localStorage.getItem('token')
          console.error('  - LocalStorage Token原始值:', storedTokenStr?.substring(0, 35))
          let storedToken: string | null = null
          if (storedTokenStr) {
            try {
              storedToken = JSON.parse(storedTokenStr)
            } catch {
              storedToken = storedTokenStr
            }
          }
          console.error('  - LocalStorage Token存在:', !!storedToken)
          if (storedToken) {
            console.error('  - LocalStorage Token长度:', storedToken.length)
            console.error('  - LocalStorage Token前30字符:', storedToken.substring(0, 30))
          }
          console.error('  - 后端返回消息:', (data as any)?.msg)

          // 未授权，清除token并跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          ElMessage.error('登录已过期，请重新登录')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问此资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          const errorMsg = (data as any)?.message || '请求失败'
          ElMessage.error(errorMsg)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }

    console.error('==================')
    return Promise.reject(error)
  }
)

// 通用请求方法
export const request = {
  get<T = any>(url: string, params?: any): Promise<T> {
    return api.get(url, { params }).then(res => res.data)
  },

  post<T = any>(url: string, data?: any): Promise<T> {
    return api.post(url, data).then(res => res.data)
  },

  put<T = any>(url: string, data?: any): Promise<T> {
    return api.put(url, data).then(res => res.data)
  },

  delete<T = any>(url: string): Promise<T> {
    return api.delete(url).then(res => res.data)
  },

  upload<T = any>(url: string, formData: FormData): Promise<T> {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  }
}

export default api

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 请求加密等处理
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 检查业务状态码
    if (data.success) {
      return response
    } else {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
  },
  (error: AxiosError<ApiResponse>) => {
    console.error('响应错误:', error)
    
    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
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
          ElMessage.error(data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 通用请求方法
export const request = {
  get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return api.get(url, { params }).then(res => res.data)
  },

  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return api.post(url, data).then(res => res.data)
  },

  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return api.put(url, data).then(res => res.data)
  },

  delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return api.delete(url).then(res => res.data)
  },

  upload<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  }
}

export default api
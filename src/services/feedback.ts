import { request } from './http'
import type { ApiResponse } from '@/types'

export interface FeedbackData {
  type: number
  content: string
  contactInformation?: string
}

export interface FeedbackResponse {
  id: string
  message?: string
}

class FeedbackService {
  /**
   * 提交反馈
   * @param feedbackData 反馈数据
   * @returns 反馈响应
   */
  async submitFeedback(feedbackData: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await request.post<ApiResponse<FeedbackResponse>>(
        '/feedback/offer',
        feedbackData,
      )

      // 检查响应状态
      if (response.code === 0 || response.code === 200) {
        return response.data as FeedbackResponse
      } else {
        throw new Error(response.message || '提交反馈失败')
      }
    } catch (error) {
      console.error('反馈服务错误:', error)
      throw error
    }
  }

  /**
   * 获取反馈列表（管理员功能）
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 反馈列表
   */
  async getFeedbackList(page: number = 1, pageSize: number = 10) {
    try {
      const response = await request.get<ApiResponse<any>>('/feedback/list', { page, pageSize })

      if (response.code === 0 || response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message || '获取反馈列表失败')
      }
    } catch (error) {
      console.error('获取反馈列表错误:', error)
      throw error
    }
  }
}

export const feedbackService = new FeedbackService()

import { request } from './http'
import type { TechReport, TechReportContent } from '@/types'

export interface GenerateReportRequest {
  title: string
  inputType: 'text' | 'file'
  inputContent: string
  technicalField?: string
  fileId?: string
}

export const techReportService = {
  // 生成技术方案报告
  async generateReport(data: GenerateReportRequest): Promise<TechReport> {
    const response = await request.post<TechReport>('/tech-report/generate', data)
    return response.data
  },

  // 获取报告列表
  async getReportList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
  }): Promise<{ reports: TechReport[]; total: number }> {
    const response = await request.get<{ reports: TechReport[]; total: number }>('/tech-report/list', params)
    return response.data
  },

  // 获取报告详情
  async getReportDetail(id: string): Promise<TechReport> {
    const response = await request.get<TechReport>(`/tech-report/${id}`)
    return response.data
  },

  // 删除报告
  async deleteReport(id: string): Promise<void> {
    await request.delete(`/tech-report/${id}`)
  },

  // 导出报告
  async exportReport(id: string, format: 'pdf' | 'word' | 'txt' = 'pdf'): Promise<Blob> {
    const response = await request.get(`/tech-report/${id}/export?format=${format}`)
    return response.data
  },

  // 上传文件
  async uploadFile(file: File): Promise<{ fileId: string; filename: string; url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await request.upload<{ fileId: string; filename: string; url: string }>('/files/upload', formData)
    return response.data
  }
}
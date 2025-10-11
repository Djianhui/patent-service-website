import { request } from './http'
import type { TechReport, TechReportContent } from '@/types'
import { ReportStatus } from '@/types'

// 模拟数据
const mockReports: TechReport[] = [
  {
    id: '1',
    title: '反无人机领域发展前景与专利机会分析报告',
    inputType: 'file',
    inputContent: '反无人机技术研究文档，包含最新的行业发展趋势、技术创新点、市场前景分析等内容。',
    reportContent: {
      summary: '本报告重点分析了反无人机技术领域的整体发展状况和未来趋势。随着无人机技术的快速发展，反无人机技术也迎来了重大的发展机遇。报告综合分析了电磁干扰、雷达探测、光学识别等多种反无人机技术路线，并预测了未来市场的发展前景。',
      technicalField: '军用电子与防务技术',
      backgroundTechnology: '随着无人机技术的广泛应用，从民用摄影到军事侦察，无人机已成为现代战场上的重要工具。然而，这也带来了新的安全挑战和威胁。',
      technicalProblem: '传统的防空系统和安全措施难以有效应对小型、低速、低空的无人机威胁，需要开发专门的反无人机技术和装备。',
      technicalSolution: '通过雷达探测、光学识别、电磁干扰等多种技术手段的融合，建立综合性的反无人机防御体系。',
      beneficialEffects: '能够全天候、全方位地探测和对抗各类无人机威胁，有效保护重要设施和区域安全。',
      implementationMethods: [
        '雷达探测技术实现远距离目标识别',
        '光学识别系统实现精确目标识别',
        '电磁干扰装备实现软杀伤拦截',
        '动能武器系统实现硕杀伤拦截'
      ]
    },
    technicalField: '防务技术',
    createTime: '2024-10-09T10:30:00.000Z',
    status: ReportStatus.COMPLETED,
    userId: '1'
  }
]

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
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 根据参数过滤数据
    let filteredReports = [...mockReports]

    // 状态过滤
    if (params?.status) {
      filteredReports = filteredReports.filter(report => report.status === params.status)
    }

    // 关键词过滤
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredReports = filteredReports.filter(report =>
        report.title.toLowerCase().includes(keyword) ||
        report.inputContent.toLowerCase().includes(keyword) ||
        (report.technicalField && report.technicalField.toLowerCase().includes(keyword))
      )
    }

    // 返回模拟数据
    return {
      reports: filteredReports,
      total: filteredReports.length
    }

    // 真实 API 调用（已注释）
    // const response = await request.get<{ reports: TechReport[]; total: number }>('/tech-report/list', params)
    // return response.data
  },

  // 获取报告详情
  async getReportDetail(id: string): Promise<TechReport> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 查找模拟数据
    const report = mockReports.find(r => r.id === id)
    if (!report) {
      throw new Error('报告不存在')
    }

    return report

    // 真实 API 调用（已注释）
    // const response = await request.get<TechReport>(`/tech-report/${id}`)
    // return response.data
  },

  // 删除报告
  async deleteReport(id: string): Promise<void> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 从模拟数据中删除
    const index = mockReports.findIndex(r => r.id === id)
    if (index !== -1) {
      mockReports.splice(index, 1)
    }

    // 真实 API 调用（已注释）
    // await request.delete(`/tech-report/${id}`)
  },

  // 导出报告
  async exportReport(id: string, format: 'pdf' | 'word' | 'txt' = 'pdf'): Promise<Blob> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 查找模拟数据
    const report = mockReports.find(r => r.id === id)
    if (!report) {
      throw new Error('报告不存在')
    }

    // 创建模拟文件内容
    const content = `${report.title}\n\n${report.reportContent?.summary || ''}`
    const blob = new Blob([content], { type: 'text/plain' })

    return blob

    // 真实 API 调用（已注释）
    // const response = await request.get(`/tech-report/${id}/export?format=${format}`)
    // return response.data
  },

  // 上传文件
  async uploadFile(file: File): Promise<{ fileId: string; filename: string; url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await request.upload<{ fileId: string; filename: string; url: string }>('/files/upload', formData)
    return response.data
  }
}

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
  },
  {
    id: '2',
    title: '组装式食用菌种植技术方案报告',
    inputType: 'text',
    inputContent: '基于组装式食用菌种植棚的技术方案，包括组装式设计、模块化结构、空间优化等关键技术。',
    reportContent: {
      summary: '本报告针对传统食用菌种植设备空间利用率低、组装复杂等问题，提出了一种组装式食用菌种植棚的创新设计方案。该方案采用模块化设计理念，实现了结构简化、组装便捷、空间高效利用的目标。',
      technicalField: '农业装备与食用菌种植技术',
      backgroundTechnology: '随着人们对绿色美食和健康饮食的需求不断提高，食用菌市场呈现出快速增长的趋势。然而，传统的食用菌种植方式存在种植效率低、空间利用不充分等问题。',
      technicalProblem: '现有食用菌种植设备存在以下问题：1）空间利用率低，无法满足大规模生产需求；2）组装复杂，需要专业技术人员操作；3）结构不稳定，影响生产效率。',
      technicalSolution: '设计了一种组装式食用菌种植棚，采用模块化设计，包括左右两侧板、上下网格板防护带等组件，通过标准化接头连接，实现快速组装和拆卸。',
      beneficialEffects: '该技术方案具有以下优势：1）显著提高空间利用率，单位面积产量提高30%以上；2）组装简单快捷，普通人员可操作；3）结构稳定可靠，降低维护成本。',
      implementationMethods: [
        '模块化设计：采用标准化模块，实现灵活组合',
        '空间优化：合理设计层间距和支架结构',
        '快速接头：设计专用接头，无需工具组装',
        '材料优化：选用轻重高强复合材料'
      ]
    },
    technicalField: '农业装备',
    createTime: '2024-10-10T14:20:00.000Z',
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

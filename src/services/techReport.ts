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
  prompt: string
  type?: number
}

// 分页查询请求参数
export interface PageQueryRequest {
  keyword?: string        // 搜索关键字
  pageIndex?: number      // 页码，默认1
  pageSize?: number       // 页大小，默认10
  pageSorts?: Array<{     // 排序
    asc: boolean
    column: string
  }>
  state?: number          // 状态（0:未完成 1:已完成 2:失败）
  type: number            // 类型（1:技术报告 2:专利检索 3:三性分析 4:专利撰写 5:答辩支持）
}

// 分页查询响应结果
export interface PageQueryResponse {
  code: number
  data: {
    pageIndex: number
    pageSize: number
    records: Array<{
      createTime: string
      firstImgUrl: string
      id: number
      mdUrl: string
      params: any
      pdfUrl: string
      state: number         // 0:未完成 1:已完成 2:失败
      taskId: string
      taskJson: string
      type: number
      updateTime: string
      userId: number
      wordUrl: string
    }>
    total: number
  }
  msg: string
}

export const techReportService = {
  // 生成技术方案报告
  async generateReport(data: GenerateReportRequest): Promise<any> {
    try {
      const response = await request.post<any>('/manus/task', {
        prompt: data.prompt,
        type: data.type || 1
      })

      console.log('生成报告响应:', response)

      // 检查后端返回结果 - 修改：code=200即为成功，data可以为null
      if (response.code === 200) {
        return {
          success: true,
          message: response.msg || '报告已提交生成，请稍后在历史记录中查看',
          data: response.data || null  // data可能为null，表示异步处理
        }
      } else {
        throw new Error(response.msg || '报告生成失败')
      }
    } catch (error: any) {
      console.error('生成报告失败:', error)

      // 特殊处理超时错误
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        throw new Error('报告生成时间较长，已提交后台处理，请稍后在历史记录中查看结果')
      }

      // 处理401认证错误
      if (error.response && error.response.status === 401) {
        throw new Error('登录已过期，请重新登录')
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '报告生成失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取报告列表（分页查询）
  async getReportList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
  }): Promise<{ reports: TechReport[]; total: number }> {
    try {
      console.log('=== 获取报告列表 ===')
      console.log('请求参数:', params)

      // 构建请求参数
      const requestData: PageQueryRequest = {
        keyword: params?.keyword || '',
        pageIndex: params?.page || 1,
        pageSize: params?.pageSize || 10,
        type: 1  // 1:技术报告
      }

      // 如果有状态筛选
      if (params?.status) {
        // 将前端状态映射到后端状态
        const statusMap: Record<string, number> = {
          'generating': 0,   // 处理中
          'completed': 1,    // 已完成
          'failed': 2        // 失败
        }
        requestData.state = statusMap[params.status]
      }

      console.log('最终请求数据:', requestData)

      // 调用后端接口
      const response = await request.post<PageQueryResponse>('/task/getPage', requestData)

      console.log('后端返回数据:', response)

      if (response.code === 200 && response.data) {
        // 将后端数据转换为前端格式
        const reports: TechReport[] = response.data.records.map(record => {
          // 状态映射
          let status: ReportStatus
          switch (record.state) {
            case 0:
              status = ReportStatus.GENERATING  // 处理中
              break
            case 1:
              status = ReportStatus.COMPLETED   // 已完成
              break
            case 2:
              status = ReportStatus.FAILED      // 失败
              break
            default:
              status = ReportStatus.GENERATING
          }

          // 解析 taskJson 获取标题和输入内容
          let title = '技术方案报告'
          let inputContent = ''
          let technicalField = ''

          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson)
              inputContent = taskData.prompt || ''
              technicalField = taskData.prompt || ''
              title = `${inputContent.substring(0, 20)}技术方案报告`
            }
          } catch (e) {
            console.warn('解析 taskJson 失败:', e)
          }

          return {
            id: String(record.id),
            title,
            inputType: 'text' as const,
            inputContent,
            technicalField,
            createTime: record.createTime,
            status,
            userId: String(record.userId),
            // 报告内容（如果已完成，可从 mdUrl 或 pdfUrl 获取）
            reportContent: {
              summary: '报告已生成，请下载查看完整内容',
              technicalField,
              backgroundTechnology: '',
              technicalProblem: '',
              technicalSolution: '',
              beneficialEffects: '',
              implementationMethods: []
            },
            // 文件链接（添加到类型外，用于下载）
            pdfUrl: record.pdfUrl,
            wordUrl: record.wordUrl,
            mdUrl: record.mdUrl,
            firstImgUrl: record.firstImgUrl
          } as TechReport & {
            pdfUrl?: string
            wordUrl?: string
            mdUrl?: string
            firstImgUrl?: string
          }
        })

        console.log('转换后的报告列表:', reports)

        return {
          reports,
          total: response.data.total
        }
      } else {
        throw new Error(response.msg || '获取报告列表失败')
      }
    } catch (error: any) {
      console.error('=== 获取报告列表失败 ===')
      console.error(error)

      // 处理401认证错误
      if (error.response && error.response.status === 401) {
        throw new Error('登录已过期，请重新登录')
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '获取报告列表失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
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
    return response
  }
}

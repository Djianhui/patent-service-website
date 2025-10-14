import { request } from './http'
import type { PatentDraft, Claim, Drawing, Template, TemplateContent } from '@/types'
import { DraftStatus } from '@/types'
import { convertImageUrl } from '@/utils'

// 分页查询请求参数
export interface PageQueryRequest {
  keyword?: string
  pageIndex?: number
  pageSize?: number
  pageSorts?: Array<{
    asc: boolean
    column: string
  }>
  state?: number
  type: number  // 4: 专利草稿
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
      state: number
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

// 模拟专利草稿数据 - 以组装式食用菌种植棚为例
const mockPatentDrafts: PatentDraft[] = [
  {
    id: '1',
    title: '组装式食用菌种植棚',
    technicalField: '本实用新型涉及农业设施技术领域，具体涉及一种组装式食用菌种植棚。',
    backgroundTechnology: '食用菌种植需要在特定的温度、湿度和光照条件下进行。传统的食用菌种植棚多采用固定式结构，建设成本高，不便于迁移和重复利用。',
    technicalProblem: '现有技术中存在保温性能差、结构不稳定、安装复杂等问题。',
    technicalSolution: '本实用新型提供一种组装式食用菌种植棚，包括底座、立柱、横梁、保温层和顶盖。',
    claims: [
      {
        id: 'claim-1',
        type: 'independent',
        content: '一种组装式食用菌种植棚，其特征在于：包括底座(1)、立柱(2)、横梁(3)、保温层(4)和顶盖(5)。',
        order: 1
      }
    ],
    description: '本实用新型通过合理的结构设计，实现了食用菌种植棚的组装式构造，具有结构稳定、保温性能好等优点。',
    abstract: '本实用新型公开了一种组装式食用菌种植棚，包括底座、立柱、横梁、保温层和顶盖，整体结构可快速装卸，便于运输和安装。',
    status: DraftStatus.DRAFT,
    createTime: '2024-01-20T10:30:00Z',
    updateTime: '2024-01-22T15:45:00Z',
    userId: 'user-123'
  },
  {
    id: '2',
    title: '食用菌自动化培养控制系统',
    technicalField: '本发明涉及生物技术领域，具体涉及一种食用菌自动化培养控制系统。',
    backgroundTechnology: '食用菌的培养需要精确控制温度、湿度、CO2浓度、通风等环境参数。',
    technicalProblem: '传统培养方式控制精度低、人工成本高、难以标准化。',
    technicalSolution: '本发明提供一种食用菌自动化培养控制系统，实现智能化培养。',
    claims: [
      {
        id: 'claim-1',
        type: 'independent',
        content: '一种食用菌自动化培养控制系统，包括传感器模块、控制器模块、执行器模块和人机交互模块。',
        order: 1
      }
    ],
    description: '本发明通过集成多种传感器和控制算法，实现了食用菌培养环境的精确控制。',
    abstract: '本发明公开了一种食用菌自动化培养控制系统，能够实时监测培养环境参数，自动调节各项条件。',
    status: DraftStatus.REVIEWING,
    createTime: '2024-01-18T14:20:00Z',
    updateTime: '2024-01-21T09:15:00Z',
    userId: 'user-123'
  },
  {
    id: '3',
    title: '智能食用菌接种装置',
    technicalField: '本实用新型涉及食用菌生产设备技术领域。',
    backgroundTechnology: '传统的人工接种方式存在效率低、污染率高等问题。',
    technicalProblem: '现有接种设备自动化程度低，接种精度不高。',
    technicalSolution: '本实用新型提供一种智能食用菌接种装置，能够自动完成接种操作。',
    claims: [
      {
        id: 'claim-1',
        type: 'independent',
        content: '一种智能食用菌接种装置，包括接种箱体、机械臂系统、控制系统和消毒系统。',
        order: 1
      }
    ],
    description: '本实用新型实现了食用菌接种过程的自动化，提高了接种效率和成功率。',
    abstract: '本实用新型公开了一种智能食用菌接种装置，能够自动完成食用菌的接种操作。',
    status: DraftStatus.COMPLETED,
    createTime: '2024-01-15T09:45:00Z',
    updateTime: '2024-01-19T16:30:00Z',
    userId: 'user-123'
  }
]

// 模拟API接口
export const patentDraftService = {
  // 创建专利草稿（提交到后端）
  async createDraft(data: {
    title: string
    technicalField: string
    technicalSolution: string
  }): Promise<any> {
    try {
      console.log('=== 开始创建专利草稿 ===')
      console.log('发明名称:', data.title)
      console.log('技术领域:', data.technicalField)
      console.log('技术方案:', data.technicalSolution)

      // 拼接 prompt：发明名称 + 技术领域 + 技术方案
      const prompt = `${data.title}\n${data.technicalField}\n${data.technicalSolution}`

      // 调用API生成专利草稿
      const response = await request.post<any>('/manus/task', {
        prompt: prompt,
        type: 4  // 4: 专利草稿
      })

      console.log('专利草稿提交响应:', response)

      if (response.code === 200) {
        return response
      } else {
        throw new Error(response.msg || '生成失败')
      }
    } catch (error: any) {
      console.error('=== 专利草稿生成失败 ===')
      console.error(error)

      if (error.response && error.response.status === 401) {
        throw new Error('登录已过期，请重新登录')
      }

      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '生成失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取草稿列表
  async getDraftList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: DraftStatus
  } = {}) {
    try {
      console.log('=== 获取草稿列表 ===')
      console.log('请求参数:', params)

      const requestData: PageQueryRequest = {
        keyword: params.keyword || '',
        pageIndex: params.page || 1,
        pageSize: params.pageSize || 10,
        type: 4  // 4: 专利草稿
      }

      // 状态映射
      if (params.status) {
        const statusMap: Record<string, number> = {
          'draft': 0,      // 草稿 = 生成中
          'reviewing': 1,  // 审查中 = 已完成
          'completed': 1   // 已完成
        }
        requestData.state = statusMap[params.status]
      }

      console.log('最终请求数据:', requestData)

      const response = await request.post<PageQueryResponse>('/task/getPage', requestData)

      console.log('后端返回数据:', response)

      if (response.code === 200 && response.data) {
        // 转换为 PatentDraft 类型
        const drafts: PatentDraft[] = response.data.records.map(record => {
          // 解析 taskJson
          let title = '专利草稿'
          let technicalField = ''
          let technicalSolution = ''
          let abstract = ''

          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson)
              const promptLines = taskData.prompt ? taskData.prompt.split('\n') : []
              if (promptLines.length > 0) {
                title = promptLines[0] || '专利草稿'
              }
              if (promptLines.length > 1) {
                technicalField = promptLines[1] || ''
              }
              if (promptLines.length > 2) {
                technicalSolution = promptLines.slice(2).join('\n')
                abstract = technicalSolution.substring(0, 200) + '...'
              }
            }
          } catch (e) {
            console.warn('解析 taskJson 失败:', e)
          }

          return {
            id: String(record.id),
            title,
            technicalField: technicalField || '正在生成中...',
            backgroundTechnology: '',
            technicalProblem: '',
            technicalSolution: technicalSolution || '',
            claims: [],
            description: '',
            abstract: abstract || '正在生成中...',
            status: record.state === 1 ? DraftStatus.COMPLETED : DraftStatus.DRAFT,
            createTime: record.createTime,
            updateTime: record.updateTime,
            userId: String(record.userId),
            // 扩展字段
            firstImgUrl: convertImageUrl(record.firstImgUrl),
            pdfUrl: record.pdfUrl,
            wordUrl: record.wordUrl,
            mdUrl: record.mdUrl,
            state: record.state
          } as PatentDraft & {
            firstImgUrl?: string
            pdfUrl?: string
            wordUrl?: string
            mdUrl?: string
            state?: number
          }
        })

        console.log('转换后的草稿列表:', drafts)

        return {
          data: drafts,
          total: response.data.total,
          page: params.page || 1,
          pageSize: params.pageSize || 10
        }
      } else {
        throw new Error(response.msg || '获取草稿列表失败')
      }
    } catch (error: any) {
      console.error('=== 获取草稿列表失败 ===')
      console.error(error)

      if (error.response && error.response.status === 401) {
        throw new Error('登录已过期，请重新登录')
      }

      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '获取草稿列表失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取草稿详情
  async getDraftDetail(id: string): Promise<PatentDraft> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const draft = mockPatentDrafts.find(item => item.id === id)
    if (!draft) {
      throw new Error('草稿不存在')
    }

    return draft
  },

  // 更新草稿
  async updateDraft(id: string, updates: Partial<PatentDraft>): Promise<PatentDraft> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const draft = mockPatentDrafts.find(item => item.id === id)
    if (!draft) {
      throw new Error('草稿不存在')
    }

    // 简单更新
    if (updates.title !== undefined) draft.title = updates.title
    if (updates.status !== undefined) draft.status = updates.status
    draft.updateTime = new Date().toISOString()

    return draft
  },

  // 删除草稿
  async deleteDraft(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockPatentDrafts.findIndex(item => item.id === id)
    if (index > -1) {
      mockPatentDrafts.splice(index, 1)
    }
  }
}

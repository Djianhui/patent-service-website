import { request } from './http'
import type { PatentDraft, Claim, Drawing, Template, TemplateContent } from '@/types'
import { DraftStatus } from '@/types'

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
  // 获取草稿列表
  async getDraftList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: DraftStatus
  } = {}) {
    const { page = 1, pageSize = 10, keyword = '', status } = params

    await new Promise(resolve => setTimeout(resolve, 800))

    let filteredDrafts = [...mockPatentDrafts]

    // 关键词过滤
    if (keyword) {
      const searchKeyword = keyword.toLowerCase()
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.title.toLowerCase().includes(searchKeyword) ||
        draft.abstract.toLowerCase().includes(searchKeyword)
      )
    }

    // 状态过滤
    if (status) {
      filteredDrafts = filteredDrafts.filter(draft => draft.status === status)
    }

    // 按更新时间倒序排列
    filteredDrafts.sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())

    // 分页
    const total = filteredDrafts.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = filteredDrafts.slice(start, end)

    return {
      data,
      total,
      page,
      pageSize
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

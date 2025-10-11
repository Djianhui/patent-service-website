import { request } from './http'
import type { Patent, SearchResult, PatentSearchCriteria } from '@/types'

// 模拟专利数据
const mockPatents: Patent[] = [
  {
    id: '1',
    title: '组装式食用菌种植棚',
    abstract: '本实用新型公开了一种组装式食用菌种植棚，涉及食用菌种植技术不领域，包括棚体，所述棚体包括左右两侧板设置在棚体的左右两侧，所述左右两侧板之间连通过两个接头固定在左右两侧板上，所述接头固定在棚体的左右两侧，所述左右两侧板之间连通过两个与接头连通的上下网格板防护带，所述上下网格板设置在棚体的上下两侧...',
    applicant: '常州吴县某公司',
    inventor: ['张三', '李四'],
    applicationNumber: 'CN202203520U',
    publicationNumber: 'CN202203520U',
    applicationDate: '2024-07-16',
    publicationDate: '2025-04-29',
    ipcClass: ['A01G1/04', 'A01G31/02'],
    claims: [
      '一种组装式食用菌种植棚，其特征在于，包括棚体...',
      '根据权利要求一所述的组装式食用菌种植棚...'
    ],
    description: '技术领域：本实用新型涉及食用菌种植技术领域，具体为一种组装式食用菌种植棚。\n\n背景技术：随着食用菌市场需求的不断增长，传统的种植方式已无法满足大规模生产的需要。现有的种植架存在空间利用率低、组装不便等问题。',
    drawings: []
  },
  {
    id: '2',
    title: '一种新型菌菇种植用温室大棚结构',
    abstract: '本发明涉及农业种植技术领域，公开了一种新型菌菇种植用温室大棚结构。该结构包括支架系统、层板系统和温度控制系统，支架系统采用模块化设计，可根据不同需求进行组合。层板系统采用可调节高度设计，能够适应不同菌种的生长需求。',
    applicant: '山东农业大学',
    inventor: ['王五', '赵六', '孙七'],
    applicationNumber: 'CN202301145623',
    publicationNumber: 'CN116671298A',
    applicationDate: '2023-09-08',
    publicationDate: '2023-09-01',
    ipcClass: ['A01G31/04', 'A01G9/14'],
    claims: [
      '一种新型菌菇种植用温室大棚结构，其特征在于...',
      '根据权利要求一所述的新型菌菇种植用温室大棚结构...'
    ],
    description: '本发明属于农业装备技术领域，特别涉及一种用于菌菇种植的温室大棚结构。',
    drawings: []
  },
  {
    id: '3',
    title: '智能化食用菌种植装置',
    abstract: '本发明公开了一种智能化食用菌种植装置，包括种植箱体、温度控制模块、湿度控制模块、通风系统和智能监控系统。该装置能够实时监测环境参数，自动调节温度、湿度和通风量，为食用菌生长提供最佳环境。',
    applicant: '北京智能农业科技有限公司',
    inventor: ['刘八', '陈九'],
    applicationNumber: 'CN202201998765',
    publicationNumber: 'CN115067898B',
    applicationDate: '2022-06-15',
    publicationDate: '2022-10-20',
    ipcClass: ['A01G31/02', 'G05D27/02'],
    claims: [
      '一种智能化食用菌种植装置，其特征在于...',
      '根据权利要求一所述的智能化食用菌种植装置...'
    ],
    description: '本发明属于农业种植技术领域，特别涉及一种具有智能化功能的食用菌种植装置。',
    drawings: []
  },
  {
    id: '4',
    title: '一种环保型菌菇培养架',
    abstract: '本实用新型公开了一种环保型菌菇培养架，包括基座、立柱、层板和培养盒。该培养架采用可回收材料制造，结构简单，组装方便，能够有效提高空间利用率，降低生产成本。',
    applicant: '江苏绿色农业合作社',
    inventor: ['周十'],
    applicationNumber: 'CN202102567890',
    publicationNumber: 'CN213892457U',
    applicationDate: '2021-11-20',
    publicationDate: '2022-02-15',
    ipcClass: ['A01G31/04'],
    claims: [
      '一种环保型菌菇培养架，其特征在于...'
    ],
    description: '本实用新型属于菌菇种植设备技术领域，特别涉及一种环保型菌菇培养架。',
    drawings: []
  },
  {
    id: '5',
    title: '多层式食用菌种植系统',
    abstract: '本发明提供了一种多层式食用菌种植系统，包括多层种植架、自动化控制系统和营养液循环系统。该系统能够在有限的空间内实现大量生产，提高产量和质量。',
    applicant: '上海现代农业科技集团',
    inventor: ['吴十一', '郑十二'],
    applicationNumber: 'CN202003456789',
    publicationNumber: 'CN111836543B',
    applicationDate: '2020-04-25',
    publicationDate: '2020-12-08',
    ipcClass: ['A01G31/02', 'A01G31/06'],
    claims: [
      '一种多层式食用菌种植系统，其特征在于...'
    ],
    description: '本发明属于农业种植技术领域，特别涉及一种用于食用菌的多层式种植系统。',
    drawings: []
  }
]

// 模拟收藏列表
let mockFavoritePatents: Patent[] = []

export const patentSearchService = {
  // 快速检索
  async quickSearch(keyword: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<SearchResult> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 根据关键词过滤数据
    let filteredPatents = mockPatents
    if (keyword.trim()) {
      const searchKeyword = keyword.toLowerCase()
      filteredPatents = mockPatents.filter(patent =>
        patent.title.toLowerCase().includes(searchKeyword) ||
        patent.abstract.toLowerCase().includes(searchKeyword) ||
        patent.applicant.toLowerCase().includes(searchKeyword) ||
        patent.inventor.some(inv => inv.toLowerCase().includes(searchKeyword)) ||
        patent.applicationNumber.toLowerCase().includes(searchKeyword) ||
        patent.publicationNumber.toLowerCase().includes(searchKeyword)
      )
    }

    // 分页处理
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedPatents = filteredPatents.slice(start, end)

    return {
      patents: paginatedPatents,
      total: filteredPatents.length,
      page,
      pageSize
    }

    // 真实 API 调用（已注释）
    // const response = await request.post<SearchResult>('/patent/search/quick', {
    //   keyword,
    //   ...params
    // })
    // return response.data
  },

  // 高级检索
  async advancedSearch(criteria: PatentSearchCriteria, params?: {
    page?: number
    pageSize?: number
  }): Promise<SearchResult> {
    const response = await request.post<SearchResult>('/patent/search/advanced', {
      ...criteria,
      ...params
    })
    return response.data
  },

  // 获取专利详情
  async getPatentDetail(id: string): Promise<Patent> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 查找模拟数据
    const patent = mockPatents.find(p => p.id === id)
    if (!patent) {
      throw new Error('专利不存在')
    }

    return patent

    // 真实 API 调用（已注释）
    // const response = await request.get<Patent>(`/patent/${id}`)
    // return response.data
  },

  // 收藏专利
  async favoritePatent(id: string): Promise<void> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 查找专利并添加到收藏列表
    const patent = mockPatents.find(p => p.id === id)
    if (patent && !mockFavoritePatents.find(p => p.id === id)) {
      mockFavoritePatents.push(patent)
    }
    
    // 真实 API 调用（已注释）
    // await request.post(`/patent/${id}/favorite`)
  },

  // 取消收藏专利
  async unfavoritePatent(id: string): Promise<void> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从收藏列表中删除
    const index = mockFavoritePatents.findIndex(p => p.id === id)
    if (index !== -1) {
      mockFavoritePatents.splice(index, 1)
    }
    
    // 真实 API 调用（已注释）
    // await request.delete(`/patent/${id}/favorite`)
  },

  // 获取收藏的专利
  async getFavoritePatents(params?: {
    page?: number
    pageSize?: number
  }): Promise<SearchResult> {
    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 分页处理
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedPatents = mockFavoritePatents.slice(start, end)
    
    return {
      patents: paginatedPatents,
      total: mockFavoritePatents.length,
      page,
      pageSize
    }
    
    // 真实 API 调用（已注释）
    // const response = await request.get<SearchResult>('/patent/favorites', params)
    // return response.data
  },

  // 获取检索历史
  async getSearchHistory(params?: {
    page?: number
    pageSize?: number
  }): Promise<{
    history: Array<{
      id: string
      keyword?: string
      criteria?: PatentSearchCriteria
      resultCount: number
      searchTime: string
    }>
    total: number
  }> {
    const response = await request.get('/patent/search/history', params)
    return response.data
  },

  // 删除检索历史
  async deleteSearchHistory(id: string): Promise<void> {
    await request.delete(`/patent/search/history/${id}`)
  },

  // 获取相关专利推荐
  async getRelatedPatents(patentId: string, limit: number = 10): Promise<Patent[]> {
    const response = await request.get<Patent[]>(`/patent/${patentId}/related?limit=${limit}`)
    return response.data
  },

  // 导出检索结果
  async exportSearchResults(searchId: string, format: 'excel' | 'csv' = 'excel'): Promise<Blob> {
    const response = await request.get(`/patent/search/${searchId}/export?format=${format}`)
    return response.data
  }
}

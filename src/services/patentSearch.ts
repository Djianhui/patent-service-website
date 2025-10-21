import { request } from './http'
import type { Patent, SearchResult, PatentSearchCriteria } from '@/types'
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
  type: number // 2: 专利检索
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

// 模拟专利数据
const mockPatents: Patent[] = [
  {
    id: '1',
    title: '组装式食用菌种植棚',
    abstract:
      '本实用新型公开了一种组装式食用菌种植棚，涉及食用菌种植技术不领域，包括棚体，所述棚体包括左右两侧板设置在棚体的左右两侧，所述左右两侧板之间连通过两个接头固定在左右两侧板上，所述接头固定在棚体的左右两侧，所述左右两侧板之间连通过两个与接头连通的上下网格板防护带，所述上下网格板设置在棚体的上下两侧...',
    applicant: '常州吴县某公司',
    inventor: ['张三', '李四'],
    applicationNumber: 'CN202203520U',
    publicationNumber: 'CN202203520U',
    applicationDate: '2024-07-16',
    publicationDate: '2025-04-29',
    ipcClass: ['A01G1/04', 'A01G31/02'],
    claims: [
      '一种组装式食用菌种植棚，其特征在于，包括棚体...',
      '根据权利要求一所述的组装式食用菌种植棚...',
    ],
    description:
      '技术领域：本实用新型涉及食用菌种植技术领域，具体为一种组装式食用菌种植棚。\n\n背景技术：随着食用菌市场需求的不断增长，传统的种植方式已无法满足大规模生产的需要。现有的种植架存在空间利用率低、组装不便等问题。',
    drawings: [],
  },
  {
    id: '2',
    title: '一种新型菌菇种植用温室大棚结构',
    abstract:
      '本发明涉及农业种植技术领域，公开了一种新型菌菇种植用温室大棚结构。该结构包括支架系统、层板系统和温度控制系统，支架系统采用模块化设计，可根据不同需求进行组合。层板系统采用可调节高度设计，能够适应不同菌种的生长需求。',
    applicant: '山东农业大学',
    inventor: ['王五', '赵六', '孙七'],
    applicationNumber: 'CN202301145623',
    publicationNumber: 'CN116671298A',
    applicationDate: '2023-09-08',
    publicationDate: '2023-09-01',
    ipcClass: ['A01G31/04', 'A01G9/14'],
    claims: [
      '一种新型菌菇种植用温室大棚结构，其特征在于...',
      '根据权利要求一所述的新型菌菇种植用温室大棚结构...',
    ],
    description: '本发明属于农业装备技术领域，特别涉及一种用于菌菇种植的温室大棚结构。',
    drawings: [],
  },
  {
    id: '3',
    title: '智能化食用菌种植装置',
    abstract:
      '本发明公开了一种智能化食用菌种植装置，包括种植箱体、温度控制模块、湿度控制模块、通风系统和智能监控系统。该装置能够实时监测环境参数，自动调节温度、湿度和通风量，为食用菌生长提供最佳环境。',
    applicant: '北京智能农业科技有限公司',
    inventor: ['刘八', '陈九'],
    applicationNumber: 'CN202201998765',
    publicationNumber: 'CN115067898B',
    applicationDate: '2022-06-15',
    publicationDate: '2022-10-20',
    ipcClass: ['A01G31/02', 'G05D27/02'],
    claims: [
      '一种智能化食用菌种植装置，其特征在于...',
      '根据权利要求一所述的智能化食用菌种植装置...',
    ],
    description: '本发明属于农业种植技术领域，特别涉及一种具有智能化功能的食用菌种植装置。',
    drawings: [],
  },
  {
    id: '4',
    title: '一种环保型菌菇培养架',
    abstract:
      '本实用新型公开了一种环保型菌菇培养架，包括基座、立柱、层板和培养盒。该培养架采用可回收材料制造，结构简单，组装方便，能够有效提高空间利用率，降低生产成本。',
    applicant: '江苏绿色农业合作社',
    inventor: ['周十'],
    applicationNumber: 'CN202102567890',
    publicationNumber: 'CN213892457U',
    applicationDate: '2021-11-20',
    publicationDate: '2022-02-15',
    ipcClass: ['A01G31/04'],
    claims: ['一种环保型菌菇培养架，其特征在于...'],
    description: '本实用新型属于菌菇种植设备技术领域，特别涉及一种环保型菌菇培养架。',
    drawings: [],
  },
  {
    id: '5',
    title: '多层式食用菌种植系统',
    abstract:
      '本发明提供了一种多层式食用菌种植系统，包括多层种植架、自动化控制系统和营养液循环系统。该系统能够在有限的空间内实现大量生产，提高产量和质量。',
    applicant: '上海现代农业科技集团',
    inventor: ['吴十一', '郑十二'],
    applicationNumber: 'CN202003456789',
    publicationNumber: 'CN111836543B',
    applicationDate: '2020-04-25',
    publicationDate: '2020-12-08',
    ipcClass: ['A01G31/02', 'A01G31/06'],
    claims: ['一种多层式食用菌种植系统，其特征在于...'],
    description: '本发明属于农业种植技术领域，特别涉及一种用于食用菌的多层式种植系统。',
    drawings: [],
  },
]

// 模拟收藏列表
let mockFavoritePatents: Patent[] = []

export const patentSearchService = {
  // 快速检索（生成专利检索报告）
  async quickSearch(
    keyword: string,
    params?: {
      page?: number
      pageSize?: number
    },
  ): Promise<SearchResult> {
    try {
      console.log('=== 开始专利检索 ===')
      console.log('检索关键词:', keyword)

      // 调用API生成专利检索报告
      const response = await request.post<any>('/manus/task', {
        prompt: keyword,
        type: 2, // 2: 专利检索
      })

      console.log('检索提交响应:', response)

      if (response.code === 200) {
        // 检索提交成功，返回空结果（实际结果在历史记录中查看）
        return {
          patents: [],
          total: 0,
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
        }
      } else {
        throw new Error(response.msg || '检索失败')
      }
    } catch (error: any) {
      console.error('=== 专利检索失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '检索失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 获取检索历史列表（分页）
  async getSearchHistory(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
  }): Promise<{
    patents: Patent[]
    total: number
  }> {
    try {
      console.log('=== 获取检索历史 ===')
      console.log('请求参数:', params)

      const requestData: PageQueryRequest = {
        keyword: params?.keyword || '',
        pageIndex: params?.page || 1,
        pageSize: params?.pageSize || 20,
        type: 2, // 2: 专利检索
      }

      // 状态映射
      if (params?.status) {
        const statusMap: Record<string, number> = {
          generating: 0,
          completed: 1,
          failed: 2,
        }
        requestData.state = statusMap[params.status]
      }

      console.log('最终请求数据:', requestData)

      const response = await request.post<PageQueryResponse>('/task/getPage', requestData)

      console.log('后端返回数据:', response)

      if (response.code === 200 && response.data) {
        // 转换为 Patent 类型
        const patents: Patent[] = response.data.records.map((record) => {
          // 解析 taskJson
          let title = '专利检索报告'
          let abstract = ''
          let keyword = ''

          try {
            if (record.taskJson) {
              const taskData = JSON.parse(record.taskJson)
              keyword = taskData.prompt || ''
              title = `${keyword.substring(0, 20)}专利检索报告`
              // abstract = `基于"${keyword}"的专利检索结果`
            }
          } catch (e) {
            console.warn('解析 taskJson 失败:', e)
          }

          return {
            id: String(record.id),
            title,
            abstract,
            applicant: '系统生成',
            inventor: [],
            applicationNumber: record.taskId || String(record.id),
            publicationNumber: record.taskId || String(record.id),
            applicationDate: record.createTime,
            publicationDate: record.createTime,
            ipcClass: [],
            claims: [],
            description: abstract,
            drawings: [],
            // 扩展字段
            firstImgUrl: convertImageUrl(record.firstImgUrl),
            pdfUrl: record.pdfUrl,
            wordUrl: record.wordUrl,
            mdUrl: record.mdUrl,
            state: record.state,
          } as Patent & {
            firstImgUrl?: string
            pdfUrl?: string
            wordUrl?: string
            mdUrl?: string
            state?: number
          }
        })

        console.log('转换后的检索列表:', patents)

        return {
          patents,
          total: response.data.total,
        }
      } else {
        throw new Error(response.msg || '获取检索历史失败')
      }
    } catch (error: any) {
      console.error('=== 获取检索历史失败 ===')
      console.error(error)

      // 如果是登录过期错误，直接返回，不再显示错误
      if (error.message === '登录已过期') {
        return Promise.reject(error)
      }

      // 处理其他错误
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || backendError.message || '获取检索历史失败')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('网络错误，请检查网络连接')
      }
    }
  },

  // 高级检索
  async advancedSearch(
    criteria: PatentSearchCriteria,
    params?: {
      page?: number
      pageSize?: number
    },
  ): Promise<SearchResult> {
    const response = await request.post('/patent/search/advanced', {
      ...criteria,
      ...params,
    })
    return response
  },

  // 获取专利详情
  async getPatentDetail(id: string): Promise<Patent> {
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 查找模拟数据
    const patent = mockPatents.find((p) => p.id === id)
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
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 查找专利并添加到收藏列表
    const patent = mockPatents.find((p) => p.id === id)
    if (patent && !mockFavoritePatents.find((p) => p.id === id)) {
      mockFavoritePatents.push(patent)
    }

    // 真实 API 调用（已注释）
    // await request.post(`/patent/${id}/favorite`)
  },

  // 取消收藏专利
  async unfavoritePatent(id: string): Promise<void> {
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 从收藏列表中删除
    const index = mockFavoritePatents.findIndex((p) => p.id === id)
    if (index !== -1) {
      mockFavoritePatents.splice(index, 1)
    }

    // 真实 API 调用（已注释）
    // await request.delete(`/patent/${id}/favorite`)
  },

  // 获取收藏的专利
  async getFavoritePatents(params?: { page?: number; pageSize?: number }): Promise<SearchResult> {
    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

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
      pageSize,
    }

    // 真实 API 调用（已注释）
    // const response = await request.get<SearchResult>('/patent/favorites', params)
    // return response.data
  },

  // 删除检索历史
  async deleteSearchHistory(id: string): Promise<void> {
    await request.delete(`/patent/search/history/${id}`)
  },

  // 获取相关专利推荐
  async getRelatedPatents(patentId: string, limit: number = 10): Promise<Patent[]> {
    const response = await request.get(`/patent/${patentId}/related?limit=${limit}`)
    return response
  },

  // 导出检索结果
  async exportSearchResults(searchId: string, format: 'excel' | 'csv' = 'excel'): Promise<Blob> {
    const response = await request.get(`/patent/search/${searchId}/export?format=${format}`)
    return response
  },
}

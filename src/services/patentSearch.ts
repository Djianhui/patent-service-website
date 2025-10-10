import { request } from './http'
import type { Patent, SearchResult, PatentSearchCriteria } from '@/types'

export const patentSearchService = {
  // 快速检索
  async quickSearch(keyword: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<SearchResult> {
    const response = await request.post<SearchResult>('/patent/search/quick', {
      keyword,
      ...params
    })
    return response.data
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
    const response = await request.get<Patent>(`/patent/${id}`)
    return response.data
  },

  // 收藏专利
  async favoritePatent(id: string): Promise<void> {
    await request.post(`/patent/${id}/favorite`)
  },

  // 取消收藏专利
  async unfavoritePatent(id: string): Promise<void> {
    await request.delete(`/patent/${id}/favorite`)
  },

  // 获取收藏的专利
  async getFavoritePatents(params?: {
    page?: number
    pageSize?: number
  }): Promise<SearchResult> {
    const response = await request.get<SearchResult>('/patent/favorites', params)
    return response.data
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
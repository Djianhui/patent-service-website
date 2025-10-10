import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { patentSearchService } from '@/services/patentSearch'
import type { Patent, SearchResult, PatentSearchCriteria } from '@/types'

export const usePatentSearchStore = defineStore('patentSearch', () => {
  // State
  const searchResults = ref<Patent[]>([])
  const currentPatent = ref<Patent | null>(null)
  const searchHistory = ref<any[]>([])
  const favoritePatents = ref<Patent[]>([])
  const loading = ref(false)
  const searching = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const lastSearchCriteria = ref<PatentSearchCriteria | null>(null)

  // Getters
  const hasResults = computed(() => searchResults.value.length > 0)
  const resultCount = computed(() => searchResults.value.length)
  const favoriteCount = computed(() => favoritePatents.value.length)
  const isSearching = computed(() => searching.value)

  // Actions
  const quickSearch = async (keyword: string, params?: {
    page?: number
    pageSize?: number
  }) => {
    searching.value = true
    try {
      const response = await patentSearchService.quickSearch(keyword, params)
      
      if (params?.page === 1 || !params?.page) {
        searchResults.value = response.patents
      } else {
        searchResults.value.push(...response.patents)
      }
      
      total.value = response.total
      currentPage.value = params?.page || 1
      
      // 保存搜索条件
      lastSearchCriteria.value = { keyword }
      
      return response
    } catch (error) {
      console.error('快速检索失败:', error)
      throw error
    } finally {
      searching.value = false
    }
  }

  const advancedSearch = async (criteria: PatentSearchCriteria, params?: {
    page?: number
    pageSize?: number
  }) => {
    searching.value = true
    try {
      const response = await patentSearchService.advancedSearch(criteria, params)
      
      if (params?.page === 1 || !params?.page) {
        searchResults.value = response.patents
      } else {
        searchResults.value.push(...response.patents)
      }
      
      total.value = response.total
      currentPage.value = params?.page || 1
      
      // 保存搜索条件
      lastSearchCriteria.value = criteria
      
      return response
    } catch (error) {
      console.error('高级检索失败:', error)
      throw error
    } finally {
      searching.value = false
    }
  }

  const getPatentDetail = async (id: string) => {
    loading.value = true
    try {
      const patent = await patentSearchService.getPatentDetail(id)
      currentPatent.value = patent
      
      // 更新搜索结果中的专利信息
      const index = searchResults.value.findIndex(p => p.id === id)
      if (index !== -1) {
        searchResults.value[index] = patent
      }
      
      return patent
    } catch (error) {
      console.error('获取专利详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const favoritePatent = async (id: string) => {
    try {
      await patentSearchService.favoritePatent(id)
      
      // 更新本地状态
      const patent = searchResults.value.find(p => p.id === id) || currentPatent.value
      if (patent && !favoritePatents.value.find(p => p.id === id)) {
        favoritePatents.value.push(patent)
      }
    } catch (error) {
      console.error('收藏专利失败:', error)
      throw error
    }
  }

  const unfavoritePatent = async (id: string) => {
    try {
      await patentSearchService.unfavoritePatent(id)
      
      // 更新本地状态
      const index = favoritePatents.value.findIndex(p => p.id === id)
      if (index !== -1) {
        favoritePatents.value.splice(index, 1)
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
      throw error
    }
  }

  const getFavoritePatents = async (params?: {
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    try {
      const response = await patentSearchService.getFavoritePatents(params)
      favoritePatents.value = response.patents
      return response
    } catch (error) {
      console.error('获取收藏专利失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getSearchHistory = async (params?: {
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    try {
      const response = await patentSearchService.getSearchHistory(params)
      searchHistory.value = response.history
      return response
    } catch (error) {
      console.error('获取检索历史失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteSearchHistory = async (id: string) => {
    try {
      await patentSearchService.deleteSearchHistory(id)
      
      // 更新本地状态
      const index = searchHistory.value.findIndex(h => h.id === id)
      if (index !== -1) {
        searchHistory.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除检索历史失败:', error)
      throw error
    }
  }

  const getRelatedPatents = async (patentId: string, limit: number = 10) => {
    try {
      const patents = await patentSearchService.getRelatedPatents(patentId, limit)
      return patents
    } catch (error) {
      console.error('获取相关专利失败:', error)
      throw error
    }
  }

  const exportSearchResults = async (searchId: string, format: 'excel' | 'csv' = 'excel') => {
    try {
      const blob = await patentSearchService.exportSearchResults(searchId, format)
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `search-results.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出检索结果失败:', error)
      throw error
    }
  }

  const clearResults = () => {
    searchResults.value = []
    total.value = 0
    currentPage.value = 1
  }

  const clearCurrentPatent = () => {
    currentPatent.value = null
  }

  const resetStore = () => {
    searchResults.value = []
    currentPatent.value = null
    searchHistory.value = []
    favoritePatents.value = []
    loading.value = false
    searching.value = false
    total.value = 0
    currentPage.value = 1
    lastSearchCriteria.value = null
  }

  const isFavorite = (patentId: string): boolean => {
    return favoritePatents.value.some(p => p.id === patentId)
  }

  return {
    // State
    searchResults,
    currentPatent,
    searchHistory,
    favoritePatents,
    loading,
    searching,
    total,
    currentPage,
    pageSize,
    lastSearchCriteria,
    
    // Getters
    hasResults,
    resultCount,
    favoriteCount,
    isSearching,
    
    // Actions
    quickSearch,
    advancedSearch,
    getPatentDetail,
    favoritePatent,
    unfavoritePatent,
    getFavoritePatents,
    getSearchHistory,
    deleteSearchHistory,
    getRelatedPatents,
    exportSearchResults,
    clearResults,
    clearCurrentPatent,
    resetStore,
    isFavorite
  }
})
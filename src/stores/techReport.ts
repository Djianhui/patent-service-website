import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { techReportService } from '@/services/techReport'
import type { TechReport } from '@/types'
import { ReportStatus } from '@/types'

export const useTechReportStore = defineStore('techReport', () => {
  // State
  const reports = ref<TechReport[]>([])
  const currentReport = ref<TechReport | null>(null)
  const loading = ref(false)
  const generating = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Getters
  const reportList = computed(() => reports.value)
  const isGenerating = computed(() => generating.value)
  const reportCount = computed(() => reports.value.length)
  const completedReports = computed(() =>
    reports.value.filter(report => report.status === ReportStatus.COMPLETED)
  )

  // Actions
  const generateReport = async (data: {
    title: string
    inputType: 'text' | 'file'
    inputContent: string
    technicalField?: string
    fileId?: string
  }) => {
    generating.value = true
    try {
      // 构建prompt，使用technicalField或inputContent
      const prompt = data.technicalField || data.inputContent

      const report = await techReportService.generateReport({
        prompt: prompt,
        type: 1  // 1: 技术报告
      })

      // 添加到报告列表
      reports.value.unshift(report)
      currentReport.value = report

      return report
    } catch (error) {
      console.error('生成报告失败:', error)
      throw error
    } finally {
      generating.value = false
    }
  }

  const getReportList = async (params?: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
  }) => {
    loading.value = true
    try {
      const response = await techReportService.getReportList(params)

      if (params?.page === 1 || !params?.page) {
        reports.value = response.reports
      } else {
        reports.value.push(...response.reports)
      }

      total.value = response.total
      currentPage.value = params?.page || 1

      return response
    } catch (error) {
      console.error('获取报告列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getReportDetail = async (id: string) => {
    loading.value = true
    try {
      const report = await techReportService.getReportDetail(id)
      currentReport.value = report

      // 更新列表中的报告
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value[index] = report
      }

      return report
    } catch (error) {
      console.error('获取报告详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteReport = async (id: string) => {
    try {
      await techReportService.deleteReport(id)

      // 从列表中移除
      const index = reports.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reports.value.splice(index, 1)
        total.value -= 1
      }

      // 如果删除的是当前报告，清空当前报告
      if (currentReport.value?.id === id) {
        currentReport.value = null
      }
    } catch (error) {
      console.error('删除报告失败:', error)
      throw error
    }
  }

  const exportReport = async (id: string, format: 'pdf' | 'word' | 'txt' = 'pdf') => {
    try {
      // 先查找当前报告
      const report = reports.value.find(r => r.id === id)

      // 如果报告有直接下载链接，直接使用
      if (report && (report as any).pdfUrl && format === 'pdf') {
        window.open((report as any).pdfUrl, '_blank')
        return
      }
      if (report && (report as any).wordUrl && format === 'word') {
        window.open((report as any).wordUrl, '_blank')
        return
      }

      // 否则使用旧的blob下载方式
      const blob = await techReportService.exportReport(id, format)

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tech-report-${id}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出报告失败:', error)
      throw error
    }
  }

  const uploadFile = async (file: File) => {
    try {
      const response = await techReportService.uploadFile(file)
      return response
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }

  const clearCurrentReport = () => {
    currentReport.value = null
  }

  const resetStore = () => {
    reports.value = []
    currentReport.value = null
    loading.value = false
    generating.value = false
    total.value = 0
    currentPage.value = 1
  }

  return {
    // State
    reports,
    currentReport,
    loading,
    generating,
    total,
    currentPage,
    pageSize,

    // Getters
    reportList,
    isGenerating,
    reportCount,
    completedReports,

    // Actions
    generateReport,
    getReportList,
    getReportDetail,
    deleteReport,
    exportReport,
    uploadFile,
    clearCurrentReport,
    resetStore
  }
})

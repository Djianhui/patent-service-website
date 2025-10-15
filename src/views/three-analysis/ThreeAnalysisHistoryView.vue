<template>
  <div class="three-analysis-history-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">三性分析历史</h1>
      <p class="page-subtitle">查看和管理您的专利三性分析报告</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-content">
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索专利标题、申请人或摘要..." clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-button @click="refreshData">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="$router.push('/app/three-analysis/new')">
            <el-icon>
              <Plus />
            </el-icon>
            新建分析
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 分析列表 -->
    <el-card class="analysis-list-card">
      <template #header>
        <div class="list-header">
          <span>分析记录</span>
          <div class="list-info">
            <span class="count">共 {{ total }} 条记录</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 分析记录列表 -->
        <div class="analysis-list">
          <div v-for="analysis in analysisList" :key="analysis.id" class="analysis-item">
            <!-- 首页图片 -->
            <div class="analysis-image" v-if="(analysis as any).firstImgUrl">
              <el-image :src="(analysis as any).firstImgUrl" fit="contain" :alt="analysis.patentInfo.title" lazy
                :preview-src-list="[(analysis as any).firstImgUrl]" :initial-index="0" preview-teleported
                :z-index="3000">
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                    <span>图片加载失败</span>
                  </div>
                </template>
                <template #placeholder>
                  <div class="image-loading">
                    <el-icon class="is-loading">
                      <Loading />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <div class="image-mask">
                <el-icon>
                  <ZoomIn />
                </el-icon>
                <span>点击放大</span>
              </div>
            </div>

            <!-- 分析信息区域 -->
            <div class="analysis-content">
              <div class="analysis-header">
                <div class="analysis-info">
                  <h3 class="analysis-title">{{ analysis.patentInfo.title }}</h3>
                  <div class="analysis-meta">
                    <span class="meta-item">
                      <el-icon>
                        <User />
                      </el-icon>
                      {{ analysis.patentInfo.applicant }}
                    </span>
                    <span class="meta-item">
                      <el-icon>
                        <Calendar />
                      </el-icon>
                      {{ formatDate(analysis.createTime) }}
                    </span>
                    <span class="meta-item">
                      <!-- <el-icon>
                        <Document />
                      </el-icon>
                      {{ analysis.patentInfo.publicationNumber }} -->
                    </span>
                  </div>
                </div>
                <div class="analysis-actions">
                  <el-tag :type="getStateType((analysis as any).state)" size="small">
                    {{ getStateText((analysis as any).state) }}
                  </el-tag>
                  <el-button size="small" text @click.stop="downloadReport(analysis, 'pdf')"
                    :disabled="!(analysis as any).pdfUrl">
                    <el-icon>
                      <Download />
                    </el-icon>
                    下载PDF
                  </el-button>
                  <el-button size="small" text @click.stop="downloadReport(analysis, 'word')"
                    :disabled="!(analysis as any).wordUrl">
                    <el-icon>
                      <Download />
                    </el-icon>
                    下载Word
                  </el-button>
                  <el-button size="small" type="danger" @click.stop="deleteAnalysis(analysis)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    删除
                  </el-button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && analysisList.length === 0" class="empty-state">
          <el-empty description="暂无分析记录">
            <el-button type="primary" @click="$router.push('/app/three-analysis/new')">
              创建第一个分析
            </el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="total"
            :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  User,
  Calendar,
  Document,
  View,
  Download,
  Delete,
  Picture,
  Loading,
  ZoomIn
} from '@element-plus/icons-vue'
import { threeAnalysisService } from '@/services/threeAnalysis'
import { formatDate } from '@/utils'
import type { ThreeAnalysis } from '@/types'

// Composables
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const analysisList = ref<ThreeAnalysis[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 计算属性
const displayList = computed(() => {
  return analysisList.value
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const result = await threeAnalysisService.getAnalysisHistory({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    })

    analysisList.value = result.data
    total.value = result.total
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== '登录已过期') {
      ElMessage.error(error.message || '加载数据失败')
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const refreshData = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const handleSizeChange = () => {
  pagination.page = 1
  loadData()
}

const deleteAnalysis = async (analysis: ThreeAnalysis) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${analysis.patentInfo.title}"的分析报告吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await threeAnalysisService.deleteAnalysis(analysis.id)
    ElMessage.success('删除成功')

    // 刷新列表
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const downloadReport = async (analysis: ThreeAnalysis, format: 'pdf' | 'word' = 'pdf') => {
  try {
    // 检查是否有对应的文件URL
    const fileUrl = format === 'pdf' ? (analysis as any).pdfUrl : (analysis as any).wordUrl
    if (!fileUrl) {
      ElMessage.warning(`该报告暂无${format === 'pdf' ? 'PDF' : 'Word'}文件`)
      return
    }

    // 显示下载中提示
    const loadingMessage = ElMessage({
      message: '正在准备下载...',
      type: 'info',
      duration: 0
    })

    try {
      // 创建隐藏的a标签进行下载
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = fileUrl

      // 设置下载文件名
      const extension = format === 'pdf' ? 'pdf' : 'docx'
      const fileName = `${analysis.patentInfo.title}_三性分析.${extension}`
      link.download = fileName

      // 添加到DOM并触发下载
      document.body.appendChild(link)
      link.click()

      // 清理DOM
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

      // 关闭加载提示并显示成功消息
      loadingMessage.close()
      ElMessage.success('下载已开始，请查看浏览器下载列表')
    } catch (downloadError) {
      console.error('下载文件失败:', downloadError)
      loadingMessage.close()

      // 如果下载失败，尝试在新窗口打开
      ElMessage({
        message: '直接下载失败，正在尝试在新窗口打开...',
        type: 'warning',
        duration: 2000
      })

      setTimeout(() => {
        window.open(fileUrl, '_blank')
      }, 500)
    }
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 工具方法
const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 150 ? abstract.substring(0, 150) + '...' : abstract
}

const getScoreStatus = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'default'
  if (score >= 60) return 'warning'
  return 'exception'
}

const getLevelType = (level: string): string => {
  switch (level) {
    case 'excellent': return 'success'
    case 'good': return 'default'
    case 'average': return 'warning'
    case 'poor': return 'danger'
    default: return 'default'
  }
}

const getLevelText = (level: string): string => {
  switch (level) {
    case 'excellent': return '优秀'
    case 'good': return '良好'
    case 'average': return '一般'
    case 'poor': return '较差'
    default: return '未知'
  }
}

const getCreativityType = (level: string): string => {
  switch (level) {
    case 'high': return 'success'
    case 'medium': return 'warning'
    case 'low': return 'danger'
    default: return 'default'
  }
}

const getCreativityText = (level: string): string => {
  switch (level) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '未知'
  }
}

const getStateType = (state: number): string => {
  switch (state) {
    case 0: return 'warning'  // 未完成（生成中）
    case 1: return 'success'  // 已完成
    case 2: return 'danger'   // 失败
    default: return 'info'
  }
}

const getStateText = (state: number): string => {
  switch (state) {
    case 0: return '生成中'
    case 1: return '已完成'
    case 2: return '失败'
    default: return '未知'
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.three-analysis-history-container {
  .page-header {
    margin-bottom: var(--spacing-lg);

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .page-subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
  }

  .action-bar {
    margin-bottom: var(--spacing-lg);

    .action-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-md);

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        flex: 1;
        max-width: 400px;
      }

      .action-buttons {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .analysis-list-card {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .list-info {
        .count {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }
    }

    .list-content {
      .analysis-list {
        .analysis-item {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border-light);
          transition: background-color var(--transition-fast);

          &:hover {
            background-color: var(--color-bg-secondary);
          }

          &:last-child {
            border-bottom: none;
          }

          // 首页图片区域
          .analysis-image {
            position: relative;
            flex-shrink: 0;
            width: 280px;
            height: 210px;
            border-radius: var(--border-radius-base);
            overflow: hidden;
            background-color: var(--color-bg-secondary);

            :deep(.el-image) {
              width: 100%;
              height: 100%;
              cursor: zoom-in;

              img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                background-color: white;
              }
            }

            .image-error {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: var(--color-text-placeholder);
              background-color: var(--color-bg-secondary);

              .el-icon {
                font-size: 48px;
                margin-bottom: var(--spacing-sm);
              }
            }

            .image-loading {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              background-color: var(--color-bg-secondary);

              .el-icon {
                font-size: 32px;
                color: var(--color-primary);
              }
            }

            // 悬停蒙层
            .image-mask {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: var(--spacing-xs);
              background-color: rgba(0, 0, 0, 0.6);
              color: white;
              opacity: 0;
              transition: opacity var(--transition-fast);
              pointer-events: none;

              .el-icon {
                font-size: 32px;
              }

              span {
                font-size: var(--font-size-sm);
              }
            }

            &:hover .image-mask {
              opacity: 1;
            }
          }

          // 分析信息区域
          .analysis-content {
            flex: 1;
            min-width: 0;
          }

          .analysis-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);

            .analysis-info {
              flex: 1;

              .analysis-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0 0 var(--spacing-sm) 0;
                line-height: var(--line-height-snug);
              }

              .analysis-meta {
                display: flex;
                gap: var(--spacing-lg);
                flex-wrap: wrap;

                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-xs);
                  color: var(--color-text-secondary);
                  font-size: var(--font-size-sm);

                  .el-icon {
                    font-size: 14px;
                  }
                }
              }
            }

            .analysis-actions {
              margin-left: var(--spacing-md);
              display: flex;
              gap: var(--spacing-xs);
              flex-shrink: 0;

              @media (max-width: 768px) {
                flex-direction: column;
                width: 100px;
              }
            }
          }

          .evaluation-summary {
            margin-bottom: var(--spacing-md);
            padding: var(--spacing-md);
            background-color: var(--color-bg-secondary);
            border-radius: var(--border-radius-base);

            .score-section {
              display: flex;
              align-items: center;
              gap: var(--spacing-md);
              margin-bottom: var(--spacing-md);
              flex-wrap: wrap;

              .score-label {
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                white-space: nowrap;
              }

              .score-value {
                font-weight: var(--font-weight-semibold);
                color: var(--color-text-primary);
                white-space: nowrap;
              }
            }

            .analysis-results {
              display: flex;
              gap: var(--spacing-lg);
              flex-wrap: wrap;

              .result-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);

                .result-label {
                  font-size: var(--font-size-sm);
                  color: var(--color-text-secondary);
                  white-space: nowrap;
                }
              }
            }
          }

          .patent-abstract {
            margin-bottom: var(--spacing-md);

            p {
              color: var(--color-text-secondary);
              line-height: var(--line-height-relaxed);
              font-size: var(--font-size-sm);
              margin: 0;
            }
          }

          .risk-hints {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            flex-wrap: wrap;

            .risk-label {
              font-size: var(--font-size-sm);
              color: var(--color-text-secondary);
              white-space: nowrap;
            }

            .more-risks {
              font-size: var(--font-size-sm);
              color: var(--color-text-tertiary);
            }
          }
        }
      }

      .empty-state {
        padding: var(--spacing-3xl) 0;
      }

      .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding: var(--spacing-lg) 0;
        border-top: 1px solid var(--color-border-light);
        margin-top: var(--spacing-lg);
      }
    }
  }
}

@media (max-width: 768px) {
  .three-analysis-history-container {
    .analysis-list-card .list-content .analysis-list .analysis-item {
      flex-direction: column;

      // 移动端图片区域
      .analysis-image {
        width: 100%;
        height: auto;
        aspect-ratio: 4 / 3;
      }

      .analysis-content {
        width: 100%;
      }

      .analysis-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);

        .analysis-actions {
          margin-left: 0;
          width: 100%;
          flex-direction: row;
          justify-content: flex-start;
        }
      }

      .evaluation-summary {
        .score-section {
          flex-direction: column;
          align-items: flex-start;
        }

        .analysis-results {
          flex-direction: column;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>

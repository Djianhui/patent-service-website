<template>
  <div class="three-analysis-history-container">
    <!-- 页面横幅 -->
    <div class="page-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <el-icon :size="48">
            <Finished />
          </el-icon>
        </div>
        <div class="banner-text">
          <h1 class="page-title">三性分析历史</h1>
          <p class="page-subtitle">查看和管理您的专利三性分析报告</p>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-content">
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索专利标题、申请人或摘要..." clearable @input="handleSearch"
            class="search-input">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-button @click="refreshData" class="refresh-button">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="$router.push('/app/three-analysis/new')" class="new-button">
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
import { useI18n } from 'vue-i18n'
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
  ZoomIn,
  Finished
} from '@element-plus/icons-vue'
import { threeAnalysisService } from '@/services/threeAnalysis'
import { formatDate } from '@/utils'
import type { ThreeAnalysis } from '@/types'

// Composables
const router = useRouter()
const { t } = useI18n()

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
    if (error?.message !== t('common.loginExpired')) {
      ElMessage.error(error.message || t('common.loadFailed'))
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
      t('common.confirmDeleteMessage', { title: analysis.patentInfo.title }),
      t('common.confirmDelete'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await threeAnalysisService.deleteAnalysis(analysis.id)
    ElMessage.success(t('common.deleteSuccess'))

    // 刷新列表
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

const downloadReport = async (analysis: ThreeAnalysis, format: 'pdf' | 'word' = 'pdf') => {
  try {
    // 检查是否有对应的文件URL
    const fileUrl = format === 'pdf' ? (analysis as any).pdfUrl : (analysis as any).wordUrl
    if (!fileUrl) {
      ElMessage.warning(format === 'pdf' ? t('common.noPdfFile') : t('common.noWordFile'))
      return
    }

    // 显示下载中提示
    const loadingMessage = ElMessage({
      message: t('common.preparingDownload'),
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
      ElMessage.success(t('common.downloadStarted'))
    } catch (downloadError) {
      console.error('下载文件失败:', downloadError)
      loadingMessage.close()

      // 如果下载失败，尝试在新窗口打开
      ElMessage({
        message: t('common.downloadFailed'),
        type: 'warning',
        duration: 2000
      })

      setTimeout(() => {
        window.open(fileUrl, '_blank')
      }, 500)
    }
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(t('common.downloadRetry'))
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
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;

  // 页面横幅
  .page-banner {
    background: linear-gradient(135deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
    border-radius: 20px;
    padding: 48px 40px;
    margin-bottom: 32px;
    box-shadow: 0 8px 32px rgba(15, 76, 129, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .banner-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 24px;

      .banner-icon {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }

      .banner-text {
        flex: 1;

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .page-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          line-height: 1.6;
        }
      }
    }
  }

  .action-bar {
    margin-bottom: var(--spacing-lg);
    border-radius: 16px;
    border: 2px solid #e7f0ff;
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);

    .action-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        flex: 1;
        max-width: 400px;

        @media (max-width: 768px) {
          max-width: 100%;
        }

        .search-input {
          :deep(.el-input__wrapper) {
            border-radius: 20px;
            border: 2px solid #e7f0ff;

            &:hover,
            &.is-focus {
              border-color: #0F4C81;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 12px;

        .refresh-button {
          border-radius: 10px;
          border: 2px solid #e7f0ff;
          font-weight: 500;

          &:hover {
            border-color: #0F4C81;
            color: #0F4C81;
            background: #f0f4ff;
          }
        }

        .new-button {
          border-radius: 10px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border: none;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.2);

          &:hover {
            background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(15, 76, 129, 0.3);
          }
        }
      }
    }
  }

  .analysis-list-card {
    border-radius: 16px;
    border: 2px solid #e7f0ff;
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
      border-bottom: 2px solid #d5e5ff;
      padding: 20px 24px;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      >span {
        font-size: 16px;
        font-weight: 600;
        color: #0F4C81;
      }

      .list-info {
        .count {
          color: #6A5ACD;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .list-content {
      .analysis-list {
        .analysis-item {
          display: flex;
          gap: 24px;
          padding: 24px;
          margin-bottom: 16px;
          border-radius: 12px;
          border: 2px solid #e7f0ff;
          background: #fff;
          transition: all 0.3s ease;

          &:hover {
            border-color: #0F4C81;
            box-shadow: 0 4px 16px rgba(15, 76, 129, 0.12);
            transform: translateY(-2px);
          }

          // 首页图片区域
          .analysis-image {
            position: relative;
            flex-shrink: 0;
            width: 280px;
            height: 210px;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            box-shadow: 0 4px 12px rgba(15, 76, 129, 0.08);
            transition: all 0.3s ease;

            &:hover {
              box-shadow: 0 6px 16px rgba(15, 76, 129, 0.15);
              transform: scale(1.02);
            }

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
              background: linear-gradient(135deg, rgba(15, 76, 129, 0.85) 0%, rgba(106, 90, 205, 0.85) 100%);
              color: white;
              opacity: 0;
              transition: opacity var(--transition-fast);
              pointer-events: none;

              .el-icon {
                font-size: 32px;
              }

              span {
                font-size: var(--font-size-sm);
                font-weight: 500;
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
                font-size: 18px;
                font-weight: 600;
                color: #0F4C81;
                margin: 0 0 12px 0;
                line-height: var(--line-height-snug);
                display: flex;
                align-items: center;
                gap: 8px;

                &::before {
                  content: '';
                  width: 4px;
                  height: 18px;
                  background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
                  border-radius: 2px;
                }
              }

              .analysis-meta {
                display: flex;
                gap: var(--spacing-lg);
                flex-wrap: wrap;

                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  color: #6c757d;
                  font-size: 13px;

                  .el-icon {
                    font-size: 14px;
                    color: #6A5ACD;
                  }
                }
              }
            }

            .analysis-actions {
              display: flex;
              gap: 8px;
              flex-shrink: 0;
              flex-wrap: wrap;

              .el-tag {
                font-weight: 600;
                padding: 6px 14px;
                border-radius: 12px;
              }

              .el-button {
                border-radius: 8px;
                font-weight: 500;

                &:not(:disabled):hover {
                  background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
                  color: #0F4C81;
                }

                &.is-type-danger:hover {
                  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
                  color: #c33;
                  border-color: #fcc;
                }
              }

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
        padding: 80px 0;

        :deep(.el-empty) {
          .el-empty__image {
            svg {
              fill: #0F4C81;
              opacity: 0.3;
            }
          }

          .el-empty__description {
            color: #0F4C81;
            font-weight: 600;
            font-size: 16px;
          }

          .el-button--primary {
            background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            border: none;
            border-radius: 10px;
            font-weight: 600;

            &:hover {
              background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
            }
          }
        }
      }

      .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding: var(--spacing-lg) 0;
        border-top: 2px solid #e7f0ff;
        margin-top: var(--spacing-lg);

        :deep(.el-pagination) {
          .el-pager li {
            border-radius: 8px;
            font-weight: 600;

            &.is-active {
              background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            }
          }

          .btn-prev,
          .btn-next {
            border-radius: 8px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .three-analysis-history-container {
    .page-banner {
      padding: 32px 24px;

      .banner-content {
        flex-direction: column;
        text-align: center;

        .banner-text {
          .page-title {
            font-size: 24px;
          }

          .page-subtitle {
            font-size: 14px;
          }
        }
      }
    }

    .analysis-list-card .list-content .analysis-list .analysis-item {
      flex-direction: column;
      padding: 16px;

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

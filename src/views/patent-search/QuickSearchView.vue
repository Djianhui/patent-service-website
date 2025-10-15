<template>
  <div class="quick-search-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">专利快速检索</h1>
      <p class="page-subtitle">输入技术方案快速检索相关专利文献</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <template #header>
        <span>检索条件</span>
      </template>

      <el-form :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item>
          <el-input v-model="searchForm.keyword" type="textarea" :rows="6"
            placeholder="请输入技术方案，建议只输入一个技术方案，200-500字效果最佳" clearable maxlength="1000" show-word-limit
            resize="vertical" />
        </el-form-item>

        <el-form-item>
          <div class="search-actions">
            <el-button type="primary" size="large" :loading="searching" @click="handleSearch"
              :disabled="!searchForm.keyword.trim()">
              {{ searching ? '检索中...' : '开始检索' }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 快捷搜索建议 -->
        <div class="search-suggestions">
          <span class="suggestions-label">试试以下案例：</span>
          <el-tag v-for="suggestion in searchSuggestions" :key="suggestion" class="suggestion-tag"
            @click="searchForm.keyword = suggestion">
            {{ suggestion }}
          </el-tag>
        </div>
      </el-form>
    </el-card>

    <!-- 检索历史列表 -->
    <el-card class="results-card">
      <template #header>
        <div class="results-header">
          <span>检索历史</span>
          <div class="results-info">
            <span class="results-count">共 {{ total }} 条记录</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="results-content">
        <!-- 检索历史列表 -->
        <div class="patent-list">
          <div v-for="patent in patentList" :key="patent.id" class="patent-item">
            <!-- 首页图片 -->
            <div class="patent-image" v-if="(patent as any).firstImgUrl">
              <el-image :src="(patent as any).firstImgUrl" fit="contain" :alt="patent.title" lazy
                :preview-src-list="[(patent as any).firstImgUrl]" :initial-index="0" preview-teleported :z-index="3000">
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

            <!-- 专利内容区域 -->
            <div class="patent-info">
              <div class="patent-header">
                <h3 class="patent-title">{{ patent.title }}</h3>
                <div class="patent-status">
                  <el-tag :type="getStatusType((patent as any).state)">
                    {{ getStatusText((patent as any).state) }}
                  </el-tag>
                </div>
              </div>

              <div class="patent-meta">
                <span class="meta-item">
                  <el-icon>
                    <Document />
                  </el-icon>
                  {{ patent.publicationNumber }}
                </span>
                <span class="meta-item">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(patent.publicationDate) }}
                </span>
                <span class="meta-item">
                  <el-icon>
                    <User />
                  </el-icon>
                  {{ patent.applicant }}
                </span>
              </div>

              <div class="patent-abstract">
                <p>{{ getAbstractSummary(patent.abstract) }}</p>
              </div>

              <div class="patent-actions" @click.stop>
                <el-button size="small" text @click="downloadReport(patent, 'pdf')" :disabled="!(patent as any).pdfUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载PDF
                </el-button>
                <el-button size="small" text @click="downloadReport(patent, 'word')"
                  :disabled="!(patent as any).wordUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载Word
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && patentList.length === 0" class="empty-state">
          <el-empty description="暂无检索历史">
            <el-button type="primary" @click="searchForm.keyword = ''; handleSearch()">
              开始检索
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
import { ElMessage } from 'element-plus'
import { Document, User, Calendar, Collection, Star, StarFilled, View, Download, Picture, Loading, ZoomIn } from '@element-plus/icons-vue'
import { usePatentSearchStore } from '@/stores/patentSearch'
import { formatDate } from '@/utils'
import type { Patent } from '@/types'

// Composables
const router = useRouter()
const patentSearchStore = usePatentSearchStore()

// 响应式数据
const loading = ref(false)
const hasSearched = ref(false)

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 搜索建议
const searchSuggestions = ref([
  '组装式食用菌种植棚',
])

// 计算属性
const searching = computed(() => patentSearchStore.isSearching)
const searchResults = computed(() => patentSearchStore.searchResults)
const total = computed(() => patentSearchStore.total)
const patentList = computed(() => patentSearchStore.searchResults)

// 方法
const handleSearch = async () => {
  if (!searchForm.keyword.trim()) {
    ElMessage.warning('请输入检索关键词')
    return
  }

  hasSearched.value = true
  pagination.page = 1

  try {
    await patentSearchStore.quickSearch(searchForm.keyword, {
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    // 检索成功后加载历史记录
    await loadSearchHistory()
  } catch (error: any) {
    ElMessage.error(error.message || '检索失败')
  }
}

// 加载检索历史
const loadSearchHistory = async () => {
  loading.value = true
  try {
    await patentSearchStore.getSearchHistory({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== '登录已过期') {
      ElMessage.error(error.message || '加载历史记录失败')
    }
  } finally {
    loading.value = false
  }
}

// 状态类型映射
const getStatusType = (state: number): 'success' | 'warning' | 'danger' | 'info' => {
  switch (state) {
    case 1:
      return 'success' // 已完成
    case 0:
      return 'warning' // 生成中
    case 2:
      return 'danger' // 失败
    default:
      return 'info'
  }
}

// 状态文本映射
const getStatusText = (state: number): string => {
  switch (state) {
    case 1:
      return '已完成'
    case 0:
      return '生成中'
    case 2:
      return '失败'
    default:
      return '未知'
  }
}

const handlePageChange = async () => {
  if (!searchForm.keyword.trim()) return

  try {
    await patentSearchStore.quickSearch(searchForm.keyword, {
      page: pagination.page,
      pageSize: pagination.pageSize
    })
  } catch (error: any) {
    ElMessage.error('加载数据失败')
  }
}

const handleSizeChange = () => {
  pagination.page = 1
  handlePageChange()
}

const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract
}

// 下载报告
const downloadReport = async (patent: Patent, format: 'pdf' | 'word' = 'pdf') => {
  try {
    // 检查是否有对应的文件URL
    const fileUrl = format === 'pdf' ? (patent as any).pdfUrl : (patent as any).wordUrl
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
      const fileName = `${patent.title}_专利.${extension}`
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

// 生命周期
onMounted(() => {
  // 页面初始化，加载历史记录
  loadSearchHistory()
})
</script>

<style scoped lang="scss">
.quick-search-container {
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

  .search-card {
    margin-bottom: var(--spacing-lg);

    .search-actions {
      display: flex;
      justify-content: center;
      padding-top: var(--spacing-md);
    }

    .search-suggestions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      flex-wrap: wrap;

      .suggestions-label {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        white-space: nowrap;
      }

      .suggestion-tag {
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          background-color: var(--color-primary);
          color: white;
        }
      }
    }
  }

  .results-card {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .results-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .results-count {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }
    }

    .results-content {
      .patent-list {
        .patent-item {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border-light);
          cursor: pointer;
          transition: background-color var(--transition-fast);

          &:hover {
            background-color: var(--color-bg-secondary);
          }

          &:last-child {
            border-bottom: none;
          }

          // 首页图片区域
          .patent-image {
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

          // 专利信息区域
          .patent-info {
            flex: 1;
            min-width: 0;
          }

          .patent-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-sm);

            .patent-title {
              font-size: var(--font-size-lg);
              font-weight: var(--font-weight-medium);
              color: var(--color-text-primary);
              margin: 0;
              flex: 1;
              line-height: var(--line-height-snug);
            }

            .patent-status {
              margin-left: var(--spacing-md);
            }

            .patent-actions {
              margin-left: var(--spacing-md);
            }
          }

          .patent-meta {
            display: flex;
            gap: var(--spacing-lg);
            margin-bottom: var(--spacing-md);
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

          .patent-abstract {
            margin-bottom: var(--spacing-md);

            p {
              color: var(--color-text-secondary);
              line-height: var(--line-height-relaxed);
              font-size: var(--font-size-sm);
              margin: 0;
            }
          }

          .patent-actions {
            display: flex;
            gap: var(--spacing-sm);
            padding-top: var(--spacing-sm);

            .el-button {
              padding: 4px 8px;

              .el-icon {
                margin-right: 4px;
              }
            }
          }

          .patent-tags {
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;
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
  .quick-search-container {
    .results-card .results-content .patent-list .patent-item {
      flex-direction: column;

      // 移动端图片区域
      .patent-image {
        width: 100%;
        height: auto;
        aspect-ratio: 4 / 3;
      }

      .patent-info {
        width: 100%;
      }

      .patent-meta {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .patent-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
    }
  }
}
</style>

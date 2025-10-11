<template>
  <div class="quick-search-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">专利快速检索</h1>
      <p class="page-subtitle">输入关键词快速检索相关专利文献</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <template #header>
        <span>检索条件</span>
      </template>

      <el-form :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="请输入关键词、发明人、申请人或专利号" size="large" clearable
            @keyup.enter="handleSearch">
            <template #append>
              <el-button type="primary" :loading="searching" @click="handleSearch"
                :disabled="!searchForm.keyword.trim()">
                {{ searching ? '检索中...' : '搜索' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 快捷搜索建议 -->
        <div class="search-suggestions">
          <span class="suggestions-label">热门搜索：</span>
          <el-tag v-for="suggestion in searchSuggestions" :key="suggestion" class="suggestion-tag"
            @click="searchForm.keyword = suggestion; handleSearch()">
            {{ suggestion }}
          </el-tag>
        </div>
      </el-form>
    </el-card>

    <!-- 搜索结果 -->
    <el-card v-if="hasSearched" class="results-card">
      <template #header>
        <div class="results-header">
          <span>检索结果</span>
          <div class="results-info">
            <span class="results-count">共找到 {{ total }} 件专利</span>
            <el-button size="small" @click="exportResults" :disabled="searchResults.length === 0">
              导出结果
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="searching" class="results-content">
        <!-- 搜索结果列表 -->
        <div class="patent-list">
          <div v-for="patent in searchResults" :key="patent.id" class="patent-item" @click="viewPatentDetail(patent)">
            <div class="patent-header">
              <h3 class="patent-title">{{ patent.title }}</h3>
              <div class="patent-actions">
                <el-button size="small" @click.stop="viewPatentDetailDialog(patent)">
                  <el-icon>
                    <View />
                  </el-icon>
                  在线阅览
                </el-button>
                <el-button size="small" @click.stop="downloadPatent(patent)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载
                </el-button>
                <el-button size="small" :icon="isFavorite(patent.id) ? 'StarFilled' : 'Star'"
                  :type="isFavorite(patent.id) ? 'warning' : 'default'" @click.stop="toggleFavorite(patent)">
                  {{ isFavorite(patent.id) ? '已收藏' : '收藏' }}
                </el-button>
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
                  <User />
                </el-icon>
                {{ patent.applicant }}
              </span>
              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                {{ formatDate(patent.publicationDate) }}
              </span>
              <span class="meta-item">
                <el-icon>
                  <Collection />
                </el-icon>
                {{ patent.ipcClass?.slice(0, 2).join(', ') }}
              </span>
            </div>

            <div class="patent-abstract">
              <p>{{ getAbstractSummary(patent.abstract) }}</p>
            </div>

            <div class="patent-tags">
              <el-tag v-for="tag in patent.ipcClass?.slice(0, 3)" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!searching && searchResults.length === 0 && hasSearched" class="empty-state">
          <el-empty description="未找到相关专利">
            <el-button type="primary" @click="$router.push('/app/patent-search/advanced')">
              尝试高级检索
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

    <!-- 专利详情对话框 -->
    <el-dialog v-model="detailVisible" :title="currentPatent?.title || '专利详情'" width="80%" top="5vh" destroy-on-close>
      <div v-loading="detailLoading" class="patent-detail">
        <div v-if="currentPatent" class="detail-content">
          <!-- 专利基本信息 -->
          <div class="detail-header">
            <h2>{{ currentPatent.title }}</h2>
            <div class="patent-meta-detail">
              <div class="meta-row">
                <span class="meta-label">申请号：</span>
                <span>{{ currentPatent.applicationNumber }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">公开号：</span>
                <span>{{ currentPatent.publicationNumber }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">申请人：</span>
                <span>{{ currentPatent.applicant }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">发明人：</span>
                <span>{{ currentPatent.inventor.join(', ') }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">申请日：</span>
                <span>{{ formatDate(currentPatent.applicationDate) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">公开日：</span>
                <span>{{ formatDate(currentPatent.publicationDate) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">IPC分类：</span>
                <span>{{ currentPatent.ipcClass.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="detail-section">
            <h3>摘要</h3>
            <p>{{ currentPatent.abstract }}</p>
          </div>

          <!-- 权利要求 -->
          <div class="detail-section">
            <h3>权利要求</h3>
            <div v-for="(claim, index) in currentPatent.claims" :key="index" class="claim-item">
              <strong>{{ index + 1 }}. </strong>{{ claim }}
            </div>
          </div>

          <!-- 说明书 -->
          <div class="detail-section">
            <h3>说明书</h3>
            <p class="description-text">{{ currentPatent.description }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="currentPatent && downloadPatent(currentPatent)">
          <el-icon>
            <Download />
          </el-icon>
          下载专利
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, User, Calendar, Collection, Star, StarFilled, View, Download } from '@element-plus/icons-vue'
import { usePatentSearchStore } from '@/stores/patentSearch'
import { formatDate } from '@/utils'
import type { Patent } from '@/types'

// Composables
const router = useRouter()
const patentSearchStore = usePatentSearchStore()

// 响应式数据
const hasSearched = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const currentPatent = ref<Patent | null>(null)

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
  '人工智能',
  '机器学习',
  '物联网',
  '区块链',
  '5G通信',
  '新能源',
  '生物医药',
  '量子计算',
  '农业装备'
])

// 计算属性
const searching = computed(() => patentSearchStore.isSearching)
const searchResults = computed(() => patentSearchStore.searchResults)
const total = computed(() => patentSearchStore.total)

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
  } catch (error: any) {
    ElMessage.error(error.message || '检索失败')
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

const viewPatentDetailDialog = async (patent: Patent) => {
  detailLoading.value = true
  detailVisible.value = true

  try {
    const detailPatent = await patentSearchStore.getPatentDetail(patent.id)
    currentPatent.value = detailPatent
  } catch (error) {
    ElMessage.error('加载专利详情失败')
    currentPatent.value = patent // 使用列表中的数据作为备选
  } finally {
    detailLoading.value = false
  }
}

const downloadPatent = async (patent: Patent) => {
  try {
    const content = `
专利标题：${patent.title}
申请号：${patent.applicationNumber}
公开号：${patent.publicationNumber}
申请人：${patent.applicant}
发明人：${patent.inventor.join(', ')}
申请日：${patent.applicationDate}
公开日：${patent.publicationDate}
IPC分类：${patent.ipcClass.join(', ')}

摘要：
${patent.abstract}

权利要求：
${patent.claims.map((claim, index) => `${index + 1}. ${claim}`).join('\n')}

说明书：
${patent.description}
    `

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${patent.title}_${patent.publicationNumber}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const viewPatentDetail = (patent: Patent) => {
  // 保存当前专利信息
  patentSearchStore.currentPatent = patent
  // 跳转到专利详情页面
  router.push(`/app/patent-search/detail/${patent.id}`)
}

const toggleFavorite = async (patent: Patent) => {
  try {
    if (isFavorite(patent.id)) {
      await patentSearchStore.unfavoritePatent(patent.id)
      ElMessage.success('已取消收藏')
    } else {
      await patentSearchStore.favoritePatent(patent.id)
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const isFavorite = (patentId: string): boolean => {
  return patentSearchStore.isFavorite(patentId)
}

const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract
}

const exportResults = () => {
  ElMessage.info('导出功能开发中...')
}

// 生命周期
onMounted(() => {
  // 页面初始化
  patentSearchStore.clearResults()
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

// 专利详情对话框样式
.patent-detail {
  .detail-content {
    .detail-header {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);

      h2 {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin-bottom: var(--spacing-lg);
      }

      .patent-meta-detail {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-sm);

        .meta-row {
          display: flex;

          .meta-label {
            font-weight: var(--font-weight-medium);
            color: var(--color-text-secondary);
            min-width: 80px;
            flex-shrink: 0;
          }
        }
      }
    }

    .detail-section {
      margin-bottom: var(--spacing-xl);

      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary);
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: 2px solid var(--color-primary-light);
      }

      p {
        color: var(--color-text-primary);
        line-height: var(--line-height-relaxed);
        margin: 0;
        text-align: justify;
      }

      .claim-item {
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-md);
        background-color: var(--color-bg-secondary);
        border-radius: var(--border-radius-base);
        line-height: var(--line-height-relaxed);
      }

      .description-text {
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  }
}

@media (max-width: 768px) {
  .patent-detail {
    .detail-content {
      .detail-header .patent-meta-detail {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>

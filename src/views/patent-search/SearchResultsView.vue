<template>
  <div class="search-results-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <p class="page-subtitle">管理您收藏的专利文献</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-content">
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="在收藏中搜索..." clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-button @click="refreshFavorites">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button @click="exportFavorites" :disabled="filteredPatents.length === 0">
            <el-icon>
              <Download />
            </el-icon>
            导出
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 收藏列表 -->
    <el-card class="results-card">
      <template #header>
        <div class="results-header">
          <span>收藏列表</span>
          <div class="results-info">
            <span class="results-count">共 {{ total }} 件专利</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="results-content">
        <!-- 专利列表 -->
        <div class="patent-list">
          <div v-for="patent in filteredPatents" :key="patent.id" class="patent-item">
            <div class="patent-header">
              <h3 class="patent-title">{{ patent.title }}</h3>
              <div class="patent-actions">
                <el-button size="small" @click="viewPatentDetail(patent)">
                  <el-icon>
                    <View />
                  </el-icon>
                  在线浏览
                </el-button>
                <el-button size="small" @click="downloadPatent(patent)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click="removeFavorite(patent)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  移除
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
        <div v-if="!loading && favoritePatents.length === 0" class="empty-state">
          <el-empty description="暂无收藏的专利">
            <el-button type="primary" @click="$router.push('/app/patent-search/quick')">
              去检索专利
            </el-button>
          </el-empty>
        </div>

        <!-- 搜索无结果 -->
        <div v-if="!loading && favoritePatents.length > 0 && filteredPatents.length === 0" class="empty-state">
          <el-empty description="未找到匹配的专利">
            <el-button @click="searchKeyword = ''">清除搜索</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  View,
  Delete,
  Document,
  User,
  Calendar,
  Collection
} from '@element-plus/icons-vue'
import { usePatentSearchStore } from '@/stores/patentSearch'
import { formatDate } from '@/utils'
import type { Patent } from '@/types'

// Composables
const router = useRouter()
const patentSearchStore = usePatentSearchStore()

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const searchKeyword = ref('')
const currentPatent = ref<Patent | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 计算属性
const favoritePatents = computed(() => patentSearchStore.favoritePatents)
const total = computed(() => favoritePatents.value.length)

const filteredPatents = computed(() => {
  if (!searchKeyword.value.trim()) {
    return favoritePatents.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return favoritePatents.value.filter(patent =>
    patent.title.toLowerCase().includes(keyword) ||
    patent.abstract.toLowerCase().includes(keyword) ||
    patent.applicant.toLowerCase().includes(keyword) ||
    patent.inventor.some(inv => inv.toLowerCase().includes(keyword))
  )
})

// 方法
const loadFavorites = async () => {
  loading.value = true
  try {
    await patentSearchStore.getFavoritePatents({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
  } catch (error) {
    ElMessage.error('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 实时搜索，由计算属性处理
}

const refreshFavorites = () => {
  loadFavorites()
}

const exportFavorites = () => {
  ElMessage.info('导出功能开发中...')
}

const viewPatentDetail = async (patent: Patent) => {
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
    // 模拟下载功能
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

const removeFavorite = async (patent: Patent) => {
  try {
    await ElMessageBox.confirm(
      `确定要从收藏中移除“${patent.title}”吗？`,
      '确认移除',
      {
        confirmButtonText: '移除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await patentSearchStore.unfavoritePatent(patent.id)
    ElMessage.success('已移除收藏')

    // 刷新列表
    loadFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract
}

const handlePageChange = () => {
  loadFavorites()
}

const handleSizeChange = () => {
  pagination.page = 1
  loadFavorites()
}

// 生命周期
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped lang="scss">
.search-results-container {
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

  .results-card {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .results-info {
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
              display: flex;
              gap: var(--spacing-xs);
              flex-shrink: 0;

              @media (max-width: 768px) {
                flex-direction: column;
                width: 100px;
              }
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
  .search-results-container {
    .results-card .results-content .patent-list .patent-item {
      .patent-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }

      .patent-meta {
        flex-direction: column;
        gap: var(--spacing-xs);
      }
    }
  }

  .patent-detail {
    .detail-content {
      .detail-header .patent-meta-detail {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>

<template>
  <div class="patent-draft-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">草稿管理</h1>
      <p class="page-subtitle">管理您的专利申请草稿，支持编辑、下载和删除</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-content">
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索草稿标题..." clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleStatusChange"
            style="width: 150px; margin-right: 16px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="审查中" value="reviewing" />
            <el-option label="已完成" value="completed" />
          </el-select>
          <el-button @click="refreshData">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="$router.push('/app/patent-draft/new')">
            <el-icon>
              <Plus />
            </el-icon>
            新建草稿
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 草稿列表 -->
    <el-card class="draft-list-card">
      <template #header>
        <div class="list-header">
          <span>草稿列表</span>
          <div class="list-info">
            <span class="count">共 {{ total }} 个草稿</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 草稿记录列表 -->
        <div class="draft-list">
          <div v-for="draft in draftList" :key="draft.id" class="draft-item">
            <div class="draft-header">
              <div class="draft-info">
                <h3 class="draft-title">{{ draft.title }}</h3>
                <div class="draft-meta">
                  <span class="meta-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    创建时间：{{ formatDate(draft.createTime) }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    更新时间：{{ formatDate(draft.updateTime) }}
                  </span>
                  <!-- <span class="meta-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    技术领域：{{ getTechnicalFieldSummary(draft.technicalField) }}
                  </span> -->
                </div>
              </div>
              <div class="draft-actions">
                <el-tag :type="getStatusType(draft.status)" size="small">
                  {{ getStatusText(draft.status) }}
                </el-tag>
                <el-button size="small" text @click.stop="downloadPDF(draft)" :disabled="!(draft as any).pdfUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载PDF
                </el-button>
                <el-button size="small" text @click.stop="downloadWord(draft)" :disabled="!(draft as any).wordUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载Word
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteDraft(draft)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <!-- 图片展示 -->
            <div class="draft-images" v-if="(draft as any).firstImgUrl">
              <div class="draft-image-container">
                <el-image :src="(draft as any).firstImgUrl" fit="contain" loading="lazy"
                  :preview-src-list="[(draft as any).firstImgUrl]" :initial-index="0" preview-teleported :z-index="3000"
                  style="width: 280px; height: 210px; border-radius: 4px; cursor: pointer;">
                  <template #placeholder>
                    <div
                      style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: var(--color-bg-light);">
                      <el-icon :size="30" color="var(--color-text-tertiary)">
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                  <template #error>
                    <div
                      style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: var(--color-bg-light);">
                      <span style="color: var(--color-text-tertiary); font-size: 12px;">图片加载失败</span>
                    </div>
                  </template>
                </el-image>
                <!-- 蒙层提示 -->
                <div class="image-mask">
                  <el-icon>
                    <ZoomIn />
                  </el-icon>
                  <span>点击放大</span>
                </div>
              </div>
            </div>

            <!-- 草稿摘要 -->
            <!-- <div class="draft-abstract">
              <p>{{ getAbstractSummary(draft.abstract) }}</p>
            </div> -->

            <!-- 权利要求统计 -->
            <!-- <div class="claims-summary">
              <span class="claims-count">权利要求：{{ draft.claims.length }} 项</span>
              <span class="independent-claims">
                独立权利要求：{{ getIndependentClaimsCount(draft.claims) }} 项
              </span>
            </div> -->
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && draftList.length === 0" class="empty-state">
          <el-empty description="暂无草稿">
            <el-button type="primary" @click="$router.push('/app/patent-draft/new')">
              创建第一个草稿
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Calendar,
  Edit,
  User,
  Download,
  Delete,
  Picture,
  Loading,
  ZoomIn
} from '@element-plus/icons-vue'
import { patentDraftService } from '@/services/patentDraft'
import { formatDate } from '@/utils'
import type { PatentDraft, Claim } from '@/types'
import { DraftStatus } from '@/types'

// Composables
const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const draftList = ref<PatentDraft[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const result = await patentDraftService.getDraftList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: statusFilter.value as DraftStatus
    })

    draftList.value = result.data
    total.value = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleStatusChange = () => {
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

const downloadPDF = async (draft: PatentDraft) => {
  const pdfUrl = (draft as any).pdfUrl
  if (!pdfUrl) {
    ElMessage.warning('该草稿暂无PDF文件')
    return
  }

  const loadingMessage = ElMessage({
    message: '正在准备下载...',
    type: 'info',
    duration: 0
  })

  try {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = pdfUrl
    link.download = `${draft.title}_专利草稿.pdf`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    loadingMessage.close()
    ElMessage.success('下载已开始，请查看浏览器下载列表')
  } catch (error) {
    console.error('下载失败:', error)
    loadingMessage.close()
    ElMessage.warning('直接下载失败，正在尝试在新窗口打开...')
    setTimeout(() => {
      window.open(pdfUrl, '_blank')
    }, 500)
  }
}

const downloadWord = async (draft: PatentDraft) => {
  const wordUrl = (draft as any).wordUrl
  if (!wordUrl) {
    ElMessage.warning('该草稿暂无Word文件')
    return
  }

  const loadingMessage = ElMessage({
    message: '正在准备下载...',
    type: 'info',
    duration: 0
  })

  try {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = wordUrl
    link.download = `${draft.title}_专利草稿.docx`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    loadingMessage.close()
    ElMessage.success('下载已开始，请查看浏览器下载列表')
  } catch (error) {
    console.error('下载失败:', error)
    loadingMessage.close()
    ElMessage.warning('直接下载失败，正在尝试在新窗口打开...')
    setTimeout(() => {
      window.open(wordUrl, '_blank')
    }, 500)
  }
}

const deleteDraft = async (draft: PatentDraft) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${draft.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await patentDraftService.deleteDraft(draft.id)
    ElMessage.success('删除成功')

    // 刷新列表
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}



// 工具方法
const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 120 ? abstract.substring(0, 120) + '...' : abstract
}

const getTechnicalFieldSummary = (field: string): string => {
  return field.length > 30 ? field.substring(0, 30) + '...' : field
}

const getStatusType = (status: DraftStatus): string => {
  switch (status) {
    case DraftStatus.DRAFT: return 'info'
    case DraftStatus.REVIEWING: return 'warning'
    case DraftStatus.COMPLETED: return 'success'
    default: return 'info'
  }
}

const getStatusText = (status: DraftStatus): string => {
  switch (status) {
    case DraftStatus.DRAFT: return '草稿'
    case DraftStatus.REVIEWING: return '审查中'
    case DraftStatus.COMPLETED: return '已完成'
    default: return '未知'
  }
}

const getIndependentClaimsCount = (claims: Claim[]): number => {
  return claims.filter(claim => claim.type === 'independent').length
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.patent-draft-manage-container {
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
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
  }

  .draft-list-card {
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
      .draft-list {
        .draft-item {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border-light);
          transition: background-color var(--transition-fast);

          &:last-child {
            border-bottom: none;
          }

          .draft-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);

            .draft-info {
              flex: 1;

              .draft-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0 0 var(--spacing-sm) 0;
                line-height: var(--line-height-snug);
              }

              .draft-meta {
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

            .draft-actions {
              margin-left: var(--spacing-md);
              display: flex;
              gap: var(--spacing-xs);
              align-items: center;
              flex-shrink: 0;

              @media (max-width: 768px) {
                flex-direction: column;
                width: 100px;
              }
            }
          }

          .draft-images {
            margin-bottom: var(--spacing-md);
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;

            .draft-image-container {
              position: relative;
              width: 280px;
              height: 210px;
              border-radius: 4px;
              overflow: hidden;
              transition: all var(--transition-base);

              &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateY(-2px);

                .image-mask {
                  opacity: 1;
                }
              }

              .image-mask {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #fff;
                opacity: 0;
                transition: opacity var(--transition-fast);
                pointer-events: none;

                .el-icon {
                  font-size: 32px;
                  margin-bottom: var(--spacing-xs);
                }

                span {
                  font-size: var(--font-size-sm);
                }
              }
            }

            :deep(.el-image) {
              border: 1px solid var(--color-border-light);
              transition: all var(--transition-base);

              &:hover {
                border-color: var(--color-primary);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
            }
          }

          .draft-abstract {
            margin-bottom: var(--spacing-md);

            p {
              color: var(--color-text-secondary);
              line-height: var(--line-height-relaxed);
              font-size: var(--font-size-sm);
              margin: 0;
            }
          }

          .claims-summary {
            display: flex;
            gap: var(--spacing-lg);
            padding: var(--spacing-sm) 0;
            border-top: 1px solid var(--color-border-lighter);

            .claims-count,
            .independent-claims {
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
  .patent-draft-manage-container {
    .draft-list-card .list-content .draft-list .draft-item {
      .draft-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);

        .draft-actions {
          margin-left: 0;
          width: 100%;
          flex-direction: row;
          justify-content: flex-start;
        }
      }

      .draft-meta {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .claims-summary {
        flex-direction: column;
        gap: var(--spacing-xs);
      }
    }
  }
}
</style>

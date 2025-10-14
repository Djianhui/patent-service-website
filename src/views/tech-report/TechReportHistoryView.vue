<template>
  <div class="tech-report-history-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">技术方案报告历史</h1>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/app/tech-report/new')">
          新建报告
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索报告标题或内容" clearable @clear="handleSearch"
            @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="生成中" value="generating" />
            <el-option label="已完成" value="completed" />
            <el-option label="生成失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报告列表 -->
    <el-card class="list-card">
      <div v-loading="loading" class="report-list">
        <div v-for="report in reportList" :key="report.id" class="report-item">
          <!-- 首页图片 -->
          <div class="report-image" v-if="(report as any).firstImgUrl" @click.stop>
            <el-image :src="(report as any).firstImgUrl" fit="contain" :alt="report.title" lazy
              :preview-src-list="[(report as any).firstImgUrl]" :initial-index="0" preview-teleported>
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

          <!-- 报告内容区域 -->
          <div class="report-info">
            <div class="report-header">
              <h3 class="report-title">{{ report.title }}</h3>
              <div class="report-status">
                <el-tag :type="getStatusType(report.status)">
                  {{ getStatusText(report.status) }}
                </el-tag>
              </div>
            </div>

            <div class="report-meta">
              <span class="meta-item">
                <el-icon>
                  <User />
                </el-icon>
                {{ report.technicalField || '未分类' }}
              </span>
              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                {{ formatDate(report.createTime) }}
              </span>

            </div>

            <div class="report-content">
              <p>{{ getReportSummary(report) }}</p>
            </div>

            <div class="report-actions" @click.stop>
              <el-button size="small" text @click="downloadReport(report)">
                下载
              </el-button>
              <el-button size="small" text type="danger" @click="deleteReport(report)">
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && reportList.length === 0" class="empty-state">
          <el-empty description="暂无技术方案报告">
            <el-button type="primary" @click="$router.push('/app/tech-report/new')">
              创建第一个报告
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize" :total="total"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Calendar, Document, Download, Picture, Loading, ZoomIn } from '@element-plus/icons-vue'
import { useTechReportStore } from '@/stores/techReport'
import { formatDate } from '@/utils'
import type { TechReport } from '@/types'

// Composables
const router = useRouter()
const techReportStore = useTechReportStore()

// 响应式数据
const loading = ref(false)

const filterForm = reactive({
  keyword: '',
  status: '',
  dateRange: null as [string, string] | null
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 计算属性
const reportList = computed(() => techReportStore.reportList)
const total = computed(() => techReportStore.total)

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    generating: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    generating: '生成中',
    completed: '已完成',
    failed: '生成失败'
  }
  return texts[status] || '未知'
}

const getReportSummary = (report: TechReport) => {
  if (report.reportContent?.summary) {
    return report.reportContent.summary.substring(0, 150) + '...'
  }
  return report.inputContent.substring(0, 150) + '...'
}

const loadReports = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filterForm.keyword,
      status: filterForm.status,
      startDate: filterForm.dateRange?.[0],
      endDate: filterForm.dateRange?.[1]
    }
    await techReportStore.getReportList(params)
  } catch (error) {
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadReports()
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.status = ''
  filterForm.dateRange = null
  pagination.page = 1
  loadReports()
}

const handlePageChange = () => {
  loadReports()
}

const handleSizeChange = () => {
  pagination.page = 1
  loadReports()
}

const downloadReport = async (report: TechReport) => {
  try {
    await techReportStore.exportReport(report.id, 'pdf')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const deleteReport = async (report: TechReport) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告"${report.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await techReportStore.deleteReport(report.id)
    ElMessage.success('删除成功')
    loadReports()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 生命周期
onMounted(() => {
  loadReports()
})
</script>

<style scoped lang="scss">
.tech-report-history-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
  }

  .filter-card {
    margin-bottom: var(--spacing-lg);
  }

  .list-card {
    .report-list {
      .report-item {
        display: flex;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border-light);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          background-color: var(--color-bg-secondary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        &:last-child {
          border-bottom: none;
        }

        // 首页图片区域
        .report-image {
          position: relative;
          flex-shrink: 0;
          width: 280px; // 增大宽度
          height: 210px; // 增大高度
          border-radius: var(--border-radius-md);
          overflow: hidden;
          background-color: var(--color-bg-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);

            .image-mask {
              opacity: 1;
            }
          }

          .el-image {
            width: 100%;
            height: 100%;
            display: block;
          }

          .image-error,
          .image-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--color-text-placeholder);
            font-size: var(--font-size-sm);

            .el-icon {
              font-size: 32px;
              margin-bottom: var(--spacing-xs);
            }
          }

          // 悬停蒙层
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

        // 报告信息区域
        .report-info {
          flex: 1;
          min-width: 0; // 防止flex子元素溢出
          display: flex;
          flex-direction: column;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-sm);

          .report-title {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-medium);
            color: var(--color-text-primary);
            margin: 0;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .report-status {
            margin-left: var(--spacing-md);
            flex-shrink: 0;
          }
        }

        .report-meta {
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

        .report-content {
          margin-bottom: var(--spacing-md);
          flex: 1;

          p {
            color: var(--color-text-secondary);
            line-height: var(--line-height-relaxed);
            font-size: var(--font-size-sm);
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }

        .report-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .empty-state {
        padding: var(--spacing-3xl) 0;
      }
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

@media (max-width: 768px) {
  .tech-report-history-container {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .list-card .report-list .report-item {
      flex-direction: column;

      .report-image {
        width: 100%;
        height: 280px; // 增大移动端高度
      }

      .report-meta {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .report-actions {
        justify-content: flex-end;
      }
    }
  }
}

// 预览对话框样式
.preview-container {
  .report-preview {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: var(--spacing-lg);

      .report-info {
        flex: 1;

        h2 {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0 0 var(--spacing-md) 0;
        }

        .report-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          flex-wrap: wrap;

          .meta-text {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
          }
        }
      }

      .preview-actions {
        flex-shrink: 0;
        margin-left: var(--spacing-lg);
      }
    }

    .preview-content {
      .report-sections {
        .section {
          margin-bottom: var(--spacing-2xl);

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
            font-size: var(--font-size-base);
            margin: 0;
            text-align: justify;
          }

          ul {
            margin: 0;
            padding-left: var(--spacing-lg);

            li {
              color: var(--color-text-primary);
              line-height: var(--line-height-relaxed);
              margin-bottom: var(--spacing-sm);
            }
          }
        }
      }

      .raw-content {
        h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-medium);
          color: var(--color-primary);
          margin-bottom: var(--spacing-md);
        }

        p {
          color: var(--color-text-primary);
          line-height: var(--line-height-relaxed);
          font-size: var(--font-size-base);
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }
}
</style>

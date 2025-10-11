<template>
  <div class="defense-simulation-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">模拟审查</h1>
      <p class="page-subtitle">上传专利文件，AI智能生成审查意见通知书</p>
    </div>

    <!-- 上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <span>专利文件上传</span>
      </template>

      <div class="upload-area">
        <el-upload ref="uploadRef" class="upload-dragger" drag :auto-upload="false" :show-file-list="false"
          accept=".pdf,.doc,.docx" :on-change="handleFileChange" :before-upload="beforeUpload">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            将专利申请文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF、DOC、DOCX 格式，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>

        <div v-if="currentFile" class="file-info">
          <div class="file-item">
            <el-icon>
              <Document />
            </el-icon>
            <span class="file-name">{{ currentFile.name }}</span>
            <span class="file-size">{{ formatFileSize(currentFile.size) }}</span>
            <el-button size="small" type="danger" @click="removeFile">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>

          <div class="upload-actions">
            <el-button type="primary" size="large" :loading="uploading" @click="startSimulation">
              {{ uploading ? '分析中...' : '开始模拟审查' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 审查记录列表 -->
    <el-card class="simulation-list-card">
      <template #header>
        <div class="list-header">
          <span>审查记录</span>
          <div class="list-actions">
            <el-input v-model="searchKeyword" placeholder="搜索专利标题、申请人..." clearable @input="handleSearch"
              style="width: 300px; margin-right: 16px">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleStatusChange"
              style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="分析中" value="analyzing" />
              <el-option label="失败" value="failed" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 审查记录列表 -->
        <div class="simulation-list">
          <div v-for="simulation in simulationList" :key="simulation.id" class="simulation-item"
            @click="viewSimulationDetail(simulation)">
            <div class="simulation-header">
              <div class="simulation-info">
                <h3 class="simulation-title">{{ simulation.patentInfo.title }}</h3>
                <div class="simulation-meta">
                  <span class="meta-item">
                    <el-icon>
                      <User />
                    </el-icon>
                    {{ simulation.patentInfo.applicant }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    {{ formatDate(simulation.createTime) }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Document />
                    </el-icon>
                    {{ simulation.patentFile.name }}
                  </span>
                </div>
              </div>
              <div class="simulation-actions">
                <el-tag :type="getStatusType(simulation.status)" size="small">
                  {{ getStatusText(simulation.status) }}
                </el-tag>
                <el-button size="small" @click.stop="viewSimulationDetail(simulation)">
                  <el-icon>
                    <View />
                  </el-icon>
                  查看详情
                </el-button>
                <el-button size="small" @click.stop="downloadOpinion(simulation)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载意见书
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteSimulation(simulation)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="simulation-summary">
              <div class="opinion-info">
                <span class="opinion-number">{{ simulation.examinationOpinion.reviewNumber }}</span>
                <el-tag :type="getSeverityType(simulation.examinationOpinion.severity)" size="small">
                  {{ getSeverityText(simulation.examinationOpinion.severity) }}
                </el-tag>
              </div>
              <div class="rejection-reasons">
                <span class="reasons-label">驳回理由：</span>
                <el-tag v-for="reason in simulation.examinationOpinion.rejectionReasons.slice(0, 3)" :key="reason.type"
                  size="small" type="warning" style="margin-right: 8px">
                  {{ getReasonText(reason.type) }}
                </el-tag>
                <span v-if="simulation.examinationOpinion.rejectionReasons.length > 3">
                  等{{ simulation.examinationOpinion.rejectionReasons.length }}项
                </span>
              </div>
            </div>

            <div class="patent-abstract">
              <p>{{ getAbstractSummary(simulation.patentInfo.abstract) }}</p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && simulationList.length === 0" class="empty-state">
          <el-empty description="暂无审查记录">
            <p>上传专利文件开始首次模拟审查</p>
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
  UploadFilled,
  Document,
  Delete,
  Search,
  User,
  Calendar,
  View,
  Download
} from '@element-plus/icons-vue'
import { simulationService } from '@/services/simulation'
import { formatDate } from '@/utils'
import type { SimulationReview } from '@/types'
import { SimulationStatus } from '@/types'

// Composables
const router = useRouter()

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const currentFile = ref<File | null>(null)
const searchKeyword = ref('')
const statusFilter = ref('')
const simulationList = ref<SimulationReview[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const result = await simulationService.getSimulationList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      status: statusFilter.value as SimulationStatus
    })

    simulationList.value = result.data
    total.value = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file: any) => {
  currentFile.value = file.raw
}

const beforeUpload = (file: File) => {
  const isValidFormat = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  const isValidSize = file.size / 1024 / 1024 < 10

  if (!isValidFormat) {
    ElMessage.error('只支持 PDF、DOC、DOCX 格式的文件！')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB！')
    return false
  }
  return false // 阻止自动上传
}

const removeFile = () => {
  currentFile.value = null
}

const startSimulation = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先选择专利文件')
    return
  }

  uploading.value = true
  try {
    await simulationService.uploadPatentFile(currentFile.value)
    ElMessage.success('模拟审查完成！')
    currentFile.value = null
    loadData() // 刷新列表
  } catch (error: any) {
    ElMessage.error(error.message || '模拟审查失败')
  } finally {
    uploading.value = false
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

const handlePageChange = () => {
  loadData()
}

const handleSizeChange = () => {
  pagination.page = 1
  loadData()
}

const viewSimulationDetail = (simulation: SimulationReview) => {
  // TODO: 跳转到详情页面
  ElMessage.info('查看详情功能开发中...')
}

const downloadOpinion = (simulation: SimulationReview) => {
  // 生成审查意见书内容
  const content = generateOpinionContent(simulation)

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${simulation.examinationOpinion.reviewNumber}_审查意见通知书.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('下载成功')
}

const deleteSimulation = async (simulation: SimulationReview) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${simulation.patentInfo.title}"的审查记录吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await simulationService.deleteSimulation(simulation.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const generateOpinionContent = (simulation: SimulationReview): string => {
  const lines = [
    '专利审查意见通知书',
    '',
    `审查意见书编号：${simulation.examinationOpinion.reviewNumber}`,
    `专利申请号：${simulation.patentInfo.applicationNumber || '未知'}`,
    `专利名称：${simulation.patentInfo.title}`,
    `申请人：${simulation.patentInfo.applicant}`,
    `发明人：${simulation.patentInfo.inventor.join(', ')}`,
    `答复期限：${simulation.examinationOpinion.deadline}`,
    '',
    simulation.examinationOpinion.content,
    '',
    '驳回理由详述：',
    ...simulation.examinationOpinion.rejectionReasons.map((reason, index) => [
      `${index + 1}. ${getReasonText(reason.type)}：`,
      reason.description,
      reason.citedPriors.length > 0 ? `引用文献：${reason.citedPriors.map(p => p.publicationNumber).join(', ')}` : '',
      `法律依据：${reason.legalBasis.join(', ')}`,
      ''
    ]).flat(),
    '审查员意见：',
    simulation.examinationOpinion.examinerComments,
    '',
    '法律依据：',
    ...simulation.examinationOpinion.legalBasis.map(basis => `- ${basis}`),
    '',
    `生成时间：${formatDate(simulation.createTime)}`
  ]

  return lines.join('\n')
}

// 工具方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 120 ? abstract.substring(0, 120) + '...' : abstract
}

const getStatusType = (status: SimulationStatus): string => {
  switch (status) {
    case SimulationStatus.COMPLETED: return 'success'
    case SimulationStatus.ANALYZING: return 'warning'
    case SimulationStatus.FAILED: return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: SimulationStatus): string => {
  switch (status) {
    case SimulationStatus.COMPLETED: return '已完成'
    case SimulationStatus.ANALYZING: return '分析中'
    case SimulationStatus.FAILED: return '失败'
    default: return '未知'
  }
}

const getSeverityType = (severity: string): string => {
  switch (severity) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

const getSeverityText = (severity: string): string => {
  switch (severity) {
    case 'high': return '严重'
    case 'medium': return '一般'
    case 'low': return '轻微'
    default: return '未知'
  }
}

const getReasonText = (type: string): string => {
  switch (type) {
    case 'novelty': return '新颖性'
    case 'creativity': return '创造性'
    case 'practicality': return '实用性'
    case 'clarity': return '清楚性'
    case 'support': return '支持性'
    default: return '其他'
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.defense-simulation-container {
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

  .upload-card {
    margin-bottom: var(--spacing-lg);

    .upload-area {
      .upload-dragger {
        width: 100%;
      }

      .file-info {
        margin-top: var(--spacing-lg);
        padding: var(--spacing-md);
        border: 1px solid var(--color-border-light);
        border-radius: var(--border-radius-base);
        background-color: var(--color-bg-secondary);

        .file-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);

          .file-name {
            flex: 1;
            font-weight: var(--font-weight-medium);
          }

          .file-size {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
          }
        }

        .upload-actions {
          text-align: center;
        }
      }
    }
  }

  .simulation-list-card {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-md);

      .list-actions {
        display: flex;
        align-items: center;
      }
    }

    .list-content {
      .simulation-list {
        .simulation-item {
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

          .simulation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);

            .simulation-info {
              flex: 1;

              .simulation-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0 0 var(--spacing-sm) 0;
              }

              .simulation-meta {
                display: flex;
                gap: var(--spacing-lg);
                flex-wrap: wrap;

                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-xs);
                  color: var(--color-text-secondary);
                  font-size: var(--font-size-sm);
                }
              }
            }

            .simulation-actions {
              display: flex;
              gap: var(--spacing-xs);
              align-items: center;
              margin-left: var(--spacing-md);
            }
          }

          .simulation-summary {
            margin-bottom: var(--spacing-md);
            padding: var(--spacing-md);
            background-color: var(--color-bg-secondary);
            border-radius: var(--border-radius-base);

            .opinion-info {
              display: flex;
              align-items: center;
              gap: var(--spacing-md);
              margin-bottom: var(--spacing-sm);

              .opinion-number {
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
              }
            }

            .rejection-reasons {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              flex-wrap: wrap;

              .reasons-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                white-space: nowrap;
              }
            }
          }

          .patent-abstract {
            p {
              color: var(--color-text-secondary);
              line-height: var(--line-height-relaxed);
              font-size: var(--font-size-sm);
              margin: 0;
            }
          }
        }
      }

      .empty-state {
        padding: var(--spacing-3xl) 0;
        text-align: center;

        p {
          color: var(--color-text-secondary);
          margin-top: var(--spacing-md);
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
}

@media (max-width: 768px) {
  .defense-simulation-container {
    .simulation-list-card .list-content .simulation-list .simulation-item {
      .simulation-header {
        flex-direction: column;
        gap: var(--spacing-sm);

        .simulation-actions {
          margin-left: 0;
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>

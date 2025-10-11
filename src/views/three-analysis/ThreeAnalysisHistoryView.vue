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
          <div v-for="analysis in analysisList" :key="analysis.id" class="analysis-item"
            @click="viewAnalysisDetail(analysis)">
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
                    <el-icon>
                      <Document />
                    </el-icon>
                    {{ analysis.patentInfo.publicationNumber }}
                  </span>
                </div>
              </div>
              <div class="analysis-actions">
                <el-button size="small" @click.stop="viewAnalysisDetail(analysis)">
                  <el-icon>
                    <View />
                  </el-icon>
                  查看详情
                </el-button>
                <el-button size="small" @click.stop="downloadReport(analysis)">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载报告
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteAnalysis(analysis)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <!-- 评估结果 -->
            <div class="evaluation-summary">
              <div class="score-section">
                <span class="score-label">综合评分：</span>
                <el-progress :percentage="analysis.overallEvaluation.score"
                  :status="getScoreStatus(analysis.overallEvaluation.score)" style="width: 200px" />
                <span class="score-value">{{ analysis.overallEvaluation.score }}分</span>
                <el-tag :type="getLevelType(analysis.overallEvaluation.level)" size="small">
                  {{ getLevelText(analysis.overallEvaluation.level) }}
                </el-tag>
              </div>

              <div class="analysis-results">
                <div class="result-item">
                  <span class="result-label">新颖性：</span>
                  <el-tag :type="analysis.noveltyAnalysis.hasNovelty ? 'success' : 'danger'" size="small">
                    {{ analysis.noveltyAnalysis.hasNovelty ? '具备' : '不具备' }}
                  </el-tag>
                </div>
                <div class="result-item">
                  <span class="result-label">创造性：</span>
                  <el-tag :type="getCreativityType(analysis.creativityAnalysis.creativityLevel)" size="small">
                    {{ getCreativityText(analysis.creativityAnalysis.creativityLevel) }}
                  </el-tag>
                </div>
                <div class="result-item">
                  <span class="result-label">实用性：</span>
                  <el-tag :type="analysis.practicalityAnalysis.isPractical ? 'success' : 'danger'" size="small">
                    {{ analysis.practicalityAnalysis.isPractical ? '具备' : '不具备' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 专利摘要 -->
            <div class="patent-abstract">
              <p>{{ getAbstractSummary(analysis.patentInfo.abstract) }}</p>
            </div>

            <!-- 风险提示 -->
            <div class="risk-hints" v-if="analysis.overallEvaluation.risks.length > 0">
              <span class="risk-label">风险提示：</span>
              <el-tag v-for="(risk, index) in analysis.overallEvaluation.risks.slice(0, 2)" :key="index" type="warning"
                size="small" style="margin-right: 8px">
                {{ risk }}
              </el-tag>
              <span v-if="analysis.overallEvaluation.risks.length > 2" class="more-risks">
                等{{ analysis.overallEvaluation.risks.length }}项风险
              </span>
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
  Delete
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
    ElMessage.error(error.message || '加载数据失败')
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

const viewAnalysisDetail = (analysis: ThreeAnalysis) => {
  router.push(`/app/three-analysis/${analysis.id}`)
}

const downloadReport = async (analysis: ThreeAnalysis) => {
  try {
    // 生成报告内容
    const reportContent = generateReportContent(analysis)

    // 创建并下载文件
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${analysis.patentInfo.title}_三性分析报告.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('报告下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
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

const generateReportContent = (analysis: ThreeAnalysis): string => {
  const reportLines = [
    '专利三性分析报告',
    '',
    `专利标题：${analysis.patentInfo.title}`,
    `申请号：${analysis.patentInfo.applicationNumber}`,
    `公开号：${analysis.patentInfo.publicationNumber}`,
    `申请人：${analysis.patentInfo.applicant}`,
    `发明人：${analysis.patentInfo.inventor.join(', ')}`,
    `申请日：${analysis.patentInfo.applicationDate}`,
    `公开日：${analysis.patentInfo.publicationDate}`,
    `IPC分类：${analysis.patentInfo.ipcClass.join(', ')}`,
    '',
    `专利摘要：`,
    analysis.patentInfo.abstract,
    '',
    '一、新颖性分析',
    `结论：${analysis.noveltyAnalysis.hasNovelty ? '具备新颖性' : '不具备新颖性'}`,
    `分析：${analysis.noveltyAnalysis.analysis}`,
    `总结：${analysis.noveltyAnalysis.conclusion}`,
    '',
    '二、创造性分析',
    `创造性水平：${getCreativityText(analysis.creativityAnalysis.creativityLevel)}`,
    `技术特征：${analysis.creativityAnalysis.technicalFeatures.join(', ')}`,
    `技术效果：${analysis.creativityAnalysis.technicalEffects.join(', ')}`,
    `分析：${analysis.creativityAnalysis.analysis}`,
    `总结：${analysis.creativityAnalysis.conclusion}`,
    '',
    '三、实用性分析',
    `结论：${analysis.practicalityAnalysis.isPractical ? '具备实用性' : '不具备实用性'}`,
    `实施方法：${analysis.practicalityAnalysis.implementationMethod}`,
    `分析：${analysis.practicalityAnalysis.analysis}`,
    `总结：${analysis.practicalityAnalysis.conclusion}`,
    '',
    '四、综合评估',
    `综合评分：${analysis.overallEvaluation.score}分`,
    `评估等级：${getLevelText(analysis.overallEvaluation.level)}`,
    '风险提示：',
    ...analysis.overallEvaluation.risks.map(risk => `- ${risk}`),
    '改进建议：',
    ...analysis.overallEvaluation.suggestions.map(suggestion => `- ${suggestion}`),
    '',
    `报告生成时间：${formatDate(analysis.createTime)}`
  ]

  return reportLines.join('\n')
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

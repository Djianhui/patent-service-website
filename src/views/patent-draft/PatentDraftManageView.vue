<template>
  <div class="patent-draft-manage-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('patentDraft.draftManagement') }}</h1>
      <p class="page-subtitle">{{ $t('patentDraft.manageDescription') }}</p>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar">
      <div class="action-content">
        <div class="search-box">
          <el-input v-model="searchKeyword" :placeholder="$t('patentDraft.searchPlaceholder')" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-select v-model="statusFilter" :placeholder="$t('patentDraft.statusFilter')" clearable
            @change="handleStatusChange" style="width: 150px; margin-right: 16px">
            <el-option :label="$t('patentDraft.allStatus')" value="" />
            <el-option :label="$t('patentDraft.statusDraft')" value="draft" />
            <el-option :label="$t('patentDraft.statusReviewing')" value="reviewing" />
            <el-option :label="$t('patentDraft.statusCompleted')" value="completed" />
          </el-select>
          <el-button @click="refreshData">
            <el-icon>
              <Refresh />
            </el-icon>
            {{ $t('common.refresh') }}
          </el-button>
          <el-button type="primary" @click="$router.push('/app/patent-draft/new')">
            <el-icon>
              <Plus />
            </el-icon>
            {{ $t('patentDraft.newDraft') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 草稿列表 -->
    <el-card class="draft-list-card">
      <template #header>
        <div class="list-header">
          <span>{{ $t('patentDraft.draftList') }}</span>
          <div class="list-info">
            <span class="count">{{ $t('patentDraft.totalDrafts', { count: total }) }}</span>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 草稿记录列表 -->
        <div class="draft-list">
          <div v-for="draft in draftList" :key="draft.id" class="draft-item">
            <div class="draft-header">
              <div class="draft-info">
                <h3 class="draft-title">{{ $t('patentDraft.patentDraftTitle') }}</h3>
                <div class="draft-meta">
                  <span class="meta-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    {{ $t('patentDraft.createTime') }}：{{ formatDate(draft.createTime) }}
                  </span>
                  <span class="meta-item">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    {{ $t('patentDraft.updateTime') }}：{{ formatDate(draft.updateTime) }}
                  </span>
                </div>
              </div>
              <div class="draft-actions">
                <el-tag :type="getStatusType(draft.status)" size="small">
                  {{ getStatusText(draft.status) }}
                </el-tag>
                <el-tag v-if="isPaid(draft)" type="success" class="payment-tag" size="small">
                  <el-icon :size="14">
                    <CircleCheck />
                  </el-icon>
                  <span>{{ $t('patentSearch.paid') }}</span>
                </el-tag>
                <!-- <el-button size="small" text @click.stop="downloadPDF(draft)" :disabled="!(draft as any).pdfUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentDraft.downloadPDF') }}
                </el-button> -->
                <el-button size="small" text @click.stop="handleDownloadClick(draft, 'word')"
                  :disabled="(draft as any).state !== 1">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentDraft.downloadWord') }}
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteDraft(draft)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                  {{ $t('common.delete') }}
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
                      <span style="color: var(--color-text-tertiary); font-size: 12px;">{{
                        $t('patentDraft.imageLoadFailed') }}</span>
                    </div>
                  </template>
                </el-image>
                <!-- 蒙层提示 -->
                <div class="image-mask">
                  <el-icon>
                    <ZoomIn />
                  </el-icon>
                  <span>{{ $t('patentDraft.clickToEnlarge') }}</span>
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
          <el-empty :description="$t('patentDraft.noDrafts')">
            <el-button type="primary" @click="$router.push('/app/patent-draft/new')">
              {{ $t('patentDraft.createFirstDraft') }}
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

    <!-- 支付弹窗 -->
    <el-dialog v-model="paymentDialogVisible" :title="$t('patentSearch.downloadReport')" width="500px"
      :close-on-click-modal="false">
      <div class="payment-container">
        <div class="payment-info">
          <div class="info-item">
            <span class="label">{{ $t('patentSearch.reportName') }}</span>
            <span class="value">{{ currentDownload.title }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('patentSearch.fileFormat') }}</span>
            <span class="value">{{ currentDownload.format === 'pdf' ? 'PDF' : 'Word' }}</span>
          </div>
          <div class="info-item price-item">
            <span class="label">{{ $t('patentSearch.price') }}</span>
            <span class="value price">{{ $t('patentSearch.priceValue') }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <div class="method-title">{{ $t('patentSearch.paymentMethod') }}</div>
          <el-radio-group v-model="paymentMethod" class="payment-options">
            <el-radio value="alipay" class="payment-option">
              <div class="option-content">
                <img src="/zfb.webp" alt="支付宝" class="payment-icon" />
                <!-- <span>{{ $t('patentSearch.alipay') }}</span> -->
              </div>
            </el-radio>
            <el-radio value="wechat" class="payment-option">
              <div class="option-content">
                <img src="/wx.jpg" alt="微信支付" class="payment-icon" />
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 支付宝扫码支付 -->
        <div v-if="paymentMethod === 'alipay' && showQRCode" class="qrcode-container">
          <div class="qrcode-wrapper">
            <div class="qrcode-placeholder" v-if="!qrCodeUrl">
              <el-icon :size="100" class="qrcode-icon">
                <Loading class="is-loading" />
              </el-icon>
              <p>{{ $t('patentSearch.generatingQRCode') }}</p>
            </div>
            <img v-else :src="qrCodeUrl" alt="支付宝二维码" class="qrcode-image" @error="handleImageError" />
          </div>
          <div class="qrcode-tips">
            <p v-if="tradeNo" class="trade-no">{{ $t('patentSearch.orderNumber') }}{{ tradeNo }}</p>
            <p>{{ $t('patentSearch.scanQRCode', { method: $t('patentSearch.alipay') }) }}</p>
          </div>
        </div>

        <!-- 微信扫码支付 -->
        <div v-if="paymentMethod === 'wechat' && showQRCode" class="qrcode-container">
          <div class="qrcode-wrapper">
            <div class="qrcode-placeholder" v-if="!qrCodeUrl">
              <el-icon :size="100" class="qrcode-icon">
                <Loading class="is-loading" />
              </el-icon>
              <p>{{ $t('patentSearch.generatingQRCode') }}</p>
            </div>
            <img v-else :src="qrCodeUrl" alt="微信二维码" class="qrcode-image" @error="handleImageError" />
          </div>
          <div class="qrcode-tips">
            <p v-if="tradeNo" class="trade-no">{{ $t('patentSearch.orderNumber') }}{{ tradeNo }}</p>
            <p>{{ $t('patentSearch.scanQRCode', { method: $t('patentSearch.wechatPay') }) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirmPayment" :loading="paying" v-if="!showQRCode">
            {{ $t('patentSearch.generateQRCode') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  ZoomIn,
  CircleCheck
} from '@element-plus/icons-vue'
import { patentDraftService } from '@/services/patentDraft'
import { formatDate } from '@/utils'
import type { PatentDraft, Claim } from '@/types'
import { DraftStatus } from '@/types'
import { useI18n } from 'vue-i18n'

// Composables
const router = useRouter()
const { t } = useI18n()

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

// 支付相关
const paymentDialogVisible = ref(false)
const paymentMethod = ref('alipay')
const showQRCode = ref(false)
const paying = ref(false)
const qrCodeUrl = ref('') // 二维码图片URL
const tradeNo = ref('') // 订单编号
const currentDownload = ref({
  draft: null as PatentDraft | null,
  format: 'word' as 'pdf' | 'word',
  title: '',
  taskId: '' // 任务ID
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

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (draft: PatentDraft): boolean => {
  const state = (draft as any).state
  const pdfUrl = (draft as any).pdfUrl
  const wordUrl = (draft as any).wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
}

// 获取草稿标题（支持多语言）
const getDraftTitle = (draft: PatentDraft): string => {
  const originalTitle = draft.title

  // 检查是否为纯草稿文本
  const draftTexts = [
    '专利撰写',
    'Patent Draft',
    '特許草案',
    'Patententwurf',
    'Brouillon de brevet',
    'Черновик патента',
    'مسودة براءة'
  ]

  // 如果是纯草稿文本，返回翻译
  if (draftTexts.includes(originalTitle)) {
    return t('patentDraft.title')
  }

  // 否则，组合为：用户标题 + 草稿文本
  return `${originalTitle} ${t('patentDraft.title')}`
}

// 点击下载按钮
const handleDownloadClick = (draft: PatentDraft, format: 'pdf' | 'word') => {
  const fileUrl = format === 'pdf' ? (draft as any).pdfUrl : (draft as any).wordUrl

  // 如果已支付且有文件URL，直接下载
  if ((draft as any).state === 1 && fileUrl) {
    if (format === 'pdf') {
      downloadPDF(draft)
    } else {
      downloadWord(draft)
    }
    return
  }

  const taskId = (draft as any).taskId

  console.log('=== 准备支付 - 专利草稿 ===')
  console.log('draft对象:', JSON.parse(JSON.stringify(draft)))
  console.log('taskId:', taskId)
  console.log('id:', draft.id)

  if (!taskId) {
    ElMessage.error(t('patentSearch.taskIdEmpty'))
    return
  }

  currentDownload.value = {
    draft,
    format,
    title: getDraftTitle(draft),
    taskId: taskId
  }
  paymentDialogVisible.value = true
  paymentMethod.value = 'alipay'
  showQRCode.value = false
  qrCodeUrl.value = ''
  tradeNo.value = ''
}

// 确认支付
const handleConfirmPayment = async () => {
  if (!currentDownload.value.taskId) {
    ElMessage.error(t('patentSearch.taskIdEmpty'))
    return
  }

  paying.value = true

  try {
    const payType = paymentMethod.value === 'alipay' ? 'alipay' : 'tenpay'
    const response = await patentDraftService.payForTask({
      payType,
      taskId: currentDownload.value.taskId
    })

    if ((response.code === 0 || response.code === 200) && response.data) {
      qrCodeUrl.value = response.data.qr_pic_url || response.data.qr_code_url || ''
      tradeNo.value = response.data.trade_no

      showQRCode.value = true
      paying.value = false

      const method = payType === 'alipay' ? t('patentSearch.alipay') : t('patentSearch.wechatPay')
      ElMessage.success(t('patentSearch.scanQRCode', { method }))
    } else {
      throw new Error(response.msg || t('patentSearch.paymentFailed'))
    }
  } catch (error: any) {
    console.error('支付失败:', error)
    paying.value = false
    showQRCode.value = false
    ElMessage.error(error.message || t('patentSearch.paymentFailed'))
  }
}

// 二维码图片加载失败处理
const handleImageError = () => {
  ElMessage.error(t('patentSearch.qrCodeLoadFailed'))
  showQRCode.value = false
  paying.value = false
}

const downloadPDF = async (draft: PatentDraft) => {
  const pdfUrl = (draft as any).pdfUrl
  if (!pdfUrl) {
    ElMessage.warning(t('patentDraft.noPDFAvailable'))
    return
  }

  const loadingMessage = ElMessage({
    message: t('common.preparingDownload'),
    type: 'info',
    duration: 0
  })

  try {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = pdfUrl
    link.download = `${draft.title}_${t('patentDraft.title')}.pdf`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    loadingMessage.close()
    ElMessage.success(t('common.downloadStarted'))
  } catch (error) {
    console.error('下载失败:', error)
    loadingMessage.close()
    ElMessage.warning(t('common.downloadFailed'))
    setTimeout(() => {
      window.open(pdfUrl, '_blank')
    }, 500)
  }
}

const downloadWord = async (draft: PatentDraft) => {
  const wordUrl = (draft as any).wordUrl
  if (!wordUrl) {
    ElMessage.warning(t('patentDraft.noWordAvailable'))
    return
  }

  const loadingMessage = ElMessage({
    message: t('common.preparingDownload'),
    type: 'info',
    duration: 0
  })

  try {
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = wordUrl
    link.download = `${draft.title}_${t('patentDraft.title')}.docx`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)

    loadingMessage.close()
    ElMessage.success(t('common.downloadStarted'))
  } catch (error) {
    console.error('下载失败:', error)
    loadingMessage.close()
    ElMessage.warning(t('common.downloadFailed'))
    setTimeout(() => {
      window.open(wordUrl, '_blank')
    }, 500)
  }
}

const deleteDraft = async (draft: PatentDraft) => {
  try {
    await ElMessageBox.confirm(
      t('patentDraft.confirmDelete', { title: draft.title }),
      t('patentDraft.confirmDeleteTitle'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await patentDraftService.deleteDraft(draft.id)
    ElMessage.success(t('common.deleteSuccess'))

    // 刷新列表
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(t('common.deleteFailed'))
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
    case DraftStatus.DRAFT: return t('patentDraft.statusDraft')
    case DraftStatus.REVIEWING: return t('patentDraft.statusReviewing')
    case DraftStatus.COMPLETED: return t('patentDraft.statusCompleted')
    default: return t('patentDraft.allStatus')
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

// 支付成功标签
.payment-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  animation: fadeIn 0.3s ease-in;

  .el-icon {
    margin-right: 2px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 支付弹窗样式
.payment-container {
  padding: 20px 0;

  .payment-info {
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    border-radius: 12px;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(15, 76, 129, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }

      .value {
        font-size: 14px;
        color: #1a1a1a;
        font-weight: 600;

        &.price {
          font-size: 20px;
          color: #ef4444;
          font-weight: 700;
        }
      }

      &.price-item {
        padding-top: 15px;
        margin-top: 10px;
        border-top: 2px solid rgba(15, 76, 129, 0.2);
      }
    }
  }

  .payment-methods {
    margin-bottom: 30px;

    .method-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 20px;
      text-align: center;
    }

    .payment-options {
      display: flex;
      justify-content: center;
      gap: 16px;
      width: 100%;

      :deep(.el-radio) {
        flex: 1;
        margin: 0;
        padding: 0;
        max-width: 150px;

        .el-radio__input {
          margin-right: 8px;

          .el-radio__inner {
            width: 18px;
            height: 18px;
            border-width: 2px;
          }
        }

        .el-radio__label {
          padding: 0;
          width: 100%;
          display: flex;
          justify-content: center;
        }
      }

      .payment-option {
        .option-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .payment-icon {
            width: 32px;
            height: 32px;
            object-fit: contain;
            border-radius: 6px;
          }

          span {
            font-size: 15px;
            font-weight: 500;
            color: #1a1a1a;
          }
        }
      }
    }
  }

  .qrcode-container {
    margin-top: 30px;
    text-align: center;

    .qrcode-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;

      .qrcode-placeholder {
        width: 200px;
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
        border: 2px dashed rgba(15, 76, 129, 0.3);
        border-radius: 12px;

        .qrcode-icon {
          color: #6A5ACD;
          margin-bottom: 10px;
          animation: spin 1s linear infinite;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }

      .qrcode-image {
        width: 200px;
        height: 200px;
        object-fit: contain;
        border: 2px solid rgba(15, 76, 129, 0.2);
        border-radius: 12px;
        background: #fff;
      }
    }

    .qrcode-tips {
      p {
        margin: 0;
        margin-top: 8px;
        font-size: 13px;
        color: #999;
        text-align: center;

        &.trade-no {
          font-size: 14px;
          font-weight: 600;
          color: #0F4C81;
          margin-top: 12px;
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>

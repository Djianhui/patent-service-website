<template>
  <div class="tech-report-history-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('techReport.reportHistory') }}</h1>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/app/tech-report/new')">
          {{ $t('techReport.newReport') }}
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item :label="$t('techReport.keyword')">
          <el-input v-model="filterForm.keyword" :placeholder="$t('techReport.searchPlaceholder')" clearable
            @clear="handleSearch" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item :label="$t('techReport.status')">
          <el-select v-model="filterForm.status" :placeholder="$t('techReport.selectStatus')" clearable
            style="width: 150px">
            <el-option :label="$t('techReport.allStatus')" value="" />
            <el-option :label="$t('techReport.statusGenerating')" value="generating" />
            <el-option :label="$t('techReport.statusCompleted')" value="completed" />
            <el-option :label="$t('techReport.statusFailed')" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('techReport.timeRange')">
          <el-date-picker v-model="filterForm.dateRange" type="daterange" :range-separator="$t('techReport.to')"
            :start-placeholder="$t('techReport.startDate')" :end-placeholder="$t('techReport.endDate')"
            format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="resetFilter">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报告列表 -->
    <el-card class="list-card">
      <div v-loading="loading" class="report-list">
        <div v-for="report in reportList" :key="report.id" class="report-item">
          <!-- 首页图片 -->
          <div class="report-image" v-if="(report as any).firstImgUrl">
            <el-image :src="(report as any).firstImgUrl" fit="contain" :alt="report.title" lazy
              :preview-src-list="[(report as any).firstImgUrl]" :initial-index="0" preview-teleported :z-index="3000">
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <Picture />
                  </el-icon>
                  <span>{{ $t('techReport.imageLoadFailed') }}</span>
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
            <!-- 蒙层提示 -->
            <div class="image-mask">
              <el-icon>
                <ZoomIn />
              </el-icon>
              <span>{{ $t('techReport.clickToEnlarge') }}</span>
            </div>
          </div>

          <!-- 报告内容区域 -->
          <div class="report-info">
            <div class="report-header">
              <h3 class="report-title">{{ $t('techReport.title') }}</h3>
              <div class="report-status">
                <el-tag v-if="isPaid(report)" type="success" class="payment-tag" size="small">
                  <el-icon :size="14">
                    <CircleCheck />
                  </el-icon>
                  <span>{{ $t('patentSearch.paid') }}</span>
                </el-tag>
                <el-tag :type="getStatusType(report.status)">
                  {{ getStatusText(report.status) }}
                </el-tag>
              </div>
            </div>

            <div class="report-meta">

              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                {{ formatDate(report.createTime) }}
              </span>

            </div>

            <!-- <div class="report-content">
              <p>{{ getReportSummary(report) }}</p>
            </div> -->

            <div class="report-actions" @click.stop>
              <el-button size="small" text @click="handleDownloadClick(report, 'pdf')">
                <el-icon>
                  <Download />
                </el-icon>
                {{ $t('techReport.downloadPDF') }}
              </el-button>
              <el-button size="small" text @click="handleDownloadClick(report, 'word')">
                <el-icon>
                  <Download />
                </el-icon>
                {{ $t('techReport.downloadWord') }}
              </el-button>
              <el-button size="small" text type="danger" @click="deleteReport(report)">
                {{ $t('common.delete') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && reportList.length === 0" class="empty-state">
          <el-empty :description="$t('techReport.noReports')">
            <el-button type="primary" @click="$router.push('/app/tech-report/new')">
              {{ $t('techReport.createFirstReport') }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Calendar, Document, Download, Picture, Loading, ZoomIn, CircleCheck } from '@element-plus/icons-vue'
import { useTechReportStore } from '@/stores/techReport'
import { formatDate } from '@/utils'
import type { TechReport } from '@/types'
import { useI18n } from 'vue-i18n'
import { techReportService } from '@/services/techReport'

// Composables
const router = useRouter()
const techReportStore = useTechReportStore()
const { t } = useI18n()

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

// 支付相关
const paymentDialogVisible = ref(false)
const paymentMethod = ref('alipay')
const showQRCode = ref(false)
const paying = ref(false)
const qrCodeUrl = ref('') // 二维码图片URL
const tradeNo = ref('') // 订单编号
const currentDownload = ref({
  report: null as TechReport | null,
  format: 'pdf' as 'pdf' | 'word',
  title: '',
  taskId: '' // 任务ID
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
    generating: t('techReport.statusGenerating'),
    completed: t('techReport.statusCompleted'),
    failed: t('techReport.statusFailed')
  }
  return texts[status] || t('common.unknown')
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
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== t('common.loginExpired')) {
      ElMessage.error(t('common.loadFailed'))
    }
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

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (report: TechReport): boolean => {
  const state = (report as any).state
  const pdfUrl = (report as any).pdfUrl
  const wordUrl = (report as any).wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
}

// 获取报告标题（支持多语言）
const getReportTitle = (report: TechReport): string => {
  const originalTitle = report.title

  // 检查是否为纯报告文本
  const reportTexts = [
    '技术方案报告',
    'Technical Report',
    '技術レポート',
    'Technischer Bericht',
    'Rapport technique',
    'Технический отчет',
    'التقرير التقني'
  ]

  // 如果是纯报告文本，返回翻译
  if (reportTexts.includes(originalTitle)) {
    return t('techReport.title')
  }

  // 否则，组合为：用户标题 + 报告文本
  return `${originalTitle} ${t('techReport.title')}`
}

// 点击下载按钮
const handleDownloadClick = async (report: TechReport, format: 'pdf' | 'word') => {
  console.log('=== 点击下载按钮 ====')
  console.log('report完整对象:', JSON.parse(JSON.stringify(report)))
  console.log('format:', format)

  const pdfUrl = (report as any).pdfUrl
  const wordUrl = (report as any).wordUrl
  const fileUrl = format === 'pdf' ? pdfUrl : wordUrl
  const state = (report as any).state

  console.log('state值:', state, '类型:', typeof state)
  console.log('pdfUrl:', pdfUrl)
  console.log('wordUrl:', wordUrl)
  console.log('选择的fileUrl:', fileUrl)
  console.log('判断条件: state === 1:', state === 1, 'fileUrl存在:', !!fileUrl)

  // 如果已支付且有文件URL，直接下载
  if (state === 1 && fileUrl) {
    console.log('✅ 满足下载条件，开始下载')
    downloadReport(report, format)
    return
  }

  // 如果state不为1，提示生成中或失败
  if (state === 0) {
    console.log('⚠️ state=0, 生成中')
    ElMessage.warning(t('techReport.statusGenerating'))
    return
  } else if (state === 2) {
    console.log('❌ state=2, 生成失败')
    ElMessage.error(t('techReport.statusFailed'))
    return
  }

  console.log('⚠️ 未满足任何条件，准备显示支付弹窗')
  console.log('可能的原因: state不等于1或fileUrl为空')

  const taskId = (report as any).taskId

  console.log('=== 准备支付 - 技术报告 ===')
  console.log('report对象:', JSON.parse(JSON.stringify(report)))
  console.log('taskId:', taskId)
  console.log('id:', report.id)

  if (!taskId) {
    ElMessage.error(t('patentSearch.taskIdEmpty'))
    return
  }

  currentDownload.value = {
    report,
    format,
    title: getReportTitle(report),
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
    const response = await techReportService.payForTask({
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

const downloadReport = async (report: TechReport, format: 'pdf' | 'word' = 'pdf') => {
  try {
    // 检查是否有对应的文件URL
    const fileUrl = format === 'pdf' ? (report as any).pdfUrl : (report as any).wordUrl
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
      const fileName = `${report.title}_${t('techReport.title')}.${extension}`
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

const deleteReport = async (report: TechReport) => {
  try {
    await ElMessageBox.confirm(
      t('common.confirmDeleteMessage', { title: report.title }),
      t('common.confirmDelete'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await techReportStore.deleteReport(report.id)
    ElMessage.success(t('common.deleteSuccess'))
    loadReports()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('common.deleteFailed'))
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
            display: flex;
            gap: 8px;
            align-items: center;
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

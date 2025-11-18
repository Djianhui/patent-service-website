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
                  <el-tag v-if="isPaid(analysis)" type="success" class="payment-tag" size="small">
                    <el-icon :size="14">
                      <CircleCheck />
                    </el-icon>
                    <span>已支付</span>
                  </el-tag>
                  <el-button size="small" text @click.stop="handleDownloadClick(analysis, 'pdf')"
                    :disabled="(analysis as any).state !== 1">
                    <el-icon>
                      <Download />
                    </el-icon>
                    下载PDF
                  </el-button>
                  <el-button size="small" text @click.stop="handleDownloadClick(analysis, 'word')"
                    :disabled="(analysis as any).state !== 1">
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

    <!-- 支付弹窗 -->
    <el-dialog v-model="paymentDialogVisible" title="下载报告 - 需要支付" width="500px" :close-on-click-modal="false">
      <div class="payment-container">
        <div class="payment-info">
          <div class="info-item">
            <span class="label">报告名称：</span>
            <span class="value">{{ currentDownload.title }}</span>
          </div>
          <div class="info-item">
            <span class="label">文件格式：</span>
            <span class="value">{{ currentDownload.format === 'pdf' ? 'PDF' : 'Word' }}</span>
          </div>
          <div class="info-item price-item">
            <span class="label">价格：</span>
            <span class="value price">￥19.9美元</span>
          </div>
        </div>

        <div class="payment-methods">
          <div class="method-title">支付方式</div>
          <el-radio-group v-model="paymentMethod" class="payment-options">
            <el-radio value="alipay" class="payment-option">
              <div class="option-content">
                <img src="/zfb.webp" alt="支付宝" class="payment-icon" />
                <span>支付宝</span>
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
              <p>正在生成支付二维码...</p>
            </div>
            <img v-else :src="qrCodeUrl" alt="支付宝二维码" class="qrcode-image" @error="handleImageError" />
          </div>
          <div class="qrcode-tips">
            <p v-if="tradeNo" class="trade-no">订单号：{{ tradeNo }}</p>
            <p>请使用支付宝扫描二维码完成支付</p>
          </div>
        </div>

        <!-- 微信扫码支付 -->
        <div v-if="paymentMethod === 'wechat' && showQRCode" class="qrcode-container">
          <div class="qrcode-wrapper">
            <div class="qrcode-placeholder" v-if="!qrCodeUrl">
              <el-icon :size="100" class="qrcode-icon">
                <Loading class="is-loading" />
              </el-icon>
              <p>正在生成支付二维码...</p>
            </div>
            <img v-else :src="qrCodeUrl" alt="微信二维码" class="qrcode-image" @error="handleImageError" />
          </div>
          <div class="qrcode-tips">
            <p v-if="tradeNo" class="trade-no">订单号：{{ tradeNo }}</p>
            <p>请使用微信扫描二维码完成支付</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmPayment" :loading="paying">
            {{ paying ? '支付中...' : '确认支付' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  Finished,
  CircleCheck
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

// 支付相关
const paymentDialogVisible = ref(false)
const paymentMethod = ref('alipay')
const showQRCode = ref(false)
const paying = ref(false)
const qrCodeUrl = ref('')
const tradeNo = ref('')
const currentDownload = ref({
  analysis: null as ThreeAnalysis | null,
  format: 'pdf' as 'pdf' | 'word',
  title: '',
  taskId: ''
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

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (analysis: ThreeAnalysis): boolean => {
  const state = (analysis as any).state
  const pdfUrl = (analysis as any).pdfUrl
  const wordUrl = (analysis as any).wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
}

// 点击下载按钮，弹出支付窗口
const handleDownloadClick = (analysis: ThreeAnalysis, format: 'pdf' | 'word') => {
  // 检查是否已经支付（state=1 且有文件URL）
  const fileUrl = format === 'pdf' ? (analysis as any).pdfUrl : (analysis as any).wordUrl

  if ((analysis as any).state === 1 && fileUrl) {
    // 已支付，直接下载
    downloadReport(analysis, format)
    return
  }

  // 未支付，显示支付窗口
  const taskId = (analysis as any).taskId || (analysis as any).applicationNumber

  console.log('=== 准备支付 - 三性分析 ===')
  console.log('analysis对象:', JSON.parse(JSON.stringify(analysis)))
  console.log('taskId:', taskId)
  console.log('applicationNumber:', (analysis as any).applicationNumber)
  console.log('id:', analysis.id)
  console.log('patentInfo:', (analysis as any).patentInfo)
  console.log('===========================')

  if (!taskId) {
    ElMessage.error('任务ID为空，无法支付')
    return
  }

  currentDownload.value = {
    analysis,
    format,
    title: analysis.patentInfo.title,
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
    ElMessage.error('任务ID为空，无法支付')
    return
  }

  paying.value = true

  try {
    const payType = paymentMethod.value === 'alipay' ? 'alipay' : 'tenpay'
    const response = await threeAnalysisService.payForTask({
      payType,
      taskId: currentDownload.value.taskId
    })

    if ((response.code === 0 || response.code === 200) && response.data) {
      qrCodeUrl.value = response.data.qr_pic_url || response.data.qr_code_url || ''
      tradeNo.value = response.data.trade_no

      showQRCode.value = true
      paying.value = false

      ElMessage.success('请使用' + (payType === 'alipay' ? '支付宝' : '微信') + '扫码支付')
    } else {
      throw new Error(response.msg || '获取支付二维码失败')
    }
  } catch (error: any) {
    console.error('支付失败:', error)
    paying.value = false
    showQRCode.value = false
    ElMessage.error(error.message || '支付失败，请重试')
  }
}

// 处理二维码图片加载错误
const handleImageError = (event: Event) => {
  console.error('二维码图片加载失败:', qrCodeUrl.value)
  ElMessage.error('二维码图片加载失败，请重试')
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

// 支付成功标签淡入动画
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
:deep(.el-dialog) {
  border-radius: 16px;

  .el-dialog__header {
    background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
    border-radius: 16px 16px 0 0;
    padding: 20px 24px;
    border-bottom: 2px solid #e7f0ff;
  }

  .el-dialog__title {
    font-weight: 600;
    color: #0F4C81;
    font-size: 18px;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .payment-container {
    .payment-info {
      background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 2px solid #e7f0ff;

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        &.price-item {
          padding-top: 12px;
          border-top: 2px solid #e7f0ff;
          margin-top: 12px;
        }

        .label {
          color: #6c757d;
          font-weight: 500;
        }

        .value {
          color: #2c3e50;
          font-weight: 600;

          &.price {
            color: #0F4C81;
            font-size: 20px;
          }
        }
      }
    }

    .payment-methods {
      margin-bottom: 30px;

      .method-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 15px;
      }

      .payment-options {
        width: 100%;

        :deep(.el-radio) {
          width: 100%;
          margin-right: 0;
          margin-bottom: 12px;
          padding: 16px;
          border: 2px solid rgba(15, 76, 129, 0.1);
          border-radius: 10px;
          transition: all 0.3s;

          &:hover {
            border-color: rgba(15, 76, 129, 0.3);
            background: rgba(15, 76, 129, 0.02);
          }

          &.is-checked {
            border-color: #0F4C81;
            background: rgba(15, 76, 129, 0.05);
          }
        }

        .payment-option {
          .option-content {
            display: flex;
            align-items: center;
            gap: 12px;

            .payment-icon {
              width: 40px;
              height: 40px;
              object-fit: contain;
              border-radius: 8px;
            }

            span {
              font-size: 15px;
              font-weight: 600;
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

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
    border-radius: 0 0 16px 16px;

    .el-button {
      border-radius: 10px;
      font-weight: 600;
      padding: 10px 24px;

      &--primary {
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
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

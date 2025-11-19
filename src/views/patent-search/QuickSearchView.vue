<template>
  <div class="quick-search-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('patentSearch.title') }}</h1>
      <p class="page-subtitle">{{ $t('patentSearch.subtitle') }}</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <template #header>
        <span>{{ $t('patentSearch.searchConditions') }}</span>
      </template>

      <el-form :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item :label="$t('patentSearch.patentTitle')" required>
          <el-input v-model="searchForm.title" type="text" :placeholder="$t('patentSearch.pleaseEnterTitle')" clearable
            maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('patentSearch.technicalSolution')" required>
          <el-input v-model="searchForm.keyword" type="textarea" :rows="6"
            :placeholder="$t('patentSearch.pleaseEnterSolution')" clearable maxlength="10000" show-word-limit
            resize="vertical" />
        </el-form-item>

        <el-form-item>
          <div class="search-actions">
            <el-button type="primary" size="large" :loading="searching" @click="handleSearch"
              :disabled="!searchForm.title.trim() || !searchForm.keyword.trim()">
              {{ searching ? $t('patentSearch.searching') : $t('patentSearch.startSearch') }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 快捷搜索建议 -->
        <!-- <div class="search-suggestions">
          <span class="suggestions-label">{{ $t('patentSearch.tryExample') }}</span>
          <el-tag v-for="suggestion in searchSuggestions" :key="suggestion" class="suggestion-tag"
            @click="searchForm.keyword = suggestion">
            {{ suggestion }}
          </el-tag>
        </div> -->
      </el-form>
    </el-card>

    <!-- 检索历史列表 -->
    <el-card class="results-card">
      <template #header>
        <div class="results-header">
          <span>{{ $t('patentSearch.searchHistory') }}</span>
          <div class="results-info">
            <span class="results-count">{{ $t('patentSearch.totalRecords', { count: total }) }}</span>
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
                    <span>{{ $t('patentSearch.imageLoadFailed') }}</span>
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
                <span>{{ $t('patentSearch.clickToEnlarge') }}</span>
              </div>
            </div>

            <!-- 专利内容区域 -->
            <div class="patent-info">
              <div class="patent-header">
                <h3 class="patent-title">{{ getPatentTitle(patent) }}</h3>
                <div class="patent-status">
                  <el-tag :type="getStatusType((patent as any).state)">
                    {{ getStatusText((patent as any).state) }}
                  </el-tag>
                  <el-tag v-if="isPaid(patent)" type="success" class="payment-tag" size="small">
                    <el-icon :size="14">
                      <CircleCheck />
                    </el-icon>
                    <span>{{ $t('patentSearch.paid') }}</span>
                  </el-tag>
                </div>
              </div>

              <div class="patent-meta">

                <span class="meta-item">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  {{ formatDate(patent.publicationDate) }}
                </span>

              </div>

              <div class="patent-abstract">
                <p>{{ getAbstractSummary(patent.abstract) }}</p>
              </div>

              <div class="patent-actions" @click.stop>
                <el-button size="small" text @click="handleDownloadClick(patent, 'pdf')"
                  :disabled="(patent as any).state !== 1">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentSearch.downloadPDF') }}
                </el-button>
                <el-button size="small" text @click="handleDownloadClick(patent, 'word')"
                  :disabled="(patent as any).state !== 1">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentSearch.downloadWord') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && patentList.length === 0" class="empty-state">
          <el-empty :description="$t('patentSearch.noHistory')">
            <el-button type="primary" @click="searchForm.keyword = ''; handleSearch()">
              {{ $t('patentSearch.startSearch') }}
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
import { ElMessage } from 'element-plus'
import { Document, User, Calendar, Collection, Star, StarFilled, View, Download, Picture, Loading, ZoomIn, CircleCheck } from '@element-plus/icons-vue'
import { usePatentSearchStore } from '@/stores/patentSearch'
import { formatDate } from '@/utils'
import type { Patent } from '@/types'
import { useI18n } from 'vue-i18n'
import { patentSearchService } from '@/services/patentSearch'

// Composables
const router = useRouter()
const patentSearchStore = usePatentSearchStore()
const { locale, t } = useI18n()

// 响应式数据
const loading = ref(false)
const hasSearched = ref(false)

// 支付相关
const paymentDialogVisible = ref(false)
const paymentMethod = ref('alipay')
const showQRCode = ref(false)
const paying = ref(false)
const qrCodeUrl = ref('') // 二维码图片URL
const tradeNo = ref('') // 订单编号
const currentDownload = ref({
  patent: null as Patent | null,
  format: 'pdf' as 'pdf' | 'word',
  title: '',
  taskId: '' // 任务ID
})

const searchForm = reactive({
  title: '',
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
  // 验证两个字段都必填
  const titleText = searchForm.title.trim()
  const keywordText = searchForm.keyword.trim()

  if (!titleText) {
    ElMessage.warning(t('patentSearch.pleaseEnterTitle'))
    return
  }

  if (!keywordText) {
    ElMessage.warning(t('patentSearch.pleaseEnterSolution'))
    return
  }

  hasSearched.value = true
  pagination.page = 1

  try {
    // 合并专利标题和技术方案
    let combinedContent = ''
    if (titleText && keywordText) {
      combinedContent = `${titleText}\n${keywordText}`
    } else if (titleText) {
      combinedContent = titleText
    } else {
      combinedContent = keywordText
    }

    await patentSearchStore.quickSearch(combinedContent, {
      page: pagination.page,
      pageSize: pagination.pageSize,
      language: locale.value
    })
    // 检索成功后加载历史记录
    await loadSearchHistory()
  } catch (error: any) {
    ElMessage.error(error.message || t('patentSearch.searchFailed'))
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
    if (error?.message !== t('common.loginExpired')) {
      ElMessage.error(error.message || t('patentSearch.loadHistoryFailed'))
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
      return t('patentSearch.completed')
    case 0:
      return t('patentSearch.generating')
    case 2:
      return t('patentSearch.failed')
    default:
      return t('common.unknown')
  }
}

// 获取专利标题（实时翻译）
const getPatentTitle = (patent: Patent): string => {
  const originalTitle = patent.title

  // 如果标题是纯的报告文本（没有关键词），直接返回翻译
  const reportTexts = [
    '专利检索报告',
    'Patent Search Report',
    '特許検索レポート',
    'Patentsuchbericht',
    'Rapport de recherche de brevet',
    'Отчет по поиску патентов',
    'تقرير البحث عن براءات الاختراع'
  ]

  // 检查是否为纯报告文本
  if (reportTexts.includes(originalTitle)) {
    return t('patentSearch.patentSearchReport')
  }

  // 否则，标题应该是关键词前缀，组合为：关键词 + 报告文本
  return `${originalTitle} ${t('patentSearch.patentSearchReport')}`
}

const handlePageChange = async () => {
  const titleText = searchForm.title.trim()
  const keywordText = searchForm.keyword.trim()

  if (!titleText || !keywordText) return

  try {
    // 合并专利标题和技术方案
    let combinedContent = ''
    if (titleText && keywordText) {
      combinedContent = `${titleText}\n${keywordText}`
    } else if (titleText) {
      combinedContent = titleText
    } else {
      combinedContent = keywordText
    }

    await patentSearchStore.quickSearch(combinedContent, {
      page: pagination.page,
      pageSize: pagination.pageSize
    })
  } catch (error: any) {
    ElMessage.error(t('common.loadFailed'))
  }
}

const handleSizeChange = () => {
  pagination.page = 1
  handlePageChange()
}

const getAbstractSummary = (abstract: string): string => {
  return abstract.length > 200 ? abstract.substring(0, 200) + '...' : abstract
}

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (patent: Patent): boolean => {
  const state = (patent as any).state
  const pdfUrl = (patent as any).pdfUrl
  const wordUrl = (patent as any).wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
}

// 点击下载按钮，弹出支付窗口
const handleDownloadClick = (patent: Patent, format: 'pdf' | 'word') => {
  // 检查是否已经支付（state=1 且有文件URL）
  const fileUrl = format === 'pdf' ? (patent as any).pdfUrl : (patent as any).wordUrl

  if ((patent as any).state === 1 && fileUrl) {
    // 已支付，直接下载
    downloadReport(patent, format)
    return
  }

  // 未支付，显示支付窗口
  const taskId = (patent as any).taskId

  console.log('=== 准备支付 - 专利检索 ===')
  console.log('patent对象:', JSON.parse(JSON.stringify(patent)))
  console.log('taskId:', taskId)
  console.log('id:', patent.id)
  console.log('==========================')

  if (!taskId) {
    ElMessage.error(t('patentSearch.taskIdEmpty'))
    return
  }

  currentDownload.value = {
    patent,
    format,
    title: getPatentTitle(patent),
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
    const response = await patentSearchService.payForTask({
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

// 处理二维码图片加载错误
const handleImageError = (event: Event) => {
  console.error('二维码图片加载失败:', qrCodeUrl.value)
  ElMessage.error(t('patentSearch.qrCodeLoadFailed'))
}

// 下载报告
const downloadReport = async (patent: Patent, format: 'pdf' | 'word' = 'pdf') => {
  try {
    // 检查是否有对应的文件URL
    const fileUrl = format === 'pdf' ? (patent as any).pdfUrl : (patent as any).wordUrl
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
      const fileName = `${patent.title}_${t('common.patent')}.${extension}`
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

<template>
  <div class="quick-search-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-icon-wrapper">
        <el-icon :size="40">
          <Search />
        </el-icon>
      </div>
      <div class="header-content">
        <h1 class="page-title">{{ $t('patentSearch.title') }}</h1>
        <p class="page-subtitle">{{ $t('patentSearch.subtitle') }}</p>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <template #header>
        <div class="card-header-content">
          <el-icon :size="20">
            <Edit />
          </el-icon>
          <span>{{ $t('patentSearch.searchConditions') }}</span>
        </div>
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
              :disabled="!searchForm.title.trim() || !searchForm.keyword.trim()" class="search-btn">
              <el-icon :size="20">
                <Search />
              </el-icon>
              <span>{{ searching ? $t('patentSearch.searching') : $t('patentSearch.startSearch') }}</span>
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
          <div class="header-title-group">
            <el-icon :size="20">
              <Document />
            </el-icon>
            <span>{{ $t('patentSearch.searchHistory') }}</span>
          </div>
          <div class="results-info">
            <div class="results-count-badge">
              <el-icon :size="16">
                <DataAnalysis />
              </el-icon>
              <span>{{ $t('patentSearch.totalRecords', { count: total }) }}</span>
            </div>
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
                <div class="patent-status-group">
                  <!-- 生成状态 -->
                  <el-tag :type="getStatusType((patent as any).state)" class="status-tag">
                    {{ getStatusText((patent as any).state) }}
                  </el-tag>
                  <!-- 支付状态 -->
                  <el-tag v-if="isPaid(patent)" type="success" class="payment-tag">
                    <el-icon :size="14">
                      <CircleCheck />
                    </el-icon>
                    <span>已支付</span>
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
                <el-button size="small" class="action-btn pdf-btn" @click="handleDownloadClick(patent, 'pdf')"
                  :disabled="(patent as any).state !== 1">
                  <el-icon :size="16">
                    <Download />
                  </el-icon>
                  <span>{{ $t('patentSearch.downloadPDF') }}</span>
                </el-button>
                <el-button size="small" class="action-btn word-btn" @click="handleDownloadClick(patent, 'word')"
                  :disabled="(patent as any).state !== 1">
                  <el-icon :size="16">
                    <Download />
                  </el-icon>
                  <span>{{ $t('patentSearch.downloadWord') }}</span>
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
                <span>微信支付</span>
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
import { ElMessage } from 'element-plus'
import { Document, User, Calendar, Collection, Star, StarFilled, View, Download, Picture, Loading, ZoomIn, Search, Edit, DataAnalysis, ChatDotSquare, Wallet, CircleCheck } from '@element-plus/icons-vue'
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

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (patent: Patent): boolean => {
  const state = (patent as any).state
  const pdfUrl = (patent as any).pdfUrl
  const wordUrl = (patent as any).wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
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
  // 获取taskId（从专利的applicationNumber字段）
  const taskId = (patent as any).applicationNumber || patent.id

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
    ElMessage.error('任务ID为空，无法支付')
    return
  }

  paying.value = true

  try {
    // 调用支付接口
    const payType = paymentMethod.value === 'alipay' ? 'alipay' : 'tenpay'
    const response = await patentSearchService.payForTask({
      payType,
      taskId: currentDownload.value.taskId
    })

    console.log('支付响应:', response)

    if ((response.code === 0 || response.code === 200) && response.data) {
      // 获取二维码URL
      // 根据后端返回，两种支付方式都使用 qr_pic_url
      qrCodeUrl.value = response.data.qr_pic_url || response.data.qr_code_url || ''
      tradeNo.value = response.data.trade_no

      console.log('二维码URL:', qrCodeUrl.value)
      console.log('订单号:', tradeNo.value)

      // 显示二维码
      showQRCode.value = true
      paying.value = false

      ElMessage.success('请使用' + (payType === 'alipay' ? '支付宝' : '微信') + '扫码支付')

      // TODO: 需要实现支付状态轮询，当支付成功后关闭弹窗并刷新列表
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;

  @media (max-width: 768px) {
    padding: 16px;
  }

  .page-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 32px;
    padding: 32px;
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    border-radius: 20px;
    box-shadow: 0 8px 24px rgba(15, 76, 129, 0.2);

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      padding: 24px;
    }

    .header-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      @media (max-width: 768px) {
        width: 64px;
        height: 64px;
      }
    }

    .header-content {
      flex: 1;
      color: #fff;

      .page-title {
        font-size: 32px;
        font-weight: 700;
        color: #fff;
        margin: 0 0 8px 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        @media (max-width: 768px) {
          font-size: 24px;
        }
      }

      .page-subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin: 0;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

        @media (max-width: 768px) {
          font-size: 14px;
        }
      }
    }
  }

  .search-card {
    margin-bottom: 32px;
    border-radius: 16px;
    border: 2px solid rgba(15, 76, 129, 0.1);
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: rgba(15, 76, 129, 0.2);
      box-shadow: 0 8px 24px rgba(15, 76, 129, 0.12);
    }

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
      border-bottom: 2px solid rgba(15, 76, 129, 0.1);
      padding: 20px 24px;

      .card-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        font-weight: 600;
        color: #0F4C81;

        .el-icon {
          color: #6A5ACD;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 32px;

      @media (max-width: 768px) {
        padding: 20px;
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 15px;
    }

    :deep(.el-input__wrapper) {
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(15, 76, 129, 0.05);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.1);
      }

      &.is-focus {
        box-shadow: 0 4px 16px rgba(106, 90, 205, 0.2);
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(15, 76, 129, 0.05);
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.1);
      }

      &:focus {
        box-shadow: 0 4px 16px rgba(106, 90, 205, 0.2);
      }
    }

    .search-actions {
      display: flex;
      justify-content: center;
      padding-top: 24px;

      .search-btn {
        min-width: 200px;
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 24px;
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        border: none;
        box-shadow: 0 4px 16px rgba(15, 76, 129, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 76, 129, 0.4);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
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
    border-radius: 16px;
    border: 2px solid rgba(15, 76, 129, 0.1);
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
      border-bottom: 2px solid rgba(15, 76, 129, 0.1);
      padding: 20px 24px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        font-weight: 600;
        color: #0F4C81;

        .el-icon {
          color: #6A5ACD;
        }
      }

      .results-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .results-count-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(106, 90, 205, 0.08) 100%);
          border-radius: 20px;
          color: #0F4C81;
          font-size: 14px;
          font-weight: 600;

          .el-icon {
            color: #6A5ACD;
          }
        }
      }
    }

    .results-content {
      :deep(.el-card__body) {
        padding: 24px;

        @media (max-width: 768px) {
          padding: 16px;
        }
      }

      .patent-list {
        .patent-item {
          display: flex;
          gap: 24px;
          padding: 24px;
          background: #fff;
          border-radius: 16px;
          margin-bottom: 20px;
          border: 2px solid rgba(15, 76, 129, 0.08);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            border-color: rgba(15, 76, 129, 0.2);
            box-shadow: 0 8px 24px rgba(15, 76, 129, 0.15);
            transform: translateY(-4px);
          }

          &:last-child {
            margin-bottom: 0;
          }

          // 首页图片区域
          .patent-image {
            position: relative;
            flex-shrink: 0;
            width: 280px;
            height: 210px;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            border: 2px solid rgba(15, 76, 129, 0.1);
            box-shadow: 0 4px 12px rgba(15, 76, 129, 0.1);
            transition: all 0.3s;

            &:hover {
              box-shadow: 0 8px 20px rgba(15, 76, 129, 0.2);
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
              color: #999;
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);

              .el-icon {
                font-size: 48px;
                margin-bottom: 12px;
                color: rgba(15, 76, 129, 0.3);
              }

              span {
                font-size: 13px;
                color: #999;
              }
            }

            .image-loading {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);

              .el-icon {
                font-size: 32px;
                color: #6A5ACD;
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
              gap: 8px;
              background: linear-gradient(135deg, rgba(15, 76, 129, 0.9) 0%, rgba(106, 90, 205, 0.9) 100%);
              color: white;
              opacity: 0;
              transition: opacity 0.3s;
              pointer-events: none;

              .el-icon {
                font-size: 32px;
              }

              span {
                font-size: 14px;
                font-weight: 500;
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
            display: flex;
            flex-direction: column;
          }

          .patent-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 2px solid rgba(15, 76, 129, 0.08);

            .patent-title {
              font-size: 20px;
              font-weight: 700;
              color: #1a1a1a;
              margin: 0;
              flex: 1;
              line-height: 1.4;
              background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            .patent-status-group {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-left: 16px;
              flex-shrink: 0;

              .status-tag,
              .payment-tag {
                border-radius: 12px;
                padding: 6px 14px;
                font-weight: 600;
                border: none;
              }

              .status-tag {
                :deep(&.el-tag--success) {
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: #fff;
                }

                :deep(&.el-tag--warning) {
                  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                  color: #fff;
                }

                :deep(&.el-tag--danger) {
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  color: #fff;
                }
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
            }
          }

          .patent-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 16px;
            flex-wrap: wrap;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
              color: #666;
              font-size: 14px;
              padding: 6px 12px;
              background: linear-gradient(135deg, rgba(15, 76, 129, 0.05) 0%, rgba(106, 90, 205, 0.05) 100%);
              border-radius: 8px;

              .el-icon {
                font-size: 14px;
                color: #6A5ACD;
              }
            }
          }

          .patent-abstract {
            margin-bottom: 16px;
            flex: 1;

            p {
              color: #666;
              line-height: 1.8;
              font-size: 14px;
              margin: 0;
            }
          }

          .patent-actions {
            display: flex;
            gap: 12px;
            padding-top: 16px;
            border-top: 2px solid rgba(15, 76, 129, 0.08);

            .action-btn {
              padding: 8px 16px;
              border-radius: 10px;
              font-weight: 600;
              font-size: 14px;
              border: 2px solid transparent;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              gap: 6px;

              &.pdf-btn {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
                color: #dc2626;
                border-color: rgba(220, 38, 38, 0.2);

                &:hover:not(:disabled) {
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  color: #fff;
                  border-color: #dc2626;
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
                }

                &:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }
              }

              &.word-btn {
                background: linear-gradient(135deg, rgba(15, 76, 129, 0.1) 0%, rgba(106, 90, 205, 0.1) 100%);
                color: #0F4C81;
                border-color: rgba(15, 76, 129, 0.2);

                &:hover:not(:disabled) {
                  background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
                  color: #fff;
                  border-color: #0F4C81;
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
                }

                &:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }
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
        padding: 80px 0;
        text-align: center;

        :deep(.el-empty) {
          .el-empty__image {
            svg {
              fill: #6A5ACD;
            }
          }

          .el-empty__description {
            color: #666;
            font-size: 16px;
            margin-top: 16px;
          }

          .el-button {
            margin-top: 24px;
            min-width: 160px;
            height: 44px;
            border-radius: 22px;
            background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
            border: none;
            font-weight: 600;
            box-shadow: 0 4px 16px rgba(15, 76, 129, 0.3);
            transition: all 0.3s;

            &:hover {
              background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(15, 76, 129, 0.4);
            }
          }
        }
      }

      .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding: 32px 0 16px;
        margin-top: 24px;
        border-top: 2px solid rgba(15, 76, 129, 0.08);

        :deep(.el-pagination) {

          .btn-prev,
          .btn-next,
          .el-pager li {
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;

            &:hover {
              color: #6A5ACD;
              background: linear-gradient(135deg, rgba(15, 76, 129, 0.1) 0%, rgba(106, 90, 205, 0.1) 100%);
            }

            &.is-active {
              background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
              color: #fff;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-search-container {
    .results-card .results-content .patent-list .patent-item {
      flex-direction: column;
      padding: 20px;

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
        gap: 8px;

        .meta-item {
          width: fit-content;
        }
      }

      .patent-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .patent-status {
          margin-left: 0;
        }
      }

      .patent-actions {
        flex-direction: column;
        gap: 8px;

        .action-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .results-header {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start !important;

      .results-info {
        width: 100%;
      }
    }

    .pagination-wrapper {
      :deep(.el-pagination) {

        .el-pagination__sizes,
        .el-pagination__jump {
          display: none;
        }
      }
    }
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
    }

    .payment-options {
      display: flex;
      gap: 16px;
      width: 100%;

      :deep(.el-radio) {
        flex: 1;
        margin: 0;
        padding: 0;

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
        }
      }

      .payment-option {
        .option-content {
          display: flex;
          align-items: center;
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
    margin-top: 20px;
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

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
    padding: 20px 24px;
    margin: 0;

    .el-dialog__title {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: #fff;
        font-size: 20px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(15, 76, 129, 0.1);

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .el-button {
        min-width: 100px;
        border-radius: 8px;
        font-weight: 600;

        &.el-button--primary {
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border: none;

          &:hover {
            background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
          }
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
</style>

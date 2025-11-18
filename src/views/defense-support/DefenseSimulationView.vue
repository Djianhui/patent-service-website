<template>
  <div class="defense-simulation-container">
    <!-- 页面头部横幅 -->
    <div class="page-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <el-icon :size="48">
            <ChatDotSquare />
          </el-icon>
        </div>
        <div class="banner-text">
          <h1 class="page-title">答辩支持</h1>
          <p class="page-subtitle">AI智能生成审查意见通知书与答辩意见回复，专业高效</p>
        </div>
      </div>
    </div>

    <!-- 功能选择区域 -->
    <el-card class="function-select-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon">
            <Grid />
          </el-icon>
          <span class="header-title">选择功能类型</span>
        </div>
      </template>
      <el-radio-group v-model="selectedFunction" size="large" class="function-group">
        <el-radio-button :label="0" class="function-option">
          <div class="option-content">
            <div class="option-icon simulation">
              <el-icon :size="28">
                <DocumentChecked />
              </el-icon>
            </div>
            <div class="option-text">
              <span class="option-title">模拟审查</span>
              <span class="option-desc">生成审查意见通知书</span>
            </div>
          </div>
        </el-radio-button>
        <el-radio-button :label="1" class="function-option">
          <div class="option-content">
            <div class="option-icon defense">
              <el-icon :size="28">
                <EditPen />
              </el-icon>
            </div>
            <div class="option-text">
              <span class="option-title">答辩意见回复</span>
              <span class="option-desc">生成答辩策略文件</span>
            </div>
          </div>
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon">
            <UploadFilled />
          </el-icon>
          <span class="header-title">专利文件上传</span>
          <span class="header-tip">支持 PDF、DOC、DOCX 格式，单个文件不超过 10MB</span>
        </div>
      </template>

      <div class="upload-area">
        <el-upload ref="uploadRef" class="upload-dragger" drag :auto-upload="false" :show-file-list="false"
          accept=".pdf,.doc,.docx" :on-change="handleFileChange" :before-upload="beforeUpload">
          <div class="upload-content">
            <div class="upload-icon">
              <el-icon :size="64">
                <UploadFilled />
              </el-icon>
            </div>
            <div class="upload-text">
              <p class="upload-title">拖拽文件到此处，或点击上传</p>
              <p class="upload-hint">支持 PDF、DOC、DOCX 格式</p>
            </div>
          </div>
        </el-upload>

        <div v-if="uploadedFiles.length > 0" class="file-list">
          <div class="file-list-header">
            <span class="file-count">已上传 {{ uploadedFiles.length }} 个文件</span>
            <el-button text size="small" @click="uploadedFiles = []">
              <el-icon>
                <Delete />
              </el-icon>
              清空全部
            </el-button>
          </div>
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <div class="file-icon">
              <el-icon :size="24">
                <Document />
              </el-icon>
            </div>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <el-button class="file-remove" circle size="small" @click="removeFile(index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </div>

        <div class="description-area">
          <div class="description-header">
            <el-icon>
              <Edit />
            </el-icon>
            <span>任务描述</span>
            <span class="optional-tag">（可选）</span>
          </div>
          <el-input v-model="defenseDescription" type="textarea" :rows="4"
            :placeholder="selectedFunction === 0 ? '请描述需要模拟审查的重点内容（可选）...' : '请输入答辩信息描述...'" maxlength="1000"
            show-word-limit class="description-input" />
        </div>

        <div v-if="uploadedFiles.length > 0" class="upload-actions">
          <el-button type="primary" size="large" :loading="uploading" @click="startDefenseTask" class="submit-button">
            <el-icon v-if="!uploading">
              <Promotion />
            </el-icon>
            {{ uploading ? '正在处理中...' : (selectedFunction === 0 ? '开始模拟审查' : '生成答辩意见') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 审查记录列表 -->
    <el-card class="simulation-list-card">
      <template #header>
        <div class="list-header">
          <span>任务记录</span>
          <div class="list-actions">
            <el-input v-model="searchKeyword" placeholder="搜索..." clearable @input="handleSearch"
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
              <el-option label="已完成" value="1" />
              <el-option label="生成中" value="0" />
              <el-option label="失败" value="2" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 任务记录列表 -->
        <div class="defense-list">
          <div v-for="item in defenseList" :key="item.id" class="defense-item">
            <div class="defense-header">
              <div class="defense-info">
                <h3 class="defense-title">

                  {{ item.functionType === 0 ? '模拟审查' : '答辩意见回复' }}
                </h3>
                <div class="defense-meta">
                  <span class="meta-item">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                    {{ formatDate(item.createTime) }}
                  </span>
                  <!-- <span class="meta-item">
                    <el-icon>
                      <Document />
                    </el-icon>
                    {{ item.fileUrls ? item.fileUrls.length : 0 }} 个文件
                  </span> -->
                </div>
              </div>
              <div class="defense-actions">
                <el-tag :type="item.state === 1 ? 'success' : (item.state === 0 ? 'warning' : 'danger')" size="small">
                  {{ item.state === 1 ? '已完成' : (item.state === 0 ? '生成中' : '失败') }}
                </el-tag>
                <el-tag v-if="isPaid(item)" type="success" class="payment-tag" size="small">
                  <el-icon :size="14">
                    <CircleCheck />
                  </el-icon>
                  <span>已支付</span>
                </el-tag>
                <el-button size="small" text @click.stop="handleDownloadClick(item, 'pdf')"
                  :disabled="item.state !== 1">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载PDF
                </el-button>
                <el-button size="small" text @click.stop="handleDownloadClick(item, 'word')"
                  :disabled="item.state !== 1">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载Word
                </el-button>
              </div>
            </div>

            <!-- 图片展示 - 全新设计 -->
            <div class="defense-preview-section" v-if="item.firstImgUrl">
              <div class="preview-container">
                <div class="preview-image-wrapper">
                  <el-image :src="item.firstImgUrl" fit="cover" loading="lazy" :preview-src-list="[item.firstImgUrl]"
                    :initial-index="0" preview-teleported :z-index="3000" class="preview-image">
                    <template #placeholder>
                      <div class="image-placeholder">
                        <el-icon :size="48">
                          <Picture />
                        </el-icon>
                        <span>加载中...</span>
                      </div>
                    </template>
                    <template #error>
                      <div class="image-error">
                        <el-icon :size="40">
                          <Picture />
                        </el-icon>
                        <span>图片加载失败</span>
                      </div>
                    </template>
                  </el-image>

                  <!-- 交互图层 -->
                  <div class="preview-overlay">
                    <div class="overlay-content">
                      <div class="overlay-icon">
                        <el-icon :size="40">
                          <ZoomIn />
                        </el-icon>
                      </div>
                      <p class="overlay-text">点击预览完整图片</p>
                    </div>
                  </div>

                  <!-- 角标 -->
                  <div class="preview-badge">
                    <el-icon>
                      <DocumentChecked />
                    </el-icon>
                    <span>报告预览</span>
                  </div>
                </div>

                <!-- 图片信息卡片 -->
                <div class="preview-info-card">
                  <div class="info-item">
                    <el-icon class="info-icon">
                      <Document />
                    </el-icon>
                    <div class="info-content">
                      <span class="info-label">生成结果</span>
                      <span class="info-value">{{ item.functionType === 0 ? '审查意见通知书' : '答辩意见回复' }}</span>
                    </div>
                  </div>
                  <div class="info-divider"></div>
                  <div class="info-item">
                    <el-icon class="info-icon">
                      <Calendar />
                    </el-icon>
                    <div class="info-content">
                      <span class="info-label">生成时间</span>
                      <span class="info-value">{{ formatDate(item.createTime, 'MM-DD HH:mm') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 描述信息 -->
            <div class="defense-description" v-if="item.description">
              <p>{{ item.description.length > 150 ? item.description.substring(0, 150) + '...' : item.description }}</p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && defenseList.length === 0" class="empty-state">
          <el-empty description="暂无任务记录">
            <p>上传专利文件开始首次任务</p>
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
                <LoadingIcon class="is-loading" />
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
                <LoadingIcon class="is-loading" />
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
  Download,
  DocumentChecked,
  EditPen,
  Picture,
  Loading as LoadingIcon,
  ZoomIn,
  ChatDotSquare,
  Grid,
  Edit,
  Promotion,
  CircleCheck
} from '@element-plus/icons-vue'
import { defenseSupportService, DefenseFunctionType } from '@/services/defenseSupport'
import { formatDate } from '@/utils'

// Composables
const router = useRouter()

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const selectedFunction = ref<DefenseFunctionType>(DefenseFunctionType.SIMULATION_REVIEW)
const uploadedFiles = ref<Array<{ file: File; url: string; name: string; size: number }>>([])
const defenseDescription = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')
const defenseList = ref<any[]>([])
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
  item: null as any,
  format: 'pdf' as 'pdf' | 'word',
  title: '',
  taskId: ''
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const result = await defenseSupportService.getDefenseList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      state: statusFilter.value ? parseInt(statusFilter.value) : undefined
    })

    console.log('=== 前端接收到的数据 ===')
    console.log('result.data:', result.data)
    result.data.forEach((item, index) => {
      console.log(`第${index + 1}条数据:`, {
        id: item.id,
        functionType: item.functionType,
        functionType类型: typeof item.functionType,
        判断结果: item.functionType === 0 ? '模拟审查' : '答辩意见回复'
      })
    })
    console.log('========================')

    defenseList.value = result.data
    total.value = result.total
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== '登录已过期') {
      ElMessage.error(error.message || '加载数据失败')
    }
  } finally {
    loading.value = false
  }
}

const handleFileChange = async (file: any) => {
  const rawFile = file.raw

  // 验证文件
  const isValidFormat = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(rawFile.type)
  const isValidSize = rawFile.size / 1024 / 1024 < 10

  if (!isValidFormat) {
    ElMessage.error('只支持 PDF、DOC、DOCX 格式的文件！')
    return
  }
  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 10MB！')
    return
  }

  // 上传文件到服务器
  try {
    ElMessage.info('正在上传文件...')
    const url = await defenseSupportService.uploadFile(rawFile)

    uploadedFiles.value.push({
      file: rawFile,
      url: url,
      name: rawFile.name,
      size: rawFile.size
    })

    ElMessage.success('文件上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '文件上传失败')
  }
}

const beforeUpload = (file: File) => {
  return false // 阻止自动上传
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const startDefenseTask = async () => {
  if (uploadedFiles.value.length === 0) {
    ElMessage.warning('请先上传专利文件')
    return
  }

  uploading.value = true
  try {
    const fileUrls = uploadedFiles.value.map(f => f.url)

    // 如果没有输入描述，根据功能类型给一个默认值
    let promptText = defenseDescription.value.trim()
    if (!promptText) {
      promptText = selectedFunction.value === DefenseFunctionType.SIMULATION_REVIEW
        ? '上传文件'
        : '上传文件'
    }

    await defenseSupportService.createDefenseTask({
      functionType: selectedFunction.value,
      fileUrls: fileUrls,
      prompt: promptText
    })

    const taskName = selectedFunction.value === DefenseFunctionType.SIMULATION_REVIEW ? '模拟审查' : '答辩意见回复'
    ElMessage.success(`${taskName}任务已提交，请在列表中查看结果`)

    // 清空表单
    uploadedFiles.value = []
    defenseDescription.value = ''

    // 刷新列表
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '任务提交失败')
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

// 判断是否已支付（state=1 且有文件URL）
const isPaid = (item: any): boolean => {
  const state = item.state
  const pdfUrl = item.pdfUrl
  const wordUrl = item.wordUrl
  return state === 1 && (!!pdfUrl || !!wordUrl)
}

// 点击下载按钮，弹出支付窗口
const handleDownloadClick = (item: any, format: 'pdf' | 'word') => {
  // 检查是否已经支付（state=1 且有文件URL）
  const fileUrl = format === 'pdf' ? item.pdfUrl : item.wordUrl

  if (item.state === 1 && fileUrl) {
    // 已支付，直接下载
    if (format === 'pdf') {
      downloadPDF(item)
    } else {
      downloadWord(item)
    }
    return
  }

  // 未支付，显示支付窗口
  const taskId = item.taskId

  console.log('=== 准备支付 - 答辩支持 ===')
  console.log('item对象:', JSON.parse(JSON.stringify(item)))
  console.log('taskId:', taskId)
  console.log('id:', item.id)
  console.log('functionType:', item.functionType)
  console.log('==========================')

  if (!taskId) {
    ElMessage.error('任务ID为空，无法支付')
    return
  }

  currentDownload.value = {
    item,
    format,
    title: item.functionType === 0 ? '模拟审查' : '答辩意见回复',
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
    const response = await defenseSupportService.payForTask({
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

const downloadPDF = (item: any) => {
  if (!item.pdfUrl) {
    ElMessage.warning('该任务暂无PDF文件')
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
    link.href = item.pdfUrl
    link.download = `${item.taskName || '答辩模拟'}_结果.pdf`
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
      window.open(item.pdfUrl, '_blank')
    }, 500)
  }
}

const downloadWord = (item: any) => {
  if (!item.wordUrl) {
    ElMessage.warning('该任务暂无Word文件')
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
    link.href = item.wordUrl
    link.download = `${item.taskName || '答辩模拟'}_结果.docx`
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
      window.open(item.wordUrl, '_blank')
    }, 500)
  }
}

// 工具方法
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.defense-simulation-container {
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

  .function-select-card {
    margin-bottom: var(--spacing-lg);
    border-radius: 16px;
    border: 2px solid #e7f0ff;
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
      border-bottom: 2px solid #d5e5ff;
      padding: 20px 24px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #0F4C81;

        .header-icon {
          font-size: 20px;
        }
      }
    }

    .function-group {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding: 16px;
      flex-wrap: wrap;

      :deep(.el-radio-button) {
        flex: 1;
        max-width: 400px;

        .el-radio-button__inner {
          width: 100%;
          padding: 0;
          border: 2px solid #e7f0ff;
          border-radius: 12px;
          background: #fff;
          transition: all 0.3s ease;

          &:hover {
            border-color: #0F4C81;
            box-shadow: 0 4px 16px rgba(15, 76, 129, 0.12);
            transform: translateY(-2px);
          }
        }

        &.is-active .el-radio-button__inner {
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(15, 76, 129, 0.25);

          .option-icon {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
          }

          .option-title {
            color: #fff;
          }

          .option-desc {
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }

      .function-option {
        .option-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;

          .option-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;

            &.simulation {
              background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
              color: #0F4C81;
            }

            &.defense {
              background: linear-gradient(135deg, #f0e7ff 0%, #e5d5ff 100%);
              color: #6A5ACD;
            }
          }

          .option-text {
            flex: 1;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .option-title {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
              transition: all 0.3s ease;
            }

            .option-desc {
              font-size: 13px;
              color: #6c757d;
              transition: all 0.3s ease;
            }
          }
        }
      }
    }
  }

  .upload-card {
    margin-bottom: var(--spacing-lg);
    border-radius: 16px;
    border: 2px solid #e7f0ff;
    box-shadow: 0 4px 16px rgba(15, 76, 129, 0.08);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
      border-bottom: 2px solid #d5e5ff;
      padding: 20px 24px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .header-icon {
          font-size: 20px;
          color: #0F4C81;
        }

        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: #0F4C81;
          flex: 1;
        }

        .header-tip {
          font-size: 13px;
          color: #6A5ACD;
          font-weight: 500;
          padding: 4px 12px;
          background: rgba(106, 90, 205, 0.1);
          border-radius: 12px;
        }
      }
    }

    .upload-area {
      .upload-dragger {
        width: 100%;

        :deep(.el-upload-dragger) {
          padding: 48px 20px;
          border-radius: 16px;
          border: 2px dashed #d5e5ff;
          background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
          transition: all 0.3s ease;

          &:hover {
            border-color: #0F4C81;
            background: linear-gradient(135deg, #f0f4ff 0%, #e7f0ff 100%);

            .upload-icon {
              transform: scale(1.1);
              color: #0F4C81;
            }
          }
        }

        .upload-content {
          .upload-icon {
            color: #6A5ACD;
            margin-bottom: 16px;
            transition: all 0.3s ease;
          }

          .upload-text {
            .upload-title {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
              margin: 0 0 8px 0;
            }

            .upload-hint {
              font-size: 13px;
              color: #6c757d;
              margin: 0;
            }
          }
        }
      }

      .file-list {
        margin-top: var(--spacing-lg);

        .file-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
          border-radius: 12px 12px 0 0;
          border: 2px solid #e7f0ff;
          border-bottom: none;

          .file-count {
            font-size: 14px;
            font-weight: 600;
            color: #0F4C81;
          }

          .el-button {
            color: #6A5ACD;

            &:hover {
              color: #0F4C81;
            }
          }
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          margin-bottom: 0;
          border: 2px solid #e7f0ff;
          border-top: none;
          background: #fff;
          transition: all 0.3s ease;

          &:last-child {
            border-radius: 0 0 12px 12px;
          }

          &:hover {
            background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
            transform: translateX(4px);
          }

          .file-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0F4C81;
            flex-shrink: 0;
          }

          .file-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .file-name {
              font-weight: 600;
              font-size: 14px;
              color: #2c3e50;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .file-size {
              color: #6c757d;
              font-size: 12px;
            }
          }

          .file-remove {
            flex-shrink: 0;
            background: linear-gradient(135deg, #fee 0%, #fdd 100%);
            border-color: #fcc;
            color: #c33;

            &:hover {
              background: linear-gradient(135deg, #f88 0%, #f66 100%);
              border-color: #f44;
              color: #fff;
            }
          }
        }
      }

      .description-area {
        margin-top: var(--spacing-lg);

        .description-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0F4C81;

          .optional-tag {
            font-size: 12px;
            color: #6A5ACD;
            font-weight: 500;
          }
        }

        .description-input {
          :deep(.el-textarea__inner) {
            border-radius: 12px;
            border: 2px solid #e7f0ff;

            &:focus {
              border-color: #0F4C81;
            }
          }
        }
      }

      .upload-actions {
        text-align: center;
        margin-top: var(--spacing-lg);

        .submit-button {
          min-width: 200px;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 24px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          border: none;
          box-shadow: 0 6px 20px rgba(15, 76, 129, 0.3);
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(15, 76, 129, 0.4);
          }
        }
      }
    }
  }

  .simulation-list-card {
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
      flex-wrap: wrap;
      gap: var(--spacing-md);

      >span {
        font-size: 16px;
        font-weight: 600;
        color: #0F4C81;
      }

      .list-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .el-input {
          :deep(.el-input__wrapper) {
            border-radius: 20px;
            border: 2px solid #e7f0ff;

            &:hover,
            &.is-focus {
              border-color: #0F4C81;
            }
          }
        }

        .el-select {
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
    }

    .list-content {
      .defense-list {
        .defense-item {
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

          .defense-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);
            flex-wrap: wrap;
            gap: 16px;

            .defense-info {
              flex: 1;
              min-width: 200px;

              .defense-title {
                font-size: 18px;
                font-weight: 600;
                color: #0F4C81;
                margin: 0 0 12px 0;
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

              .defense-meta {
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
                    color: #6A5ACD;
                  }
                }
              }
            }

            .defense-actions {
              display: flex;
              gap: 8px;
              align-items: center;
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
              }
            }
          }

          .defense-preview-section {
            margin: var(--spacing-lg) 0;

            .preview-container {
              display: flex;
              gap: var(--spacing-lg);
              align-items: flex-start;

              @media (max-width: 900px) {
                flex-direction: column;
              }

              .preview-image-wrapper {
                position: relative;
                flex-shrink: 0;
                width: 380px;
                height: 280px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 24px rgba(15, 76, 129, 0.12);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);

                @media (max-width: 900px) {
                  width: 100%;
                  height: 240px;
                }

                &:hover {
                  box-shadow: 0 12px 40px rgba(15, 76, 129, 0.2);
                  transform: translateY(-4px);

                  .preview-overlay {
                    opacity: 1;
                    visibility: visible;
                  }

                  .preview-badge {
                    transform: translateY(-2px);
                  }
                }

                .preview-image {
                  width: 100%;
                  height: 100%;
                  cursor: pointer;

                  :deep(img) {
                    transition: transform 0.4s ease;
                  }

                  &:hover :deep(img) {
                    transform: scale(1.05);
                  }
                }

                .image-placeholder,
                .image-error {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  gap: var(--spacing-sm);
                  color: var(--color-text-tertiary);
                  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

                  span {
                    font-size: var(--font-size-sm);
                  }
                }

                .preview-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(135deg, rgba(15, 76, 129, 0.85) 0%, rgba(106, 90, 205, 0.85) 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  opacity: 0;
                  visibility: hidden;
                  transition: all 0.3s ease;
                  backdrop-filter: blur(4px);
                  pointer-events: none;

                  .overlay-content {
                    text-align: center;
                    color: #fff;
                    transform: translateY(10px);
                    transition: transform 0.3s ease;

                    .overlay-icon {
                      margin-bottom: var(--spacing-sm);
                      animation: pulse 2s ease-in-out infinite;
                    }

                    .overlay-text {
                      font-size: var(--font-size-base);
                      font-weight: 500;
                      margin: 0;
                      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                  }

                  &:hover .overlay-content {
                    transform: translateY(0);
                  }
                }

                .preview-badge {
                  position: absolute;
                  top: 12px;
                  right: 12px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  padding: 6px 14px;
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
                  backdrop-filter: blur(10px);
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  color: #0F4C81;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  transition: all 0.3s ease;
                  border: 1px solid rgba(15, 76, 129, 0.2);
                  pointer-events: none;

                  .el-icon {
                    font-size: 14px;
                  }
                }
              }

              .preview-info-card {
                flex: 1;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
                border-radius: 12px;
                padding: var(--spacing-lg);
                border: 2px solid #e7f0ff;
                box-shadow: 0 4px 12px rgba(15, 76, 129, 0.06);
                transition: all 0.3s ease;

                &:hover {
                  border-color: #0F4C81;
                  box-shadow: 0 6px 16px rgba(15, 76, 129, 0.12);
                }

                .info-item {
                  display: flex;
                  align-items: flex-start;
                  gap: var(--spacing-md);

                  .info-icon {
                    font-size: 24px;
                    color: #0F4C81;
                    flex-shrink: 0;
                    margin-top: 2px;
                  }

                  .info-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;

                    .info-label {
                      font-size: 12px;
                      color: var(--color-text-tertiary);
                      font-weight: 500;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    }

                    .info-value {
                      font-size: 15px;
                      color: var(--color-text-primary);
                      font-weight: 600;
                      line-height: 1.4;
                    }
                  }
                }

                .info-divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent 0%, #d0e8ff 50%, transparent 100%);
                  margin: var(--spacing-md) 0;
                }
              }
            }
          }

          .defense-description {
            p {
              color: #6c757d;
              line-height: 1.8;
              font-size: 14px;
              margin: 0;
              padding: 16px;
              background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
              border-radius: 10px;
              border-left: 4px solid #6A5ACD;
            }
          }
        }
      }

      .empty-state {
        padding: 80px 0;
        text-align: center;

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
        }

        p {
          color: #6c757d;
          margin-top: 12px;
          font-size: 14px;
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
  .defense-simulation-container {
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

    .function-select-card {
      .function-group {
        flex-direction: column;

        :deep(.el-radio-button) {
          max-width: 100%;
        }
      }
    }

    .simulation-list-card {
      .list-header {
        flex-direction: column;
        align-items: stretch;

        .list-actions {
          flex-direction: column;
          align-items: stretch;

          .el-input,
          .el-select {
            width: 100% !important;
            margin: 0 !important;
          }
        }
      }

      .list-content .defense-list .defense-item {
        padding: 16px;

        .defense-header {
          flex-direction: column;
          gap: var(--spacing-sm);

          .defense-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      }
    }
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
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
</style>

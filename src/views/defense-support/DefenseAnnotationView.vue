<template>
  <div class="defense-annotation-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('defenseAnnotation.title') }}</h1>
      <p class="page-subtitle">{{ $t('defenseAnnotation.subtitle') }}</p>
    </div>

    <!-- 上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <span>{{ $t('defenseAnnotation.uploadTitle') }}</span>
      </template>

      <div class="upload-area">
        <el-upload ref="uploadRef" class="upload-dragger" drag :auto-upload="false" :show-file-list="false"
          accept=".pdf,.doc,.docx" :on-change="handleFileChange" :before-upload="beforeUpload">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            {{ $t('defenseAnnotation.uploadText') }}<em>{{ $t('defenseAnnotation.clickUpload') }}</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              {{ $t('defenseAnnotation.fileFormatTip') }}
            </div>
          </template>
        </el-upload>

        <div v-if="uploadedFiles.length > 0" class="file-list">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <el-icon>
              <Document />
            </el-icon>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <el-button size="small" type="danger" @click="removeFile(index)">
              <el-icon>
                <Delete />
              </el-icon>
              {{ $t('common.delete') }}
            </el-button>
          </div>
        </div>

        <div v-if="uploadedFiles.length > 0" class="upload-actions">
          <el-button type="primary" size="large" :loading="uploading" @click="startAnnotationTask">
            {{ uploading ? $t('common.loading') : $t('defenseAnnotation.generateAnnotationReply') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 批注记录列表 -->
    <el-card class="annotation-list-card">
      <template #header>
        <div class="list-header">
          <span>{{ $t('defenseAnnotation.taskRecords') }}</span>
          <div class="list-actions">
            <el-input v-model="searchKeyword" :placeholder="$t('common.search')" clearable @input="handleSearch"
              style="width: 300px; margin-right: 16px">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" :placeholder="$t('defenseAnnotation.statusFilter')" clearable
              @change="handleStatusChange" style="width: 150px">
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('patentSearch.completed')" value="1" />
              <el-option :label="$t('patentSearch.generating')" value="0" />
              <el-option :label="$t('patentSearch.failed')" value="2" />
            </el-select>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="list-content">
        <!-- 任务记录列表 -->
        <div class="annotation-list">
          <div v-for="item in annotationList" :key="item.id" class="annotation-item">
            <div class="annotation-header">
              <div class="annotation-info">
                <h3 class="annotation-title">
                  {{ $t('defenseAnnotation.annotationReply') }}
                </h3>
                <div class="annotation-meta">
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
              <div class="annotation-actions">
                <el-tag :type="item.state === 1 ? 'success' : (item.state === 0 ? 'warning' : 'danger')" size="small">
                  {{ item.state === 1 ? $t('patentSearch.completed') : (item.state === 0 ? $t('patentSearch.generating')
                    :
                  $t('patentSearch.failed')) }}
                </el-tag>
                <el-button size="small" text @click.stop="downloadPDF(item)" :disabled="!item.pdfUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentSearch.downloadPDF') }}
                </el-button>
                <el-button size="small" text @click.stop="downloadWord(item)" :disabled="!item.wordUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  {{ $t('patentSearch.downloadWord') }}
                </el-button>
              </div>
            </div>

            <!-- 图片展示 -->
            <div class="annotation-images" v-if="item.firstImgUrl">
              <div class="annotation-image-container">
                <el-image :src="item.firstImgUrl" fit="contain" loading="lazy" :preview-src-list="[item.firstImgUrl]"
                  :initial-index="0" preview-teleported :z-index="3000"
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

            <!-- 描述信息 -->
            <div class="annotation-description" v-if="item.description">
              <p>{{ item.description.length > 150 ? item.description.substring(0, 150) + '...' :
                item.description
                }}</p>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && annotationList.length === 0" class="empty-state">
          <el-empty :description="$t('defenseAnnotation.noTaskRecords')">
            <p>{{ $t('defenseAnnotation.startFirstTask') }}</p>
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
import { useI18n } from 'vue-i18n'
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
  ZoomIn
} from '@element-plus/icons-vue'
import { defenseSupportService, DefenseFunctionType } from '@/services/defenseSupport'
import { formatDate } from '@/utils'

// Composables
const router = useRouter()
const { t } = useI18n()

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const selectedFunction = ref<DefenseFunctionType>(DefenseFunctionType.ANNOTATION_REPLY)
const uploadedFiles = ref<Array<{ file: File; url: string; name: string; size: number }>>([])
const annotationDescription = ref('')
const searchKeyword = ref('')
const statusFilter = ref('')
const annotationList = ref<any[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const result = await defenseSupportService.getDefenseList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      state: statusFilter.value ? parseInt(statusFilter.value) : undefined,
      type: 6
    })

    console.log('=== 前端接收到的批注数据 ===')
    console.log('result.data:', result.data)
    result.data.forEach((item, index) => {
      console.log(`第${index + 1}条数据:`, {
        id: item.id,
        functionType: item.functionType,
        functionType类型: typeof item.functionType,
        判断结果: '批注回复'
      })
    })
    console.log('========================')

    annotationList.value = result.data
    total.value = result.total
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== '登录已过期') {
      ElMessage.error(error.message || t('common.loadFailed'))
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
    ElMessage.error(t('defenseAnnotation.supportedFormatsError'))
    return
  }
  if (!isValidSize) {
    ElMessage.error(t('defenseAnnotation.fileSizeLimitError'))
    return
  }

  // 上传文件到服务器
  try {
    ElMessage.info(t('defenseAnnotation.uploadingInfo'))
    const url = await defenseSupportService.uploadFile(rawFile)

    uploadedFiles.value.push({
      file: rawFile,
      url: url,
      name: rawFile.name,
      size: rawFile.size
    })

    ElMessage.success(t('defenseAnnotation.uploadSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('defenseAnnotation.uploadFailed'))
  }
}

const beforeUpload = (file: File) => {
  return false // 阻止自动上传
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const startAnnotationTask = async () => {
  if (uploadedFiles.value.length === 0) {
    ElMessage.warning(t('defenseAnnotation.pleaseUploadFile'))
    return
  }

  uploading.value = true
  try {
    const fileUrls = uploadedFiles.value.map(f => f.url)

    // 如果没有输入描述，根据功能类型给一个默认值
    let promptText = annotationDescription.value.trim()
    if (!promptText) {
      promptText = t('defenseAnnotation.defaultPrompt')
    }

    await defenseSupportService.createDefenseTask({
      functionType: selectedFunction.value,
      fileUrls: fileUrls,
      prompt: promptText,
      type: 6
    })

    const taskName = t('defenseAnnotation.annotationReply')
    ElMessage.success(t('defenseAnnotation.taskSubmitted', { taskName: taskName }))

    // 清空表单
    uploadedFiles.value = []
    annotationDescription.value = ''

    // 刷新列表
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || t('defenseAnnotation.taskSubmissionFailed'))
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

const downloadPDF = (item: any) => {
  if (!item.pdfUrl) {
    ElMessage.warning(t('defenseAnnotation.noPDF'))
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
    link.download = `${item.taskName || t('defenseAnnotation.annotationResult')}_结果.pdf`
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
    ElMessage.warning(t('defenseAnnotation.noWord'))
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
    link.download = `${item.taskName || t('defenseAnnotation.annotationResult')}_结果.docx`
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
.defense-annotation-container {
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

  .function-select-card {
    margin-bottom: var(--spacing-lg);

    .function-group {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);

      :deep(.el-radio-button) {
        .el-radio-button__inner {
          padding: 12px 24px;
          font-size: var(--font-size-base);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
      }
    }
  }

  .upload-card {
    margin-bottom: var(--spacing-lg);

    .upload-area {
      .upload-dragger {
        width: 100%;
      }

      .file-list {
        margin-top: var(--spacing-lg);

        .file-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          border: 1px solid var(--color-border-light);
          border-radius: var(--border-radius-base);
          background-color: var(--color-bg-secondary);

          .file-name {
            flex: 1;
            font-weight: var(--font-weight-medium);
          }

          .file-size {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
          }
        }
      }

      .description-area {
        margin-top: var(--spacing-lg);
      }

      .upload-actions {
        text-align: center;
        margin-top: var(--spacing-lg);
      }
    }
  }

  .annotation-list-card {
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
      .annotation-list {
        .annotation-item {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border-light);
          transition: background-color var(--transition-fast);

          &:last-child {
            border-bottom: none;
          }

          .annotation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);

            .annotation-info {
              flex: 1;

              .annotation-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0 0 var(--spacing-sm) 0;
              }

              .annotation-meta {
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

            .annotation-actions {
              display: flex;
              gap: var(--spacing-xs);
              align-items: center;
              margin-left: var(--spacing-md);
            }
          }

          .annotation-images {
            margin-bottom: var(--spacing-md);
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;

            .annotation-image-container {
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

          .annotation-description {
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
  .defense-annotation-container {
    .annotation-list-card .list-content .annotation-list .annotation-item {
      .annotation-header {
        flex-direction: column;
        gap: var(--spacing-sm);

        .annotation-actions {
          margin-left: 0;
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>

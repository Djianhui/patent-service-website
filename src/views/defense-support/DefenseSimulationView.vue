<template>
  <div class="defense-simulation-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">答辩支持</h1>
      <p class="page-subtitle">上传专利文件，生成审查意见通知书或答辩意见回复</p>
    </div>

    <!-- 功能选择区域 -->
    <el-card class="function-select-card">
      <template #header>
        <span>选择功能</span>
      </template>
      <el-radio-group v-model="selectedFunction" size="large" class="function-group">
        <el-radio-button :label="0">
          <el-icon>
            <DocumentChecked />
          </el-icon>
          模拟审查
        </el-radio-button>
        <el-radio-button :label="1">
          <el-icon>
            <EditPen />
          </el-icon>
          答辩意见回复
        </el-radio-button>
      </el-radio-group>
    </el-card>

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
            </el-button>
          </div>
        </div>

        <div class="description-area">
          <el-input v-model="defenseDescription" type="textarea" :rows="4"
            :placeholder="selectedFunction === 0 ? '请描述需要模拟审查的重点内容（可选）...' : '请输入答辩信息描述...'" maxlength="1000"
            show-word-limit />
        </div>

        <div v-if="uploadedFiles.length > 0" class="upload-actions">
          <el-button type="primary" size="large" :loading="uploading" @click="startDefenseTask">
            {{ uploading ? '处理中...' : (selectedFunction === 0 ? '开始模拟审查' : '生成答辩意见') }}
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
                <el-button size="small" text @click.stop="downloadPDF(item)" :disabled="!item.pdfUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载PDF
                </el-button>
                <el-button size="small" text @click.stop="downloadWord(item)" :disabled="!item.wordUrl">
                  <el-icon>
                    <Download />
                  </el-icon>
                  下载Word
                </el-button>
              </div>
            </div>

            <!-- 图片展示 -->
            <div class="defense-images" v-if="item.firstImgUrl">
              <div class="defense-image-container">
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
  ZoomIn
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
        ? '请对上传的专利文件进行全面的模拟审查'
        : '请根据专利文件生成答辩意见回复'
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
      .defense-list {
        .defense-item {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border-light);
          transition: background-color var(--transition-fast);

          &:last-child {
            border-bottom: none;
          }

          .defense-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-md);

            .defense-info {
              flex: 1;

              .defense-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin: 0 0 var(--spacing-sm) 0;
              }

              .defense-meta {
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

            .defense-actions {
              display: flex;
              gap: var(--spacing-xs);
              align-items: center;
              margin-left: var(--spacing-md);
            }
          }

          .defense-images {
            margin-bottom: var(--spacing-md);
            display: flex;
            gap: var(--spacing-sm);
            flex-wrap: wrap;

            .defense-image-container {
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

          .defense-description {
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
    .simulation-list-card .list-content .defense-list .defense-item {
      .defense-header {
        flex-direction: column;
        gap: var(--spacing-sm);

        .defense-actions {
          margin-left: 0;
          width: 100%;
          justify-content: flex-start;
        }
      }
    }
  }
}
</style>

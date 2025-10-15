<template>
  <div class="three-analysis-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建三性分析</h1>
      <p class="page-subtitle">上传专利文件或输入专利信息，为您分析专利的新颖性、创造性和实用性</p>
    </div>

    <!-- 输入方式选择 -->
    <el-card class="input-mode-card">
      <template #header>
        <span>输入方式</span>
      </template>
      <el-radio-group v-model="inputMode" size="large" class="mode-group">
        <el-radio-button value="file">
          <el-icon>
            <UploadFilled />
          </el-icon>
          文件上传
        </el-radio-button>
        <el-radio-button value="text">
          <el-icon>
            <Edit />
          </el-icon>
          文本输入
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 文件上传区域 -->
    <el-card v-if="inputMode === 'file'" class="upload-card">
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

        <div v-if="uploadedFiles.length > 0" class="upload-actions">
          <el-button type="primary" size="large" :loading="analyzing" @click="startAnalysis">
            {{ analyzing ? '分析中...' : '开始分析' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 文本输入表单 -->
    <el-card v-if="inputMode === 'text'" class="input-card">
      <template #header>
        <span>专利信息输入</span>
      </template>


      <el-form ref="formRef" :model="formData" label-width="120px" :rules="formRules">
        <el-form-item label="专利标题" required>
          <el-input v-model="formData.title" placeholder="请输入专利标题" />
        </el-form-item>

        <el-form-item label="技术方案" required>
          <el-input v-model="formData.technicalSolution" type="textarea" :rows="8"
            placeholder="请详细描述本发明的技术方案，包括结构组成、工作原理、技术特点等。建议300-1000字，内容越详细，生成的专利质量越高。" maxlength="10000" show-word-limit
            resize="vertical" />
        </el-form-item>

        <el-form-item label="分析类型">
          <el-checkbox-group v-model="formData.analysisTypes">
            <el-checkbox value="novelty">新颖性分析</el-checkbox>
            <el-checkbox value="inventiveness">创造性分析</el-checkbox>
            <el-checkbox value="practicality">实用性分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="startAnalysis" :loading="analyzing">
              {{ analyzing ? '分析中...' : '开始分析' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析进度 -->
    <el-card v-if="analyzing" class="result-card">
      <template #header>
        <span>提交中</span>
      </template>

      <div class="analyzing-status">
        <el-progress :percentage="analysisProgress" />
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import {
  UploadFilled,
  Document,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import { threeAnalysisService } from '@/services/threeAnalysis'

const router = useRouter()
const formRef = ref<FormInstance>()
const analyzing = ref(false)
const analysisProgress = ref(0)
const inputMode = ref<'file' | 'text'>('file')
const uploadedFiles = ref<Array<{ file: File; url: string; name: string; size: number }>>([])

const formData = reactive({
  title: '',
  technicalSolution: '',
  analysisTypes: ['novelty', 'inventiveness', 'practicality']
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入专利标题', trigger: 'blur' },
    { min: 3, max: 50, message: '专利标题长度应为3-50个字符', trigger: 'blur' }
  ],
  technicalSolution: [
    { required: true, message: '请填写技术方案', trigger: 'blur' },
    { min: 50, message: '技术方案描述至少50个字符', trigger: 'blur' }
  ]
}

const progressText = computed(() => {
  return '正在分析专利的三性特征...'
})

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
    const url = await threeAnalysisService.uploadFile(rawFile)

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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const startAnalysis = async () => {
  // 根据输入模式验证
  if (inputMode.value === 'file') {
    if (uploadedFiles.value.length === 0) {
      ElMessage.warning('请先上传专利文件')
      return
    }
  } else {
    if (!formData.title.trim() || !formData.technicalSolution.trim()) {
      ElMessage.warning('请填写完整信息')
      return
    }
  }

  analyzing.value = true
  analysisProgress.value = 0

  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (analysisProgress.value < 90) {
        analysisProgress.value += 10
      }
    }, 500)

    // 构建请求参数
    const requestData: any = {
      analysisTypes: formData.analysisTypes
    }

    if (inputMode.value === 'file') {
      // 文件上传模式
      requestData.fileUrls = uploadedFiles.value.map(f => f.url)
      // 设置默认 prompt 为 "上传文件"
      requestData.title = '上传文件'
    } else {
      // 文本输入模式
      requestData.title = formData.title
      requestData.technicalSolution = formData.technicalSolution
    }

    // 调用后端API
    await threeAnalysisService.createAnalysis(requestData)

    clearInterval(progressInterval)
    analysisProgress.value = 100

    ElMessage.success('分析任务已提交，请在历史记录中查看结果')

    // 跳转到历史记录页面
    setTimeout(() => {
      router.push('/app/three-analysis/history')
    }, 1500)
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== '登录已过期') {
      ElMessage.error(error.message || '分析失败')
    }
  } finally {
    analyzing.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  uploadedFiles.value = []
}
</script>

<style scoped lang="scss">
.three-analysis-new-container {
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

  .input-mode-card {
    margin-bottom: var(--spacing-lg);

    .mode-group {
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

      .upload-actions {
        text-align: center;
        margin-top: var(--spacing-lg);
      }
    }
  }

  .input-card {
    margin-bottom: var(--spacing-lg);

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border-light);
    }
  }

  .result-card {
    .analyzing-status {
      text-align: center;

      .progress-text {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-top: var(--spacing-md);
      }
    }

    .analysis-content {
      .overall-evaluation {
        text-align: center;
        margin-bottom: var(--spacing-2xl);
        padding-bottom: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border-light);

        h3 {
          margin-bottom: var(--spacing-lg);
          color: var(--color-text-primary);
        }
      }

      .analysis-sections {
        .section {
          margin-bottom: var(--spacing-lg);

          h4 {
            font-size: var(--font-size-base);
            font-weight: var(--font-weight-medium);
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-sm);
          }

          p {
            color: var(--color-text-secondary);
            line-height: var(--line-height-relaxed);
            margin-top: var(--spacing-sm);
          }
        }
      }

      .result-actions {
        text-align: center;
        margin-top: var(--spacing-2xl);
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--color-border-light);
      }
    }
  }
}
</style>

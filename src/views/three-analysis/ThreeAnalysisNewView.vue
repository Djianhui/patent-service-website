<template>
  <div class="three-analysis-new-container">
    <!-- 页面横幅 -->
    <div class="page-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <el-icon :size="48">
            <DataAnalysis />
          </el-icon>
        </div>
        <div class="banner-text">
          <h1 class="page-title">新建三性分析</h1>
          <p class="page-subtitle">AI智能分析专利的新颖性、创造性和实用性，助力专利申请成功</p>
        </div>
      </div>
    </div>

    <!-- 输入方式选择 -->
    <el-card class="input-mode-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon">
            <Operation />
          </el-icon>
          <span class="header-title">选择输入方式</span>
        </div>
      </template>
      <el-radio-group v-model="inputMode" size="large" class="mode-group">
        <el-radio-button value="file" class="mode-option">
          <div class="option-content">
            <div class="option-icon file">
              <el-icon :size="28">
                <UploadFilled />
              </el-icon>
            </div>
            <div class="option-text">
              <span class="option-title">文件上传</span>
              <span class="option-desc">上传PDF/Word专利文档</span>
            </div>
          </div>
        </el-radio-button>
        <el-radio-button value="text" class="mode-option">
          <div class="option-content">
            <div class="option-icon text">
              <el-icon :size="28">
                <Edit />
              </el-icon>
            </div>
            <div class="option-text">
              <span class="option-title">文本输入</span>
              <span class="option-desc">手动填写专利信息</span>
            </div>
          </div>
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 文件上传区域 -->
    <el-card v-if="inputMode === 'file'" class="upload-card">
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

        <div v-if="uploadedFiles.length > 0" class="upload-actions">
          <el-button type="primary" size="large" :loading="analyzing" @click="startAnalysis" class="submit-button">
            <el-icon v-if="!analyzing">
              <Promotion />
            </el-icon>
            {{ analyzing ? '分析中...' : '开始分析' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 文本输入表单 -->
    <el-card v-if="inputMode === 'text'" class="input-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon">
            <Edit />
          </el-icon>
          <span class="header-title">专利信息输入</span>
        </div>
      </template>


      <el-form ref="formRef" :model="formData" label-width="120px" :rules="formRules" class="patent-form">
        <el-form-item label="专利标题" required>
          <el-input v-model="formData.title" placeholder="请输入专利标题" class="form-input" />
        </el-form-item>

        <el-form-item label="技术方案" required>
          <el-input v-model="formData.technicalSolution" type="textarea" :rows="8"
            placeholder="请详细描述本发明的技术方案，包括结构组成、工作原理、技术特点等。建议300-1000字，内容越详细，生成的专利质量越高。" maxlength="10000" show-word-limit
            resize="vertical" class="form-textarea" />
        </el-form-item>

        <el-form-item label="分析类型">
          <el-checkbox-group v-model="formData.analysisTypes" class="checkbox-group">
            <el-checkbox value="novelty" class="analysis-checkbox">
              <div class="checkbox-content">
                <el-icon class="checkbox-icon">
                  <StarFilled />
                </el-icon>
                <span>新颖性分析</span>
              </div>
            </el-checkbox>
            <el-checkbox value="inventiveness" class="analysis-checkbox">
              <div class="checkbox-content">
                <el-icon class="checkbox-icon">
                  <MagicStick />
                </el-icon>
                <span>创造性分析</span>
              </div>
            </el-checkbox>
            <el-checkbox value="practicality" class="analysis-checkbox">
              <div class="checkbox-content">
                <el-icon class="checkbox-icon">
                  <Setting />
                </el-icon>
                <span>实用性分析</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm" class="reset-button">重置</el-button>
            <el-button type="primary" @click="startAnalysis" :loading="analyzing" class="submit-button">
              <el-icon v-if="!analyzing">
                <Promotion />
              </el-icon>
              {{ analyzing ? '分析中...' : '开始分析' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析进度 -->
    <el-card v-if="analyzing" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon analyzing">
            <Loading />
          </el-icon>
          <span class="header-title">提交中</span>
        </div>
      </template>

      <div class="analyzing-status">
        <div class="progress-wrapper">
          <el-progress :percentage="analysisProgress" :stroke-width="12" class="custom-progress" />
        </div>
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance } from 'element-plus'
import {
  UploadFilled,
  Document,
  Delete,
  Edit,
  DataAnalysis,
  Operation,
  Promotion,
  Loading,
  StarFilled,
  MagicStick,
  Setting
} from '@element-plus/icons-vue'
import { threeAnalysisService } from '@/services/threeAnalysis'

const router = useRouter()
const { t } = useI18n()
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
    ElMessage.error(t('common.fileFormatError'))
    return
  }
  if (!isValidSize) {
    ElMessage.error(t('common.fileSizeError'))
    return
  }

  // 上传文件到服务器
  try {
    ElMessage.info(t('common.uploading'))
    const url = await threeAnalysisService.uploadFile(rawFile)

    uploadedFiles.value.push({
      file: rawFile,
      url: url,
      name: rawFile.name,
      size: rawFile.size
    })

    ElMessage.success(t('common.uploadSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('common.uploadFailed'))
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
      ElMessage.warning(t('common.pleaseUploadFile'))
      return
    }
  } else {
    if (!formData.title.trim() || !formData.technicalSolution.trim()) {
      ElMessage.warning(t('common.pleaseCompleteInfo'))
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

    ElMessage.success(t('common.analysisSubmitted'))

    // 跳转到历史记录页面
    setTimeout(() => {
      router.push('/app/three-analysis/history')
    }, 1500)
  } catch (error: any) {
    // 如果是登录过期错误，不显示额外错误提示
    if (error?.message !== t('common.loginExpired')) {
      ElMessage.error(error.message || t('common.analysisFailed'))
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

  .input-mode-card {
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

    .mode-group {
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

      .mode-option {
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

            &.file {
              background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
              color: #0F4C81;
            }

            &.text {
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

  .input-card {
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

    .patent-form {
      padding: 8px;

      .form-input {
        :deep(.el-input__wrapper) {
          border-radius: 10px;
          border: 2px solid #e7f0ff;

          &:hover,
          &.is-focus {
            border-color: #0F4C81;
          }
        }
      }

      .form-textarea {
        :deep(.el-textarea__inner) {
          border-radius: 12px;
          border: 2px solid #e7f0ff;
          line-height: 1.8;

          &:focus {
            border-color: #0F4C81;
          }
        }
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .analysis-checkbox {
          :deep(.el-checkbox__input) {
            .el-checkbox__inner {
              width: 20px;
              height: 20px;
              border-radius: 6px;
              border: 2px solid #d5e5ff;
            }

            &.is-checked .el-checkbox__inner {
              background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
              border-color: transparent;
            }
          }

          .checkbox-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-radius: 10px;
            background: linear-gradient(135deg, #fafbfd 0%, #f5f7fc 100%);
            border: 2px solid #e7f0ff;
            transition: all 0.3s ease;
            margin-left: 8px;

            .checkbox-icon {
              font-size: 18px;
              color: #6A5ACD;
            }

            span {
              font-weight: 500;
              color: #2c3e50;
            }
          }

          &:hover .checkbox-content {
            border-color: #0F4C81;
            background: linear-gradient(135deg, #f0f4ff 0%, #e7f0ff 100%);
          }

          :deep(.el-checkbox__input.is-checked)~.checkbox-content {
            border-color: #0F4C81;
            background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 2px solid #e7f0ff;
      margin-top: 8px;

      .reset-button {
        min-width: 100px;
        height: 42px;
        border-radius: 21px;
        border: 2px solid #e7f0ff;
        font-weight: 500;

        &:hover {
          border-color: #0F4C81;
          color: #0F4C81;
          background: #f0f4ff;
        }
      }

      .submit-button {
        min-width: 160px;
        height: 42px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 21px;
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        border: none;
        box-shadow: 0 4px 16px rgba(15, 76, 129, 0.3);
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(135deg, #1a5f9e 0%, #7B68EE 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(15, 76, 129, 0.4);
        }
      }
    }
  }

  .result-card {
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

          &.analyzing {
            color: #6A5ACD;
            animation: rotate 1.5s linear infinite;
          }
        }
      }
    }

    .analyzing-status {
      text-align: center;
      padding: 24px;

      .progress-wrapper {
        max-width: 600px;
        margin: 0 auto 24px;

        .custom-progress {
          :deep(.el-progress-bar__outer) {
            background: #e7f0ff;
            border-radius: 10px;
          }

          :deep(.el-progress-bar__inner) {
            background: linear-gradient(90deg, #0F4C81 0%, #6A5ACD 100%);
            border-radius: 10px;
          }
        }
      }

      .progress-text {
        color: #6A5ACD;
        font-size: 15px;
        margin: 0;
        font-weight: 500;
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

@media (max-width: 768px) {
  .three-analysis-new-container {
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

    .input-mode-card,
    .upload-card {
      .mode-group {
        flex-direction: column;

        :deep(.el-radio-button) {
          max-width: 100%;
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div class="tech-report-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建技术方案报告</h1>
      <p class="page-subtitle">上传技术资料或输入技术描述，AI将为您生成专业的技术方案分析报告</p>
    </div>

    <!-- 主要内容 -->
    <div class="content-wrapper">
      <el-card class="input-card">
        <template #header>
          <div class="card-header">
            <span>技术信息输入</span>
            <el-radio-group v-model="inputType" @change="handleInputTypeChange">
              <el-radio-button value="text">文本输入</el-radio-button>
              <el-radio-button value="file">文件上传</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <!-- 基本信息 -->
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
          <el-form-item label="报告标题" prop="title" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入技术方案报告标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="技术领域" prop="technicalField">
            <el-select
              v-model="formData.technicalField"
              placeholder="请选择技术领域"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="field in technicalFields"
                :key="field.value"
                :label="field.label"
                :value="field.value"
              />
            </el-select>
          </el-form-item>

          <!-- 文本输入模式 -->
          <div v-if="inputType === 'text'" class="text-input-section">
            <el-form-item label="技术描述" prop="inputContent" required>
              <el-input
                v-model="formData.inputContent"
                type="textarea"
                :rows="12"
                placeholder="请详细描述您的技术方案，包括：&#10;1. 技术背景和现有技术存在的问题&#10;2. 技术方案的具体实现方式&#10;3. 技术方案的创新点和优势&#10;4. 预期效果和应用场景"
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <div class="input-tips">
              <el-alert
                title="输入提示"
                type="info"
                :closable="false"
                show-icon
              >
                <template #default>
                  <ul>
                    <li>请尽可能详细地描述技术方案的实现原理和创新点</li>
                    <li>建议包含技术背景、技术问题、解决方案、技术效果等内容</li>
                    <li>字数建议在500-5000字之间，描述越详细分析越准确</li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </div>

          <!-- 文件上传模式 -->
          <div v-if="inputType === 'file'" class="file-input-section">
            <el-form-item label="技术文档" required>
              <div class="upload-area" :class="{ dragover: isDragover }">
                <el-upload
                  ref="uploadRef"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :before-upload="beforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :on-progress="handleUploadProgress"
                  :file-list="fileList"
                  :limit="5"
                  drag
                  multiple
                  @dragover="isDragover = true"
                  @dragleave="isDragover = false"
                  @drop="isDragover = false"
                >
                  <div class="upload-content">
                    <el-icon class="upload-icon"><UploadFilled /></el-icon>
                    <div class="upload-text">
                      <p>将文件拖拽到此处，或<em>点击上传</em></p>
                      <p class="upload-tip">支持 PDF、Word、TXT 格式，单个文件不超过 10MB</p>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>

            <el-form-item label="补充说明" prop="inputContent">
              <el-input
                v-model="formData.inputContent"
                type="textarea"
                :rows="4"
                placeholder="可选：对上传文档的补充说明或特殊要求"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>

            <div class="file-tips">
              <el-alert
                title="文件要求"
                type="warning"
                :closable="false"
                show-icon
              >
                <template #default>
                  <ul>
                    <li>支持格式：PDF、DOC、DOCX、TXT</li>
                    <li>文件大小：单个文件不超过10MB</li>
                    <li>文件数量：最多上传5个文件</li>
                    <li>建议上传：技术交底书、专利文献、技术报告等</li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </div>

          <!-- 高级选项 -->
          <el-form-item>
            <el-collapse v-model="advancedOptionsOpen">
              <el-collapse-item name="advanced" title="高级选项">
                <el-form-item label="分析重点">
                  <el-checkbox-group v-model="formData.analysisOptions">
                    <el-checkbox value="novelty">新颖性分析</el-checkbox>
                    <el-checkbox value="inventiveness">创造性分析</el-checkbox>
                    <el-checkbox value="practicality">实用性分析</el-checkbox>
                    <el-checkbox value="market">市场前景分析</el-checkbox>
                    <el-checkbox value="competitor">竞争对手分析</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="输出格式">
                  <el-radio-group v-model="formData.outputFormat">
                    <el-radio value="standard">标准报告</el-radio>
                    <el-radio value="detailed">详细报告</el-radio>
                    <el-radio value="summary">摘要报告</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <div class="form-actions">
              <el-button @click="resetForm">重置</el-button>
              <el-button @click="saveAsDraft" :loading="savingDraft">保存草稿</el-button>
              <el-button 
                type="primary" 
                @click="generateReport" 
                :loading="generating"
                :disabled="!canGenerate"
              >
                {{ generating ? '生成中...' : '生成报告' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 预览区域 -->
      <el-card v-if="generating || previewData" class="preview-card">
        <template #header>
          <span>生成预览</span>
        </template>

        <div v-if="generating" class="generating-status">
          <div class="progress-container">
            <el-progress :percentage="generateProgress" :status="progressStatus" />
            <p class="progress-text">{{ progressText }}</p>
          </div>
          
          <div class="generating-steps">
            <div 
              v-for="(step, index) in generateSteps" 
              :key="index"
              class="step-item"
              :class="{ active: currentStep >= index, completed: currentStep > index }"
            >
              <el-icon class="step-icon">
                <component :is="currentStep > index ? 'Select' : 'Loading'" />
              </el-icon>
              <span>{{ step }}</span>
            </div>
          </div>
        </div>

        <div v-if="previewData && !generating" class="preview-content">
          <div class="preview-header">
            <h3>{{ previewData.title }}</h3>
            <div class="preview-actions">
              <el-button size="small" @click="editReport">编辑</el-button>
              <el-button size="small" type="primary" @click="downloadReport">下载</el-button>
            </div>
          </div>
          
          <div class="preview-body">
            <div class="section" v-for="section in previewData.sections" :key="section.key">
              <h4>{{ section.title }}</h4>
              <p>{{ section.content }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { UploadFilled, Select, Loading } from '@element-plus/icons-vue'
import { useTechReportStore } from '@/stores/techReport'

// Composables
const router = useRouter()
const techReportStore = useTechReportStore()

// 响应式数据
const formRef = ref<FormInstance>()
const uploadRef = ref()
const inputType = ref<'text' | 'file'>('text')
const isDragover = ref(false)
const generating = ref(false)
const savingDraft = ref(false)
const generateProgress = ref(0)
const currentStep = ref(0)
const advancedOptionsOpen = ref([])
const fileList = ref([])
const previewData = ref(null)

// 表单数据
const formData = reactive({
  title: '',
  technicalField: '',
  inputContent: '',
  analysisOptions: ['novelty', 'inventiveness', 'practicality'],
  outputFormat: 'standard'
})

// 技术领域选项
const technicalFields = ref([
  { label: '人工智能', value: 'ai' },
  { label: '机器学习', value: 'ml' },
  { label: '物联网', value: 'iot' },
  { label: '区块链', value: 'blockchain' },
  { label: '生物技术', value: 'biotech' },
  { label: '新材料', value: 'materials' },
  { label: '新能源', value: 'energy' },
  { label: '医疗设备', value: 'medical' },
  { label: '通信技术', value: 'communication' },
  { label: '软件技术', value: 'software' }
])

// 生成步骤
const generateSteps = ref([
  '分析技术内容',
  '检索相关专利',
  '评估技术特点',
  '生成分析报告',
  '完成报告输出'
])

// 计算属性
const canGenerate = computed(() => {
  return formData.title.trim() && (
    (inputType.value === 'text' && formData.inputContent.trim()) ||
    (inputType.value === 'file' && fileList.value.length > 0)
  )
})

const progressText = computed(() => {
  const texts = [
    '正在分析您的技术方案...',
    '正在检索相关专利文献...',
    '正在评估技术创新性...',
    '正在生成分析报告...',
    '报告生成完成'
  ]
  return texts[currentStep.value] || texts[0]
})

const progressStatus = computed(() => {
  if (generateProgress.value === 100) return 'success'
  if (generateProgress.value > 0) return undefined
  return undefined
})

const uploadAction = computed(() => '/api/files/upload')
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入报告标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在5到100个字符', trigger: 'blur' }
  ],
  inputContent: [
    { 
      validator: (rule, value, callback) => {
        if (inputType.value === 'text' && (!value || value.trim().length < 50)) {
          callback(new Error('技术描述不能少于50个字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 方法
const handleInputTypeChange = () => {
  // 切换输入类型时清理相关数据
  if (inputType.value === 'file') {
    formData.inputContent = ''
  } else {
    fileList.value = []
  }
}

const beforeUpload = (file: File) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 PDF、Word、TXT 格式的文件')
    return false
  }

  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }

  return true
}

const handleUploadSuccess = (response: any, file: any) => {
  ElMessage.success('文件上传成功')
  console.log('上传成功:', response, file)
}

const handleUploadError = (error: any) => {
  ElMessage.error('文件上传失败')
  console.error('上传失败:', error)
}

const handleUploadProgress = (event: any) => {
  console.log('上传进度:', event)
}

const generateReport = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return
  } catch (error) {
    return
  }

  generating.value = true
  generateProgress.value = 0
  currentStep.value = 0

  // 模拟生成过程
  const steps = [20, 40, 60, 80, 100]
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    generateProgress.value = steps[i]
    currentStep.value = i
  }

  try {
    // 调用API生成报告
    const reportData = await techReportStore.generateReport({
      title: formData.title,
      inputType: inputType.value,
      inputContent: formData.inputContent,
      technicalField: formData.technicalField
    })

    ElMessage.success('报告生成成功')
    
    // 设置预览数据
    previewData.value = {
      title: reportData.title,
      sections: [
        { key: 'summary', title: '技术方案摘要', content: '这是技术方案的摘要内容...' },
        { key: 'background', title: '技术背景', content: '当前技术背景分析...' },
        { key: 'innovation', title: '创新点分析', content: '技术创新点详细分析...' },
        { key: 'advantage', title: '技术优势', content: '相比现有技术的优势...' }
      ]
    }

  } catch (error: any) {
    ElMessage.error(error.message || '报告生成失败')
  } finally {
    generating.value = false
  }
}

const saveAsDraft = async () => {
  if (!formData.title.trim()) {
    ElMessage.warning('请至少填写报告标题')
    return
  }

  savingDraft.value = true
  try {
    // 这里调用保存草稿的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('草稿保存失败')
  } finally {
    savingDraft.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  fileList.value = []
  previewData.value = null
}

const editReport = () => {
  // 跳转到报告编辑页面
  router.push('/app/tech-report/edit')
}

const downloadReport = () => {
  // 下载报告
  ElMessage.success('报告下载中...')
}

// 生命周期
onMounted(() => {
  // 页面初始化
})
</script>

<style scoped lang="scss">
.tech-report-new-container {
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
      line-height: var(--line-height-relaxed);
    }
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-lg);

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }

    .input-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .text-input-section,
      .file-input-section {
        .input-tips,
        .file-tips {
          margin-top: var(--spacing-md);

          :deep(.el-alert__content) {
            ul {
              margin: 0;
              padding-left: var(--spacing-lg);

              li {
                margin-bottom: var(--spacing-xs);
                color: var(--color-text-secondary);
                font-size: var(--font-size-sm);
              }
            }
          }
        }
      }

      .upload-area {
        border: 2px dashed var(--color-border-base);
        border-radius: var(--border-radius-large);
        transition: all var(--transition-base);

        &.dragover {
          border-color: var(--color-primary);
          background-color: rgba(24, 144, 255, 0.05);
        }

        .upload-content {
          padding: var(--spacing-xl);
          text-align: center;

          .upload-icon {
            font-size: 48px;
            color: var(--color-text-placeholder);
            margin-bottom: var(--spacing-md);
          }

          .upload-text {
            p {
              margin-bottom: var(--spacing-xs);
              color: var(--color-text-secondary);

              em {
                color: var(--color-primary);
                font-style: normal;
              }
            }

            .upload-tip {
              font-size: var(--font-size-xs);
              color: var(--color-text-placeholder);
            }
          }
        }

        :deep(.el-upload-dragger) {
          border: none;
          background: transparent;
          width: 100%;
          height: auto;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-md);
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--color-border-light);
      }
    }

    .preview-card {
      .generating-status {
        .progress-container {
          margin-bottom: var(--spacing-xl);

          .progress-text {
            text-align: center;
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            margin-top: var(--spacing-md);
          }
        }

        .generating-steps {
          .step-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-sm) 0;
            color: var(--color-text-placeholder);
            transition: color var(--transition-base);

            &.active {
              color: var(--color-primary);
            }

            &.completed {
              color: var(--color-success);
            }

            .step-icon {
              font-size: 16px;
            }
          }
        }
      }

      .preview-content {
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border-light);

          h3 {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin: 0;
          }

          .preview-actions {
            display: flex;
            gap: var(--spacing-sm);
          }
        }

        .preview-body {
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
              font-size: var(--font-size-sm);
            }
          }
        }
      }
    }
  }
}
</style>
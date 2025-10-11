<template>
  <div class="tech-report-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建技术方案报告</h1>
      <p class="page-subtitle">上输入技术领域，AI将为您生成专业的技术方案分析报告</p>
    </div>

    <!-- 主要内容 -->
    <div class="content-wrapper">
      <el-card class="input-card">
        <template #header>
          <div class="card-header">
            <span>技术信息输入</span>
          </div>
        </template>

        <!-- 基本信息 -->
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
          <el-form-item label="技术领域" prop="technicalField" required>
            <el-select v-model="formData.technicalField" placeholder="请选择技术领域" style="width: 100%" filterable
              allow-create>
              <el-option v-for="field in technicalFields" :key="field.value" :label="field.label"
                :value="field.value" />
            </el-select>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <div class="form-actions">
              <el-button @click="resetForm">重置</el-button>
              <el-button type="primary" @click="generateReport" :loading="generating" :disabled="!canGenerate">
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
            <div v-for="(step, index) in generateSteps" :key="index" class="step-item"
              :class="{ active: currentStep >= index, completed: currentStep > index }">
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
const generating = ref(false)
const savingDraft = ref(false)
const generateProgress = ref(0)
const currentStep = ref(0)
const previewData = ref<any>(null)

// 表单数据
const formData = reactive({
  technicalField: ''
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
  return formData.technicalField.trim()
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
  technicalField: [
    { required: true, message: '请选择技术领域', trigger: 'blur' }
  ]
}

// 方法
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
    generateProgress.value = steps[i] as number
    currentStep.value = i
  }

  try {
    // 调用API生成报告
    const reportData = await techReportStore.generateReport({
      title: `${formData.technicalField}技术方案报告`,
      inputType: 'text' as const,
      inputContent: `基于${formData.technicalField}领域的技术方案分析`,
      technicalField: formData.technicalField
    })

    ElMessage.success('报告生成成功')

    // 设置预览数据
    previewData.value = {
      title: `${formData.technicalField}技术方案报告`,
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
  if (!formData.technicalField.trim()) {
    ElMessage.warning('请至少选择技术领域')
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

<template>
  <div class="three-analysis-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建三性分析</h1>
      <p class="page-subtitle">输入专利信息，为您分析专利的新颖性、创造性和实用性</p>
    </div>

    <!-- 输入表单 -->
    <el-card class="input-card">
      <template #header>
        <span>专利信息输入</span>
      </template>

      <el-form ref="formRef" :model="formData" label-width="120px">
        <el-form-item label="专利标题" required>
          <el-input v-model="formData.title" placeholder="请输入专利标题" />
        </el-form-item>

        <el-form-item label="技术方案" required>
          <el-input v-model="formData.technicalSolution" type="textarea" :rows="8" placeholder="请详细描述专利的技术方案" />
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
import { threeAnalysisService } from '@/services/threeAnalysis'

const router = useRouter()
const formRef = ref<FormInstance>()
const analyzing = ref(false)
const analysisProgress = ref(0)

const formData = reactive({
  title: '',
  technicalSolution: '',
  analysisTypes: ['novelty', 'inventiveness', 'practicality']
})

const progressText = computed(() => {
  return '正在分析专利的三性特征...'
})

const startAnalysis = async () => {
  if (!formData.title.trim() || !formData.technicalSolution.trim()) {
    ElMessage.warning('请填写完整信息')
    return
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

    // 调用后端API
    await threeAnalysisService.createAnalysis({
      title: formData.title,
      technicalSolution: formData.technicalSolution,
      analysisTypes: formData.analysisTypes
    })

    clearInterval(progressInterval)
    analysisProgress.value = 100

    ElMessage.success('分析任务已提交，请在历史记录中查看结果')

    // 跳转到历史记录页面
    setTimeout(() => {
      router.push('/app/three-analysis/history')
    }, 1500)
  } catch (error: any) {
    ElMessage.error(error.message || '分析失败')
  } finally {
    analyzing.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
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

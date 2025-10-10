<template>
  <div class="three-analysis-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建三性分析</h1>
      <p class="page-subtitle">输入专利信息，AI将为您分析专利的新颖性、创造性和实用性</p>
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
          <el-input
            v-model="formData.technicalSolution"
            type="textarea"
            :rows="8"
            placeholder="请详细描述专利的技术方案"
          />
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
            <el-button 
              type="primary" 
              @click="startAnalysis" 
              :loading="analyzing"
            >
              {{ analyzing ? '分析中...' : '开始分析' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析结果 -->
    <el-card v-if="analyzing || analysisResult" class="result-card">
      <template #header>
        <span>分析结果</span>
      </template>

      <div v-if="analyzing" class="analyzing-status">
        <el-progress :percentage="analysisProgress" />
        <p class="progress-text">{{ progressText }}</p>
      </div>

      <div v-if="analysisResult && !analyzing" class="analysis-content">
        <div class="overall-evaluation">
          <h3>综合评估</h3>
          <el-progress 
            type="circle" 
            :percentage="analysisResult.overallScore" 
          />
        </div>

        <div class="analysis-sections">
          <div class="section" v-if="formData.analysisTypes.includes('novelty')">
            <h4>新颖性分析</h4>
            <el-tag :type="analysisResult.novelty.hasNovelty ? 'success' : 'danger'">
              {{ analysisResult.novelty.hasNovelty ? '具备新颖性' : '不具备新颖性' }}
            </el-tag>
            <p>{{ analysisResult.novelty.conclusion }}</p>
          </div>

          <div class="section" v-if="formData.analysisTypes.includes('inventiveness')">
            <h4>创造性分析</h4>
            <el-tag type="success">高创造性</el-tag>
            <p>{{ analysisResult.inventiveness.conclusion }}</p>
          </div>

          <div class="section" v-if="formData.analysisTypes.includes('practicality')">
            <h4>实用性分析</h4>
            <el-tag :type="analysisResult.practicality.isPractical ? 'success' : 'danger'">
              {{ analysisResult.practicality.isPractical ? '具备实用性' : '不具备实用性' }}
            </el-tag>
            <p>{{ analysisResult.practicality.conclusion }}</p>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" @click="downloadReport">下载报告</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const analyzing = ref(false)
const analysisProgress = ref(0)
const analysisResult = ref(null)

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

  // 模拟分析过程
  const interval = setInterval(() => {
    analysisProgress.value += 20
    if (analysisProgress.value >= 100) {
      clearInterval(interval)
      analyzing.value = false
      
      // 模拟分析结果
      analysisResult.value = {
        overallScore: 85,
        novelty: {
          hasNovelty: true,
          conclusion: '该技术方案具备新颖性，相对于现有技术存在明显区别。'
        },
        inventiveness: {
          level: 'high',
          conclusion: '该技术方案具有较高的创造性，技术特征的组合非显而易知。'
        },
        practicality: {
          isPractical: true,
          conclusion: '该技术方案具备实用性，能够产生积极的技术效果。'
        }
      }
      
      ElMessage.success('分析完成！')
    }
  }, 500)
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  analysisResult.value = null
}

const downloadReport = () => {
  ElMessage.success('报告下载中...')
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
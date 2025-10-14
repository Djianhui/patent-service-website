<template>
  <div class="patent-draft-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建专利草稿</h1>
      <p class="page-subtitle">只需填写技术交底，自动生成完整专利草稿</p>
    </div>

    <!-- 技术交底表单 -->
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>发明专利 - 草稿</span>
          <el-tag type="success" size="small">专业版</el-tag>
        </div>
      </template>

      <div class="form-tips">
        <el-alert title="填写说明" description="请按要求填写技术领域和技术方案，我们将自动生成摘要、权利要求书和说明书等完整专利文档" type="info" show-icon
          :closable="false" />
      </div>

      <el-form ref="formRef" :model="draftData" label-width="120px" :rules="formRules">
        <el-form-item label="发明名称" prop="title">
          <el-input v-model="draftData.title" placeholder="请输入发明名称（例如：组装式食用菌种植棚）" size="large" maxlength="50"
            show-word-limit />
        </el-form-item>

        <el-form-item label="技术领域" prop="technicalField">
          <el-input v-model="draftData.technicalField" type="textarea" :rows="6"
            placeholder="请描述本发明所属的技术领域。例如：本实用新型涉及农业设施技术领域，具体涉及一种用于食用菌种植的组装式种植棚结构。" maxlength="500" show-word-limit
            resize="vertical" />
        </el-form-item>

        <el-form-item label="技术方案" prop="technicalSolution">
          <el-input v-model="draftData.technicalSolution" type="textarea" :rows="8"
            placeholder="请详细描述本发明的技术方案，包括结构组成、工作原理、技术特点等。建议300-1000字，内容越详细，生成的专利质量越高。" maxlength="2000" show-word-limit
            resize="vertical" />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="resetForm" size="large">清空重填</el-button>
            <el-button type="primary" @click="generateDraft" :loading="generating" size="large">
              <el-icon class="mr-1">
                <Star />
              </el-icon>
              {{ generating ? '生成中...' : '生成专利草稿' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { patentDraftService } from '@/services/patentDraft'
import type { PatentDraft } from '@/types'
import { DraftStatus } from '@/types'

// Composables
const router = useRouter()

// 响应式数据
const formRef = ref()
const generating = ref(false)

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入发明名称', trigger: 'blur' },
    { min: 3, max: 50, message: '发明名称长度应为3-50个字符', trigger: 'blur' }
  ],
  technicalField: [
    { required: true, message: '请填写技术领域', trigger: 'blur' },
    { min: 3, message: '技术领域描述至少20个字符', trigger: 'blur' }
  ],
  technicalSolution: [
    { required: true, message: '请填写技术方案', trigger: 'blur' },
    { min: 50, message: '技术方案描述至少50个字符', trigger: 'blur' }
  ]
}

// 草稿数据
const draftData = reactive({
  title: '',
  technicalField: '',
  technicalSolution: '',
  backgroundTechnology: '',
  technicalProblem: '',
  claims: [] as any[],
  description: '',
  abstract: ''
})

// 方法
const generateDraft = async () => {
  // 表单验证
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请正确填写所有必填项')
    return
  }

  generating.value = true

  try {
    ElMessage.info('AI正在分析您的技术方案，生成专利草稿...')

    // 调用后端API生成专利草稿
    await patentDraftService.createDraft({
      title: draftData.title,
      technicalField: draftData.technicalField,
      technicalSolution: draftData.technicalSolution
    })

    ElMessage.success('专利草稿任务已提交，请在草稿管理中查看结果')

    // 跳转到草稿管理页面
    setTimeout(() => {
      router.push('/app/patent-draft/manage')
    }, 1500)
  } catch (error: any) {
    ElMessage.error(error.message || 'AI生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(draftData, {
    title: '',
    technicalField: '',
    technicalSolution: '',
    backgroundTechnology: '',
    technicalProblem: '',
    claims: [],
    description: '',
    abstract: ''
  })
  ElMessage.success('表单已重置')
}
</script>

<style scoped lang="scss">
.patent-draft-new-container {
  .page-header {
    margin-bottom: var(--spacing-lg);
    text-align: center;
    padding: var(--spacing-xl) 0;

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-sm);
    }

    .page-subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
    }
  }

  .form-card {
    margin-bottom: var(--spacing-lg);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: var(--font-weight-medium);
    }

    .form-tips {
      margin-bottom: var(--spacing-lg);
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border-light);

      .el-button {
        min-width: 140px;
      }
    }
  }

  .preview-card {
    max-width: 1000px;
    margin: 0 auto;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: var(--font-weight-medium);

      .preview-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .preview-content {
      .preview-section {
        margin-bottom: var(--spacing-2xl);
        padding: var(--spacing-lg);
        background-color: var(--color-bg-light);
        border-radius: var(--border-radius-base);
        border-left: 4px solid var(--color-primary);

        h4 {
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
        }

        h5 {
          color: var(--color-text-primary);
          margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
        }

        p {
          color: var(--color-text-secondary);
          line-height: var(--line-height-relaxed);
          margin: 0;
          text-align: justify;
        }

        .claim-preview {
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--color-bg-white);
          border-radius: var(--border-radius-base);
          border: 1px solid var(--color-border-light);
          line-height: var(--line-height-relaxed);

          strong {
            color: var(--color-primary);
            font-weight: var(--font-weight-semibold);
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .form-card {
      margin: 0 var(--spacing-sm) var(--spacing-lg) var(--spacing-sm);
    }

    .preview-card {
      margin: 0 var(--spacing-sm);
    }

    .form-actions {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 100%;
        max-width: 300px;
      }
    }
  }
}

// 全局样式补充
.mr-1 {
  margin-right: 4px;
}
</style>

<template>
  <div class="patent-draft-edit-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <div class="title-info">
          <h1 class="page-title">{{ isEditing ? '编辑草稿' : '新建草稿' }}</h1>
          <p class="page-subtitle">{{ draftData.title || '未命名草稿' }}</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="saveDraft" :loading="saving">
          <el-icon>
            <Document />
          </el-icon>
          {{ saving ? '保存中...' : '保存草稿' }}
        </el-button>
        <el-button type="primary" @click="submitDraft" :loading="submitting">
          <el-icon>
            <Check />
          </el-icon>
          {{ submitting ? '提交中...' : '提交审查' }}
        </el-button>
      </div>
    </div>

    <!-- 编辑表单 -->
    <div class="edit-content">
      <el-form ref="formRef" :model="draftData" label-width="120px">
        <!-- 基本信息 -->
        <el-card class="section-card">
          <template #header>
            <span>基本信息</span>
          </template>

          <el-form-item label="发明名称" required>
            <el-input v-model="draftData.title" placeholder="请输入发明名称" />
          </el-form-item>

          <el-form-item label="技术领域" required>
            <el-input v-model="draftData.technicalField" type="textarea" :rows="3" placeholder="请描述技术领域" />
          </el-form-item>

          <el-form-item label="背景技术">
            <el-input v-model="draftData.backgroundTechnology" type="textarea" :rows="4" placeholder="请描述背景技术" />
          </el-form-item>
        </el-card>

        <!-- 发明内容 -->
        <el-card class="section-card">
          <template #header>
            <span>发明内容</span>
          </template>

          <el-form-item label="技术问题">
            <el-input v-model="draftData.technicalProblem" type="textarea" :rows="4" placeholder="请描述要解决的技术问题" />
          </el-form-item>

          <el-form-item label="技术方案">
            <el-input v-model="draftData.technicalSolution" type="textarea" :rows="6" placeholder="请详细描述技术方案" />
          </el-form-item>
        </el-card>

        <!-- 权利要求 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>权利要求</span>
              <el-button size="small" @click="addClaim">
                <el-icon>
                  <Plus />
                </el-icon>
                添加权利要求
              </el-button>
            </div>
          </template>

          <div v-for="(claim, index) in draftData.claims" :key="claim.id" class="claim-item">
            <div class="claim-header">
              <span class="claim-number">权利要求 {{ index + 1 }}</span>
              <div class="claim-actions">
                <el-select v-model="claim.type" size="small" style="width: 100px">
                  <el-option label="独立" value="independent" />
                  <el-option label="从属" value="dependent" />
                </el-select>
                <el-button size="small" type="danger" @click="removeClaim(index)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
            <el-input v-model="claim.content" type="textarea" :rows="3" :placeholder="`请输入权利要求${index + 1}的内容`" />
          </div>
        </el-card>

        <!-- 说明书 -->
        <el-card class="section-card">
          <template #header>
            <span>说明书</span>
          </template>

          <el-form-item label="摘要">
            <el-input v-model="draftData.abstract" type="textarea" :rows="4" placeholder="请输入说明书摘要" />
          </el-form-item>

          <el-form-item label="说明书">
            <el-input v-model="draftData.description" type="textarea" :rows="8" placeholder="请详细描述发明的实施方式" />
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Document,
  Check,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import { patentDraftService } from '@/services/patentDraft'
import type { PatentDraft, Claim } from '@/types'
import { DraftStatus } from '@/types'

// Composables
const route = useRoute()
const router = useRouter()

// 响应式数据
const formRef = ref()
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const isEditing = ref(false)

const draftData = reactive<Partial<PatentDraft>>({
  title: '',
  technicalField: '',
  backgroundTechnology: '',
  technicalProblem: '',
  technicalSolution: '',
  claims: [],
  description: '',
  abstract: '',
  status: DraftStatus.DRAFT
})

// 方法
const loadDraftData = async () => {
  const draftId = route.params.id as string
  if (!draftId) return

  loading.value = true
  try {
    const draft = await patentDraftService.getDraftDetail(draftId)
    Object.assign(draftData, draft)
    isEditing.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载草稿失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const addClaim = () => {
  const newClaim: Claim = {
    id: `claim-${Date.now()}`,
    type: 'independent',
    content: '',
    order: (draftData.claims?.length || 0) + 1
  }

  if (!draftData.claims) {
    draftData.claims = []
  }

  draftData.claims.push(newClaim)
}

const removeClaim = (index: number) => {
  if (draftData.claims) {
    draftData.claims.splice(index, 1)
    // 重新排序
    draftData.claims.forEach((claim, idx) => {
      claim.order = idx + 1
    })
  }
}

const saveDraft = async () => {
  if (!draftData.title?.trim()) {
    ElMessage.warning('请输入发明名称')
    return
  }

  saving.value = true
  try {
    if (isEditing.value && route.params.id) {
      await patentDraftService.updateDraft(route.params.id as string, {
        ...draftData,
        status: DraftStatus.DRAFT
      })
      ElMessage.success('草稿保存成功')
    } else {
      ElMessage.info('创建草稿功能开发中...')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const submitDraft = async () => {
  if (!draftData.title?.trim()) {
    ElMessage.warning('请输入发明名称')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && route.params.id) {
      await patentDraftService.updateDraft(route.params.id as string, {
        ...draftData,
        status: DraftStatus.REVIEWING
      })
      ElMessage.success('提交审查成功')
      router.push('/app/patent-draft/manage')
    } else {
      ElMessage.info('提交功能开发中...')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 生命周期
onMounted(() => {
  if (route.params.id) {
    loadDraftData()
  } else {
    // 新建模式，添加默认权利要求
    addClaim()
  }
})
</script>

<style scoped lang="scss">
.patent-draft-edit-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--color-border-light);

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .title-info {
        .page-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .page-subtitle {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          margin: 0;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .edit-content {
    .section-card {
      margin-bottom: var(--spacing-lg);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }

      .claim-item {
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-md);
        border: 1px solid var(--color-border-light);
        border-radius: var(--border-radius-base);

        .claim-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .claim-number {
            font-weight: var(--font-weight-medium);
            color: var(--color-text-primary);
          }

          .claim-actions {
            display: flex;
            gap: var(--spacing-sm);
            align-items: center;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .patent-draft-edit-container {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style>

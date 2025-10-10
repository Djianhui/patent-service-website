<template>
  <div class="patent-draft-new-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">新建专利草稿</h1>
      <p class="page-subtitle">使用AI助手撰写专业的专利申请文件</p>
    </div>

    <!-- 撰写向导 -->
    <el-card class="wizard-card">
      <template #header>
        <span>撰写向导</span>
      </template>

      <el-steps :active="currentStep" finish-status="success">
        <el-step title="选择模板" />
        <el-step title="技术交底" />
        <el-step title="权利要求" />
        <el-step title="说明书" />
        <el-step title="摘要" />
      </el-steps>

      <!-- 步骤1: 选择模板 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>选择专利模板</h3>
        <div class="template-grid">
          <div
            v-for="template in templates"
            :key="template.id"
            class="template-item"
            :class="{ selected: selectedTemplate?.id === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="template-header">
              <h4>{{ template.name }}</h4>
              <el-tag :type="template.type === 'invention' ? 'primary' : 'success'">
                {{ getTemplateTypeText(template.type) }}
              </el-tag>
            </div>
            <p class="template-desc">{{ template.description }}</p>
            <div class="template-fields">
              <span v-for="field in template.fields" :key="field" class="field-tag">
                {{ field }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 技术交底 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>技术交底书</h3>
        <el-form :model="draftData" label-width="120px">
          <el-form-item label="发明名称" required>
            <el-input v-model="draftData.title" placeholder="请输入发明名称" />
          </el-form-item>

          <el-form-item label="技术领域">
            <el-input
              v-model="draftData.technicalField"
              type="textarea"
              :rows="3"
              placeholder="请描述本发明所属的技术领域"
            />
          </el-form-item>

          <el-form-item label="背景技术">
            <el-input
              v-model="draftData.backgroundTechnology"
              type="textarea"
              :rows="5"
              placeholder="请描述现有技术的状况及存在的问题"
            />
          </el-form-item>

          <el-form-item label="技术问题">
            <el-input
              v-model="draftData.technicalProblem"
              type="textarea"
              :rows="3"
              placeholder="请描述本发明要解决的技术问题"
            />
          </el-form-item>

          <el-form-item label="技术方案">
            <el-input
              v-model="draftData.technicalSolution"
              type="textarea"
              :rows="8"
              placeholder="请详细描述本发明的技术方案"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 权利要求 -->
      <div v-if="currentStep === 2" class="step-content">
        <h3>权利要求书</h3>
        <div class="claims-section">
          <div class="claims-header">
            <span>权利要求</span>
            <el-button size="small" @click="addClaim">
              <el-icon><Plus /></el-icon>
              添加权利要求
            </el-button>
          </div>

          <div class="claims-list">
            <div
              v-for="(claim, index) in draftData.claims"
              :key="claim.id"
              class="claim-item"
            >
              <div class="claim-header">
                <span>权利要求 {{ index + 1 }}</span>
                <div class="claim-actions">
                  <el-select v-model="claim.type" size="small" style="width: 100px">
                    <el-option label="独立" value="independent" />
                    <el-option label="从属" value="dependent" />
                  </el-select>
                  <el-button size="small" text @click="removeClaim(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <el-input
                v-model="claim.content"
                type="textarea"
                :rows="4"
                :placeholder="`请输入权利要求${index + 1}的内容`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤4: 说明书 -->
      <div v-if="currentStep === 3" class="step-content">
        <h3>说明书</h3>
        <el-form :model="draftData" label-width="120px">
          <el-form-item label="具体实施方式">
            <el-input
              v-model="draftData.description"
              type="textarea"
              :rows="10"
              placeholder="请详细描述发明的具体实施方式"
            />
          </el-form-item>

          <el-form-item label="有益效果">
            <el-input
              v-model="draftData.beneficialEffects"
              type="textarea"
              :rows="4"
              placeholder="请描述本发明的有益效果"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤5: 摘要 -->
      <div v-if="currentStep === 4" class="step-content">
        <h3>摘要</h3>
        <el-form :model="draftData" label-width="120px">
          <el-form-item label="摘要">
            <el-input
              v-model="draftData.abstract"
              type="textarea"
              :rows="6"
              placeholder="请撰写发明摘要（不超过300字）"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 导航按钮 -->
      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="previousStep">上一步</el-button>
        <el-button v-if="currentStep < 4" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 4" type="primary" @click="generateDraft" :loading="generating">
          {{ generating ? '生成中...' : '生成草稿' }}
        </el-button>
      </div>
    </el-card>

    <!-- 预览区域 -->
    <el-card v-if="showPreview" class="preview-card">
      <template #header>
        <div class="preview-header">
          <span>草稿预览</span>
          <div class="preview-actions">
            <el-button size="small" @click="saveDraft" :loading="saving">保存草稿</el-button>
            <el-button size="small" type="primary" @click="downloadDraft">下载</el-button>
          </div>
        </div>
      </template>

      <div class="preview-content">
        <div class="preview-section">
          <h4>发明名称</h4>
          <p>{{ draftData.title }}</p>
        </div>

        <div class="preview-section">
          <h4>摘要</h4>
          <p>{{ draftData.abstract }}</p>
        </div>

        <div class="preview-section">
          <h4>权利要求书</h4>
          <div v-for="(claim, index) in draftData.claims" :key="claim.id" class="claim-preview">
            <strong>{{ index + 1 }}. </strong>{{ claim.content }}
          </div>
        </div>

        <div class="preview-section">
          <h4>说明书</h4>
          <div class="description-preview">
            <h5>技术领域</h5>
            <p>{{ draftData.technicalField }}</p>
            
            <h5>背景技术</h5>
            <p>{{ draftData.backgroundTechnology }}</p>
            
            <h5>发明内容</h5>
            <p>{{ draftData.technicalSolution }}</p>
            
            <h5>具体实施方式</h5>
            <p>{{ draftData.description }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { generateRandomString } from '@/utils'

// 响应式数据
const currentStep = ref(0)
const selectedTemplate = ref(null)
const generating = ref(false)
const saving = ref(false)
const showPreview = ref(false)

// 专利模板
const templates = ref([
  {
    id: '1',
    name: '发明专利模板',
    type: 'invention',
    description: '适用于各种技术发明的标准模板',
    fields: ['技术领域', '背景技术', '发明内容', '具体实施方式']
  },
  {
    id: '2',
    name: '实用新型模板',
    type: 'utility',
    description: '适用于产品结构改进的实用新型专利',
    fields: ['技术领域', '背景技术', '实用新型内容']
  },
  {
    id: '3',
    name: '软件专利模板',
    type: 'software',
    description: '专门用于软件算法和系统的专利申请',
    fields: ['技术领域', '背景技术', '算法实现', '系统架构']
  }
])

// 草稿数据
const draftData = reactive({
  title: '',
  technicalField: '',
  backgroundTechnology: '',
  technicalProblem: '',
  technicalSolution: '',
  claims: [] as Array<{
    id: string
    type: 'independent' | 'dependent'
    content: string
    order: number
  }>,
  description: '',
  beneficialEffects: '',
  abstract: ''
})

// 方法
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
}

const getTemplateTypeText = (type: string) => {
  const texts: Record<string, string> = {
    invention: '发明专利',
    utility: '实用新型',
    software: '软件专利'
  }
  return texts[type] || '未知'
}

const nextStep = () => {
  if (currentStep.value === 0 && !selectedTemplate.value) {
    ElMessage.warning('请选择专利模板')
    return
  }
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const addClaim = () => {
  draftData.claims.push({
    id: generateRandomString(),
    type: 'independent',
    content: '',
    order: draftData.claims.length + 1
  })
}

const removeClaim = (index: number) => {
  draftData.claims.splice(index, 1)
}

const generateDraft = async () => {
  if (!draftData.title.trim()) {
    ElMessage.warning('请填写发明名称')
    return
  }

  generating.value = true
  
  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showPreview.value = true
    ElMessage.success('草稿生成完成！')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

const saveDraft = async () => {
  saving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const downloadDraft = () => {
  ElMessage.success('草稿下载中...')
}
</script>

<style scoped lang="scss">
.patent-draft-new-container {
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

  .wizard-card {
    margin-bottom: var(--spacing-lg);

    .step-content {
      margin: var(--spacing-2xl) 0;

      h3 {
        margin-bottom: var(--spacing-lg);
        color: var(--color-text-primary);
      }

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-lg);

        .template-item {
          border: 2px solid var(--color-border-light);
          border-radius: var(--border-radius-base);
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            border-color: var(--color-primary);
          }

          &.selected {
            border-color: var(--color-primary);
            background-color: rgba(24, 144, 255, 0.05);
          }

          .template-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);

            h4 {
              margin: 0;
              color: var(--color-text-primary);
            }
          }

          .template-desc {
            color: var(--color-text-secondary);
            margin-bottom: var(--spacing-md);
          }

          .template-fields {
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;

            .field-tag {
              background-color: var(--color-bg-tertiary);
              padding: var(--spacing-xs) var(--spacing-sm);
              border-radius: var(--border-radius-small);
              font-size: var(--font-size-xs);
              color: var(--color-text-secondary);
            }
          }
        }
      }

      .claims-section {
        .claims-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .claims-list {
          .claim-item {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-lg);
            border: 1px solid var(--color-border-light);
            border-radius: var(--border-radius-base);

            .claim-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--spacing-md);

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

    .step-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-2xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border-light);
    }
  }

  .preview-card {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .preview-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }

    .preview-content {
      .preview-section {
        margin-bottom: var(--spacing-2xl);

        h4 {
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-lg);
        }

        h5 {
          color: var(--color-text-primary);
          margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
          font-size: var(--font-size-base);
        }

        p {
          color: var(--color-text-secondary);
          line-height: var(--line-height-relaxed);
          margin: 0;
        }

        .claim-preview {
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-sm);
          background-color: var(--color-bg-secondary);
          border-radius: var(--border-radius-base);
          line-height: var(--line-height-relaxed);
        }
      }
    }
  }
}
</style>
<template>
  <div class="defense-cases-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">答辩案例管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          新建答辩案例
        </el-button>
      </div>
    </div>

    <!-- 案例列表 -->
    <el-card class="cases-card">
      <template #header>
        <div class="card-header">
          <span>答辩案例列表</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索案例..."
            style="width: 300px"
            clearable
          />
        </div>
      </template>

      <div class="cases-list">
        <div
          v-for="case_ in filteredCases"
          :key="case_.id"
          class="case-item"
          @click="viewCase(case_)"
        >
          <div class="case-header">
            <h3 class="case-title">{{ case_.title }}</h3>
            <div class="case-status">
              <el-tag :type="getStatusType(case_.status)">
                {{ getStatusText(case_.status) }}
              </el-tag>
            </div>
          </div>

          <div class="case-meta">
            <span class="meta-item">
              <el-icon><Document /></el-icon>
              申请号：{{ case_.applicationNumber }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              创建时间：{{ formatDate(case_.createTime) }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              答辩截止：{{ formatDate(case_.deadline) }}
            </span>
          </div>

          <div class="case-summary">
            <p>{{ case_.summary }}</p>
          </div>

          <div class="case-actions" @click.stop>
            <el-button size="small" text @click="viewCase(case_)">
              查看详情
            </el-button>
            <el-button size="small" text @click="startDefense(case_)">
              开始答辩
            </el-button>
            <el-button size="small" text type="danger" @click="deleteCase(case_)">
              删除
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredCases.length === 0" class="empty-state">
          <el-empty description="暂无答辩案例">
            <el-button type="primary" @click="showCreateDialog = true">
              创建第一个案例
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-card>

    <!-- 创建案例对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建答辩案例" width="600px">
      <el-form ref="formRef" :model="newCase" :rules="formRules" label-width="120px">
        <el-form-item label="案例标题" prop="title" required>
          <el-input v-model="newCase.title" placeholder="请输入案例标题" />
        </el-form-item>

        <el-form-item label="专利申请号" prop="applicationNumber">
          <el-input v-model="newCase.applicationNumber" placeholder="请输入专利申请号" />
        </el-form-item>

        <el-form-item label="审查意见" prop="examinationOpinion" required>
          <el-input
            v-model="newCase.examinationOpinion"
            type="textarea"
            :rows="5"
            placeholder="请输入审查意见的主要内容"
          />
        </el-form-item>

        <el-form-item label="答辩截止日期" prop="deadline">
          <el-date-picker
            v-model="newCase.deadline"
            type="date"
            placeholder="选择答辩截止日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="案例说明">
          <el-input
            v-model="newCase.summary"
            type="textarea"
            :rows="3"
            placeholder="简要说明案例情况（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCase" :loading="creating">
          创建案例
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Document, Calendar, Clock } from '@element-plus/icons-vue'
import { formatDate, generateRandomString } from '@/utils'

// Composables
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const creating = ref(false)
const formRef = ref<FormInstance>()

// 案例数据
const cases = ref([
  {
    id: '1',
    title: 'AI算法专利答辩案例',
    applicationNumber: 'CN202110123456.7',
    examinationOpinion: '审查员认为权利要求1不具备新颖性...',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    summary: '关于人工智能算法的专利申请，审查员对新颖性提出质疑',
    status: 'preparing',
    createTime: new Date().toISOString()
  },
  {
    id: '2',
    title: '物联网设备专利答辩',
    applicationNumber: 'CN202110234567.8',
    examinationOpinion: '权利要求的技术方案不清楚...',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    summary: '物联网设备相关专利，需要修改权利要求书',
    status: 'submitted',
    createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
])

// 新建案例表单
const newCase = reactive({
  title: '',
  applicationNumber: '',
  examinationOpinion: '',
  deadline: null,
  summary: ''
})

// 计算属性
const filteredCases = computed(() => {
  if (!searchKeyword.value) return cases.value
  
  return cases.value.filter(case_ =>
    case_.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    case_.applicationNumber.includes(searchKeyword.value) ||
    case_.summary.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入案例标题', trigger: 'blur' }
  ],
  examinationOpinion: [
    { required: true, message: '请输入审查意见', trigger: 'blur' }
  ]
}

// 方法
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    preparing: 'warning',
    submitted: 'primary',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    preparing: '准备中',
    submitted: '已提交',
    approved: '已批准',
    rejected: '被驳回'
  }
  return texts[status] || '未知'
}

const viewCase = (case_: any) => {
  router.push(`/app/defense-support/case/${case_.id}`)
}

const startDefense = (case_: any) => {
  router.push(`/app/defense-support/strategy?caseId=${case_.id}`)
}

const deleteCase = async (case_: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除案例"${case_.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = cases.value.findIndex(c => c.id === case_.id)
    if (index !== -1) {
      cases.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    // 用户取消删除
  }
}

const createCase = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return
  } catch (error) {
    return
  }

  creating.value = true

  try {
    // 模拟创建过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newCaseData = {
      id: generateRandomString(),
      title: newCase.title,
      applicationNumber: newCase.applicationNumber,
      examinationOpinion: newCase.examinationOpinion,
      deadline: newCase.deadline?.toISOString() || '',
      summary: newCase.summary,
      status: 'preparing',
      createTime: new Date().toISOString()
    }

    cases.value.unshift(newCaseData)

    // 重置表单
    if (formRef.value) {
      formRef.value.resetFields()
    }
    Object.assign(newCase, {
      title: '',
      applicationNumber: '',
      examinationOpinion: '',
      deadline: null,
      summary: ''
    })

    showCreateDialog.value = false
    ElMessage.success('案例创建成功')
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped lang="scss">
.defense-cases-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }
  }

  .cases-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cases-list {
      .case-item {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border-light);
        cursor: pointer;
        transition: background-color var(--transition-fast);

        &:hover {
          background-color: var(--color-bg-secondary);
        }

        &:last-child {
          border-bottom: none;
        }

        .case-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-sm);

          .case-title {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-medium);
            color: var(--color-text-primary);
            margin: 0;
            flex: 1;
          }

          .case-status {
            margin-left: var(--spacing-md);
          }
        }

        .case-meta {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;

          .meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);

            .el-icon {
              font-size: 14px;
            }
          }
        }

        .case-summary {
          margin-bottom: var(--spacing-md);

          p {
            color: var(--color-text-secondary);
            line-height: var(--line-height-relaxed);
            font-size: var(--font-size-sm);
            margin: 0;
          }
        }

        .case-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .empty-state {
        padding: var(--spacing-3xl) 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .defense-cases-container {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .cases-card .cases-list .case-item {
      .case-meta {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .case-actions {
        justify-content: flex-end;
      }
    }
  }
}
</style>
<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="welcome-info">
          <h1 class="welcome-title">
            {{ t('dashboard.welcomeBack', { user: authStore.userName || t('dashboard.user') }) }}
          </h1>
          <p class="welcome-subtitle">
            {{ t('dashboard.todayIs', { date: formatDate(new Date(), 'MMMM DD, YYYY') }) }}
          </p>
        </div>
        <div class="quick-actions">
          <el-button type="primary" :icon="Plus" @click="$router.push('/app/tech-report/new')">
            {{ t('dashboard.newTechReport') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 系统使用引导 -->
    <div class="guide-section">
      <el-card class="guide-card">
        <template #header>
          <div class="guide-header">
            <el-icon class="guide-icon">
              <InfoFilled />
            </el-icon>
            <span>{{ t('dashboard.systemUsageGuide') }}</span>
          </div>
        </template>

        <div class="guide-content">
          <p class="guide-description">
            {{ t('dashboard.guideDescription') }}
          </p>

          <div class="steps-container">
            <div v-for="(step, index) in guideSteps" :key="step.key" class="step-item" @click="router.push(step.path)">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <div class="step-title">
                  <el-icon class="step-icon" :style="{ color: step.color }">
                    <component :is="step.icon" />
                  </el-icon>
                  {{ step.title }}
                </div>
                <div class="step-description">{{ step.description }}</div>
              </div>
              <div v-if="index < guideSteps.length - 1" class="step-arrow">
                <el-icon>
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>

          <div class="guide-tips">
            <el-alert :title="t('dashboard.tips')" :description="t('dashboard.guideTips')" type="info" show-icon
              :closable="false" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷工具 -->
    <div class="quick-tools-section">
      <h2 class="section-title">{{ t('dashboard.quickTools.title') }}</h2>
      <div class="tools-grid">
        <div v-for="tool in quickTools" :key="tool.key" class="tool-card" @click="$router.push(tool.path)">
          <div class="tool-icon" :style="{ backgroundColor: tool.color }">
            <el-icon>
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="tool-content">
            <div class="tool-title">{{ tool.title }}</div>
            <div class="tool-description">{{ tool.description }}</div>
          </div>
          <div class="tool-arrow">
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <div class="left-column">
        <!-- 最近活动 -->
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.recentActivities') }}</span>
              <el-link type="primary" @click="$router.push('/app/tech-report/history')">
                {{ t('dashboard.viewAll') }}
              </el-link>
            </div>
          </template>

          <div class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <el-icon>
                  <component :is="activity.icon" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
                <div class="activity-time">{{ formatDate(activity.time) }}</div>
              </div>
              <el-button size="small" text @click="viewActivity(activity)">
                {{ t('dashboard.view') }}
              </el-button>
            </div>
          </div>

          <div v-if="recentActivities.length === 0" class="empty-state">
            <el-empty :description="t('dashboard.noActivityRecords')" />
          </div>
        </el-card>
      </div>

      <div class="right-column">
        <!-- 待办事项 -->
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>{{ t('dashboard.todoList') }}</span>
              <el-button size="small" text @click="showAddTodo = true">
                <el-icon>
                  <Plus />
                </el-icon>
                {{ t('dashboard.add') }}
              </el-button>
            </div>
          </template>

          <div class="todo-list">
            <div v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
              <el-checkbox v-model="todo.completed" @change="updateTodo(todo)" />
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-deadline" v-if="todo.deadline">
                  {{ t('dashboard.due') }}: {{ formatDate(todo.deadline, 'MM-DD HH:mm') }}
                </div>
              </div>
              <el-button size="small" text @click="deleteTodo(todo.id)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </div>

          <div v-if="todoList.length === 0" class="empty-state">
            <el-empty :description="t('dashboard.noTodoItems')" />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加待办事项对话框 -->
    <el-dialog v-model="showAddTodo" :title="t('dashboard.addTodoItem')" width="400px">
      <el-form :model="newTodo" label-width="80px">
        <el-form-item :label="t('dashboard.title')" required>
          <el-input v-model="newTodo.title" :placeholder="t('dashboard.enterTodoTitle')" />
        </el-form-item>
        <el-form-item :label="t('dashboard.deadline')">
          <el-date-picker v-model="newTodo.deadline" type="datetime" :placeholder="t('dashboard.selectDeadline')"
            style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddTodo = false">{{ t('dashboard.cancel') }}</el-button>
        <el-button type="primary" @click="addTodo">{{ t('dashboard.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate, generateRandomString } from '@/utils'
import { useI18n } from 'vue-i18n'
import {
  Plus,
  Search,
  TrendCharts,
  Document,
  DataAnalysis,
  Edit,
  ChatDotSquare,
  Delete,
  InfoFilled,
  ArrowRight,
  DocumentChecked
} from '@element-plus/icons-vue'
// import * as echarts from 'echarts'

// Composables
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 响应式数据
const showAddTodo = ref(false)

// 系统使用引导步骤
const guideSteps = computed(() => [
  {
    key: 'tech-report',
    title: t('dashboard.guideSteps.techReport.title'),
    description: t('dashboard.guideSteps.techReport.description'),
    icon: 'Document',
    color: '#1890ff',
    path: '/app/tech-report/new'
  },
  {
    key: 'patent-draft',
    title: t('dashboard.guideSteps.patentDraft.title'),
    description: t('dashboard.guideSteps.patentDraft.description'),
    icon: 'Edit',
    color: '#722ed1',
    path: '/app/patent-draft/new'
  }
])

// 快捷工具
const recentActivities = ref<Array<{
  id: string
  type: string
  icon: string
  title: string
  description: string
  time: string
}>>([
  // {
  //   id: '1',
  //   type: 'report',
  //   icon: 'Document',
  //   title: 'Complete Technical Report',
  //   description: 'Intelligent voice recognition system technical analysis',
  //   time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  // },
  // {
  //   id: '2',
  //   type: 'search',
  //   icon: 'Search',
  //   title: 'Patent Search',
  //   description: 'Found 25 related patent documents',
  //   time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  // },
  // {
  //   id: '3',
  //   type: 'analysis',
  //   icon: 'DataAnalysis',
  //   title: 'Three Analysis Completed',
  //   description: 'Machine learning algorithm patent novelty analysis',
  //   time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  // }
])

// 快捷工具
const quickTools = computed(() => [
  {
    key: 'tech-report',
    title: t('dashboard.quickTools.techReport.title'),
    description: t('dashboard.quickTools.techReport.description'),
    icon: 'Document',
    color: '#1890ff',
    path: '/app/tech-report/new'
  },
  {
    key: 'patent-draft',
    title: t('dashboard.quickTools.patentDraft.title'),
    description: t('dashboard.quickTools.patentDraft.description'),
    icon: 'Edit',
    color: '#722ed1',
    path: '/app/patent-draft/new'
  }
])

// 待办事项
const todoList = ref<Array<{
  id: string
  title: string
  completed: boolean
  deadline: string | null
}>>([

])

const newTodo = reactive({
  title: '',
  deadline: null
})

// 方法
const viewActivity = (activity: any) => {
  // 根据活动类型跳转到相应页面
  switch (activity.type) {
    case 'report':
      router.push('/app/tech-report/history')
      break
    case 'search':
      router.push('/app/patent-search/results')
      break
    case 'analysis':
      router.push('/app/three-analysis/history')
      break
    default:
      break
  }
}

const addTodo = () => {
  if (!newTodo.title.trim()) return

  todoList.value.unshift({
    id: generateRandomString(),
    title: newTodo.title,
    completed: false,
    deadline: newTodo.deadline
  })

  // 重置表单
  newTodo.title = ''
  newTodo.deadline = null
  showAddTodo.value = false
}

const updateTodo = (todo: any) => {
  // 这里可以调用API更新待办事项状态
  console.log('Update to-do item:', todo)
}

const deleteTodo = (id: string) => {
  const index = todoList.value.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todoList.value.splice(index, 1)
  }
}

// 生命周期
onMounted(async () => {
  // 页面初始化
})
</script>

<style scoped lang="scss">
.dashboard-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8f9fa;
  padding: 24px;

  .page-header {
    margin-bottom: 32px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .welcome-info {
        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .welcome-subtitle {
          color: #6c757d;
          font-size: 16px;
          line-height: 1.5;
        }
      }

      .quick-actions {
        display: flex;
        gap: 12px;

        @media (max-width: 768px) {
          width: 100%;

          .el-button {
            flex: 1;
          }
        }

        .el-button {
          height: 44px;
          padding: 0 20px;
          font-weight: 600;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;

          &:hover {
            background: linear-gradient(135deg, #5568d3 0%, #6a4093 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }
      }
    }
  }

  .guide-section {
    margin-bottom: 32px;

    .guide-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e9ecef;
      background: #ffffff;

      :deep(.el-card__header) {
        padding: 20px 24px;
        border-bottom: 1px solid #e9ecef;
        font-weight: 600;
        color: #2c3e50;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }

      .guide-header {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: #2c3e50;
        font-size: 18px;

        .guide-icon {
          color: #667eea;
          font-size: 20px;
        }
      }

      .guide-content {
        .guide-description {
          color: #6c757d;
          font-size: 15px;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .steps-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;

          @media (max-width: 1200px) {
            flex-direction: column;
          }

          .step-item {
            flex: 1;
            min-width: 280px;
            display: flex;
            align-items: center;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            background: #ffffff;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);

            &:hover {
              border-color: #667eea;
              box-shadow: 0 6px 12px rgba(102, 126, 234, 0.15);
              transform: translateY(-3px);
            }

            .step-number {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
              margin-right: 16px;
              flex-shrink: 0;
            }

            .step-content {
              flex: 1;

              .step-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 10px;
                font-size: 16px;

                .step-icon {
                  font-size: 18px;
                }
              }

              .step-description {
                color: #6c757d;
                font-size: 14px;
                line-height: 1.5;
              }
            }

            .step-arrow {
              position: absolute;
              right: -15px;
              color: #adb5bd;
              font-size: 20px;
              z-index: 1;

              @media (max-width: 1200px) {
                display: none;
              }
            }

            @media (max-width: 1200px) {
              &:not(:last-child)::after {
                content: '';
                position: absolute;
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 12px solid #adb5bd;
              }
            }
          }
        }

        .guide-tips {
          margin-top: 24px;

          :deep(.el-alert) {
            border-radius: 8px;
            background-color: #e7f4ff;
            border: 1px solid #d0e8ff;
          }

          :deep(.el-alert__title) {
            font-weight: 600;
            color: #2c3e50;
          }

          :deep(.el-alert__description) {
            color: #6c757d;
          }
        }
      }
    }
  }

  .quick-tools-section {
    margin-bottom: 32px;

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 24px;
      text-align: center;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .tool-card {
        display: flex;
        align-items: center;
        padding: 24px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #e9ecef;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .tool-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          margin-right: 20px;
          flex-shrink: 0;
        }

        .tool-content {
          flex: 1;

          .tool-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }

          .tool-description {
            color: #6c757d;
            font-size: 14px;
            line-height: 1.6;
          }
        }

        .tool-arrow {
          color: #adb5bd;
          font-size: 20px;
          margin-left: 16px;
        }
      }
    }
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 24px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }

    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .el-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e9ecef;
      background: #ffffff;

      :deep(.el-card__header) {
        padding: 20px 24px;
        border-bottom: 1px solid #e9ecef;
        font-weight: 600;
        color: #2c3e50;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      :deep(.el-link) {
        font-weight: 500;
      }

      :deep(.el-button) {
        font-weight: 500;
        color: #6c757d;
      }
    }

    .activity-card {
      .activity-list {
        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          .activity-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;

            &.report {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.search {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }

            &.analysis {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
          }

          .activity-content {
            flex: 1;

            .activity-title {
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 6px;
              font-size: 15px;
            }

            .activity-desc {
              color: #666;
              font-size: 14px;
              margin-bottom: 6px;
              line-height: 1.5;
            }

            .activity-time {
              color: #adb5bd;
              font-size: 13px;
            }
          }

          :deep(.el-button) {
            color: #6c757d;
            font-weight: 500;
          }
        }
      }
    }

    .todo-card {
      .todo-list {
        .todo-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          &.completed {
            opacity: 0.7;

            .todo-title {
              text-decoration: line-through;
            }
          }

          :deep(.el-checkbox) {
            margin-top: 2px;
          }

          .todo-content {
            flex: 1;

            .todo-title {
              font-weight: 500;
              color: #1a1a1a;
              margin-bottom: 6px;
              font-size: 15px;
            }

            .todo-deadline {
              color: #6c757d;
              font-size: 13px;
              background-color: #f1f3f4;
              padding: 4px 8px;
              border-radius: 4px;
              display: inline-block;
            }
          }

          :deep(.el-button) {
            color: #6c757d;
            margin-top: 2px;
          }
        }
      }
    }

    .empty-state {
      padding: 40px 0;
      text-align: center;

      :deep(.el-empty) {
        padding: 0;
      }

      :deep(.el-empty__description) {
        color: #6c757d;
      }
    }
  }

  // 对话框样式
  :deep(.el-dialog) {
    border-radius: 12px;

    .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid #e9ecef;
      font-weight: 600;
      color: #2c3e50;
    }

    .el-dialog__body {
      padding: 24px;
    }

    .el-dialog__footer {
      padding: 20px 24px;
      border-top: 1px solid #e9ecef;
    }

    .el-form-item {
      margin-bottom: 20px;

      .el-form-item__label {
        font-weight: 500;
        color: #2c3e50;
      }
    }

    .el-button {
      border-radius: 6px;
      font-weight: 500;
    }
  }
}
</style>

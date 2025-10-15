<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="welcome-info">
          <h1 class="welcome-title">
            欢迎回来，{{ authStore.userName || '用户' }}！
          </h1>
          <p class="welcome-subtitle">
            今天是 {{ formatDate(new Date(), 'YYYY年MM月DD日') }}，让我们开始今天的工作吧
          </p>
        </div>
        <div class="quick-actions">
          <el-button type="primary" :icon="Plus" @click="$router.push('/app/tech-report/new')">
            新建技术方案报告
          </el-button>
          <el-button :icon="Search" @click="$router.push('/app/patent-search/quick')">
            专利检索
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
            <span>系统使用引导</span>
          </div>
        </template>

        <div class="guide-content">
          <p class="guide-description">
            智能专利服务系统为您提供一站式专利申请解决方案，请按照以下步骤使用系统：
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
            <el-alert title="温馨提示" description="您可以从任何步骤开始使用系统，系统会根据您的需求提供相应的服务支持" type="info" show-icon
              :closable="false" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷工具 -->
    <div class="quick-tools-section">
      <h2 class="section-title">快捷工具</h2>
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
              <span>最近活动</span>
              <el-link type="primary" @click="$router.push('/app/tech-report/history')">
                查看全部
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
                查看
              </el-button>
            </div>
          </div>

          <div v-if="recentActivities.length === 0" class="empty-state">
            <el-empty description="暂无活动记录" />
          </div>
        </el-card>

        <!-- 快捷工具 -->
        <!-- <el-card class="tools-card">
          <template #header>
            <span>常用功能</span>
          </template>

          <div class="tools-grid">
            <div v-for="tool in quickTools.slice(0, 4)" :key="tool.key" class="tool-item"
              @click="$router.push(tool.path)">
              <div class="tool-icon" :style="{ backgroundColor: tool.color }">
                <el-icon>
                  <component :is="tool.icon" />
                </el-icon>
              </div>
              <div class="tool-info">
                <div class="tool-title">{{ tool.title }}</div>
                <div class="tool-desc">{{ tool.description }}</div>
              </div>
            </div>
          </div>
        </el-card> -->
      </div>

      <div class="right-column">
        <!-- 待办事项 -->
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button size="small" text @click="showAddTodo = true">
                <el-icon>
                  <Plus />
                </el-icon>
                添加
              </el-button>
            </div>
          </template>

          <div class="todo-list">
            <div v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
              <el-checkbox v-model="todo.completed" @change="updateTodo(todo)" />
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-deadline" v-if="todo.deadline">
                  截止时间：{{ formatDate(todo.deadline, 'MM-DD HH:mm') }}
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
            <el-empty description="暂无待办事项" />
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加待办事项对话框 -->
    <el-dialog v-model="showAddTodo" title="添加待办事项" width="400px">
      <el-form :model="newTodo" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="newTodo.title" placeholder="请输入待办事项标题" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker v-model="newTodo.deadline" type="datetime" placeholder="选择截止时间" style="width: 100%" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddTodo = false">取消</el-button>
        <el-button type="primary" @click="addTodo">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatDate, generateRandomString } from '@/utils'
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

// 响应式数据
const showAddTodo = ref(false)

// 系统使用引导步骤
const guideSteps = ref([
  {
    key: 'tech-report',
    title: '技术方案报告',
    description: '输入技术方案，系统自动生成专业的技术分析报告',
    icon: 'Document',
    color: '#1890ff',
    path: '/app/tech-report/new'
  },
  {
    key: 'patent-draft',
    title: '专利草稿撰写',
    description: '基于技术方案，AI智能撰写专利申请文件',
    icon: 'Edit',
    color: '#722ed1',
    path: '/app/patent-draft/new'
  },
  {
    key: 'patent-search',
    title: '专利检索',
    description: '检索相关专利文献，分析技术领域现状',
    icon: 'Search',
    color: '#52c41a',
    path: '/app/patent-search/quick'
  },
  {
    key: 'three-analysis',
    title: '三性分析',
    description: '分析专利的新颖性、创造性和实用性',
    icon: 'DataAnalysis',
    color: '#faad14',
    path: '/app/three-analysis/new'
  },
  {
    key: 'defense-simulation',
    title: '模拟审查',
    description: '模拟专利审查过程，提前发现问题并优化',
    icon: 'DocumentChecked',
    color: '#f5222d',
    path: '/app/defense-support/simulation'
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
  //   title: '完成技术方案报告',
  //   description: '智能语音识别系统技术方案分析',
  //   time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  // },
  // {
  //   id: '2',
  //   type: 'search',
  //   icon: 'Search',
  //   title: '专利检索',
  //   description: '检索到25件相关专利文献',
  //   time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  // },
  // {
  //   id: '3',
  //   type: 'analysis',
  //   icon: 'DataAnalysis',
  //   title: '三性分析完成',
  //   description: '机器学习算法专利新颖性分析',
  //   time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  // }
])

// 快捷工具
const quickTools = ref([
  {
    key: 'tech-report',
    title: '技术方案报告',
    description: '快速生成技术方案分析报告',
    icon: 'Document',
    color: '#1890ff',
    path: '/app/tech-report/new'
  },
  {
    key: 'patent-draft',
    title: '专利撰写',
    description: '撰写专利申请文件',
    icon: 'Edit',
    color: '#722ed1',
    path: '/app/patent-draft/new'
  },
  {
    key: 'patent-search',
    title: '专利检索',
    description: '检索相关专利文献',
    icon: 'Search',
    color: '#52c41a',
    path: '/app/patent-search/quick'
  },
  {
    key: 'three-analysis',
    title: '三性分析',
    description: '分析专利新颖性创造性',
    icon: 'DataAnalysis',
    color: '#faad14',
    path: '/app/three-analysis/new'
  },
  {
    key: 'defense-support',
    title: '答辩支持',
    description: '模拟审查意见通知书',
    icon: 'DocumentChecked',
    color: '#f5222d',
    path: '/app/defense-support/simulation'
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
  console.log('更新待办事项:', todo)
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
  .page-header {
    margin-bottom: var(--spacing-lg);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .welcome-info {
        .welcome-title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .welcome-subtitle {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }

      .quick-actions {
        display: flex;
        gap: var(--spacing-sm);

        @media (max-width: 768px) {
          width: 100%;

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }

  .guide-section {
    margin-bottom: var(--spacing-2xl);

    .guide-card {
      .guide-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);

        .guide-icon {
          color: var(--color-primary);
          font-size: 18px;
        }
      }

      .guide-content {
        .guide-description {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-lg);
          line-height: var(--line-height-relaxed);
        }

        .steps-container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);

          @media (max-width: 1200px) {
            flex-direction: column;
          }

          .step-item {
            flex: 1;
            min-width: 200px;
            display: flex;
            align-items: center;
            padding: var(--spacing-md);
            border: 2px solid var(--color-border-light);
            border-radius: var(--border-radius-base);
            background: var(--color-bg-light);
            cursor: pointer;
            transition: all var(--transition-base);
            position: relative;

            &:hover {
              border-color: var(--color-primary);
              box-shadow: var(--shadow-light);
              transform: translateY(-2px);
            }

            .step-number {
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
              color: white;
              border-radius: var(--border-radius-round);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: var(--font-weight-bold);
              font-size: var(--font-size-sm);
              margin-right: var(--spacing-md);
              flex-shrink: 0;
            }

            .step-content {
              flex: 1;

              .step-title {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-weight: var(--font-weight-medium);
                color: var(--color-text-primary);
                margin-bottom: var(--spacing-xs);
                font-size: var(--font-size-base);

                .step-icon {
                  font-size: 16px;
                }
              }

              .step-description {
                color: var(--color-text-secondary);
                font-size: var(--font-size-xs);
                line-height: var(--line-height-base);
              }
            }

            .step-arrow {
              position: absolute;
              right: -15px;
              color: var(--color-text-placeholder);
              font-size: 18px;
              z-index: 1;

              @media (max-width: 1200px) {
                display: none;
              }
            }

            @media (max-width: 1200px) {
              &:not(:last-child)::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 8px solid var(--color-text-placeholder);
              }
            }
          }
        }

        .guide-tips {
          margin-top: var(--spacing-lg);
        }
      }
    }
  }

  .quick-tools-section {
    margin-bottom: var(--spacing-2xl);

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .tool-card {
        display: flex;
        align-items: center;
        padding: var(--spacing-lg);
        background: var(--color-bg-primary);
        border-radius: var(--border-radius-large);
        box-shadow: var(--shadow-light);
        cursor: pointer;
        transition: all var(--transition-base);
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-base);
          border-color: var(--color-primary);
        }

        .tool-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--border-radius-base);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          margin-right: var(--spacing-lg);
          flex-shrink: 0;
        }

        .tool-content {
          flex: 1;

          .tool-title {
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .tool-description {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            line-height: var(--line-height-relaxed);
          }
        }

        .tool-arrow {
          color: var(--color-text-placeholder);
          font-size: 18px;
          margin-left: var(--spacing-md);
        }
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);

    .stat-card {
      background: var(--color-bg-primary);
      border-radius: var(--border-radius-large);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-light);
      transition: box-shadow var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-base);
      }

      .stat-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-info {
          .stat-title {
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
            margin-bottom: var(--spacing-xs);
          }

          .stat-value {
            font-size: var(--font-size-2xl);
            font-weight: var(--font-weight-bold);
            color: var(--color-text-primary);
            margin-bottom: var(--spacing-xs);
          }

          .stat-change {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-size-xs);

            &.increase {
              color: var(--color-success);
            }

            &.decrease {
              color: var(--color-error);
            }
          }
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--border-radius-base);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
        }
      }
    }
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-lg);

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }

    .left-column,
    .right-column {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-card {
      .activity-list {
        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid var(--color-border-light);

          &:last-child {
            border-bottom: none;
          }

          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--border-radius-round);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;

            &.report {
              background-color: #1890ff;
            }

            &.search {
              background-color: #52c41a;
            }

            &.analysis {
              background-color: #faad14;
            }
          }

          .activity-content {
            flex: 1;

            .activity-title {
              font-weight: var(--font-weight-medium);
              color: var(--color-text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .activity-desc {
              color: var(--color-text-secondary);
              font-size: var(--font-size-sm);
              margin-bottom: var(--spacing-xs);
            }

            .activity-time {
              color: var(--color-text-placeholder);
              font-size: var(--font-size-xs);
            }
          }
        }
      }
    }

    .tools-card {
      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);

        .tool-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--border-radius-base);
          border: 1px solid var(--color-border-light);
          cursor: pointer;
          transition: all var(--transition-fast);

          &:hover {
            border-color: var(--color-primary);
            box-shadow: var(--shadow-light);
          }

          .tool-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--border-radius-base);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          }

          .tool-info {
            .tool-title {
              font-weight: var(--font-weight-medium);
              color: var(--color-text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .tool-desc {
              color: var(--color-text-secondary);
              font-size: var(--font-size-xs);
            }
          }
        }
      }
    }

    .chart-card {
      .chart-container {
        height: 300px;
        width: 100%;
      }
    }

    .chart-card {
      .chart-container {
        height: 300px;
        width: 100%;
      }
    }

    .todo-card {
      .todo-list {
        .todo-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) 0;
          border-bottom: 1px solid var(--color-border-light);

          &:last-child {
            border-bottom: none;
          }

          &.completed {
            opacity: 0.6;

            .todo-title {
              text-decoration: line-through;
            }
          }

          .todo-content {
            flex: 1;

            .todo-title {
              font-weight: var(--font-weight-medium);
              color: var(--color-text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .todo-deadline {
              color: var(--color-text-secondary);
              font-size: var(--font-size-xs);
            }
          }
        }
      }
    }

    .empty-state {
      padding: var(--spacing-xl) 0;
    }
  }
}
</style>

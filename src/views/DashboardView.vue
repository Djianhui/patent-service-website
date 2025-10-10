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

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.key">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-change" :class="stat.changeType">
              <el-icon>
                <component :is="stat.changeType === 'increase' ? 'TrendCharts' : 'TrendCharts'" />
              </el-icon>
              {{ stat.change }}
            </div>
          </div>
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon>
              <component :is="stat.icon" />
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
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
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
        <el-card class="tools-card">
          <template #header>
            <span>快捷工具</span>
          </template>

          <div class="tools-grid">
            <div
              v-for="tool in quickTools"
              :key="tool.key"
              class="tool-item"
              @click="$router.push(tool.path)"
            >
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
        </el-card>
      </div>

      <div class="right-column">
        <!-- 进度统计图表 -->
        <el-card class="chart-card">
          <template #header>
            <span>本月工作统计</span>
          </template>

          <div ref="chartRef" class="chart-container"></div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button size="small" text @click="showAddTodo = true">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
          </template>

          <div class="todo-list">
            <div
              v-for="todo in todoList"
              :key="todo.id"
              class="todo-item"
              :class="{ completed: todo.completed }"
            >
              <el-checkbox
                v-model="todo.completed"
                @change="updateTodo(todo)"
              />
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-deadline" v-if="todo.deadline">
                  截止时间：{{ formatDate(todo.deadline, 'MM-DD HH:mm') }}
                </div>
              </div>
              <el-button size="small" text @click="deleteTodo(todo.id)">
                <el-icon><Delete /></el-icon>
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
          <el-date-picker
            v-model="newTodo.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
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
  Delete
} from '@element-plus/icons-vue'
// import * as echarts from 'echarts'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const chartRef = ref<HTMLElement>()
const showAddTodo = ref(false)

// 统计数据
const stats = ref([
  {
    key: 'reports',
    title: '技术方案报告',
    value: '12',
    change: '+2',
    changeType: 'increase',
    color: '#1890ff',
    icon: 'Document'
  },
  {
    key: 'searches',
    title: '专利检索次数',
    value: '48',
    change: '+15',
    changeType: 'increase',
    color: '#52c41a',
    icon: 'Search'
  },
  {
    key: 'analysis',
    title: '三性分析',
    value: '8',
    change: '+3',
    changeType: 'increase',
    color: '#faad14',
    icon: 'DataAnalysis'
  },
  {
    key: 'drafts',
    title: '专利草稿',
    value: '5',
    change: '+1',
    changeType: 'increase',
    color: '#722ed1',
    icon: 'Edit'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'report',
    icon: 'Document',
    title: '完成技术方案报告',
    description: '智能语音识别系统技术方案分析',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'search',
    icon: 'Search',
    title: '专利检索',
    description: '检索到25件相关专利文献',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'analysis',
    icon: 'DataAnalysis',
    title: '三性分析完成',
    description: '机器学习算法专利新颖性分析',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
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
    key: 'patent-draft',
    title: '专利撰写',
    description: '撰写专利申请文件',
    icon: 'Edit',
    color: '#722ed1',
    path: '/app/patent-draft/new'
  }
])

// 待办事项
const todoList = ref([
  {
    id: '1',
    title: '完成AI算法专利申请书撰写',
    completed: false,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: '审查意见答辩材料准备',
    completed: false,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: '技术交底书整理',
    completed: true,
    deadline: null
  }
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

const initChart = () => {
  if (!chartRef.value) return

  // 临时显示图表占位符
  chartRef.value.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: #999; font-size: 14px;">图表功能开发中...</div>'

  /*
  // ECharts 实现（需要安装依赖）
  const chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['技术方案报告', '专利检索', '三性分析', '专利撰写']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '技术方案报告',
        type: 'line',
        stack: 'Total',
        data: [2, 3, 1, 4, 2, 3, 2],
        smooth: true,
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '专利检索',
        type: 'line',
        stack: 'Total',
        data: [8, 12, 6, 15, 10, 8, 12],
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '三性分析',
        type: 'line',
        stack: 'Total',
        data: [1, 2, 0, 3, 1, 2, 1],
        smooth: true,
        itemStyle: { color: '#faad14' }
      },
      {
        name: '专利撰写',
        type: 'line',
        stack: 'Total',
        data: [1, 1, 2, 0, 1, 1, 0],
        smooth: true,
        itemStyle: { color: '#722ed1' }
      }
    ]
  }

  chart.setOption(option)

  // 响应式调整
  window.addEventListener('resize', () => {
    chart.resize()
  })
  */
}

// 生命周期
onMounted(async () => {
  await nextTick()
  initChart()
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

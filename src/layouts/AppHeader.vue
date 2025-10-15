<template>
  <header class="app-header">
    <div class="header-left">
      <el-button class="menu-toggle" :icon="collapsed ? 'Expand' : 'Fold'" text @click="$emit('toggle-sidebar')" />

      <div class="logo">
        <el-icon class="logo-icon">
          <Document />
        </el-icon>
        <span class="logo-text">专利服务平台</span>
      </div>
    </div>

    <div class="header-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-badge :value="notifications.length" class="notification-badge">
        <el-button :icon="Bell" circle text @click="showNotifications = true" />
      </el-badge>

      <el-dropdown @command="handleUserCommand">
        <div class="user-info">
          <el-avatar :src="user?.avatar" :icon="UserFilled" :size="32" />
          <span class="username">{{ user?.username || '用户' }}</span>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon>
                <UserIcon />
              </el-icon>
              个人中心
            </el-dropdown-item>
            <!-- <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              设置
            </el-dropdown-item> -->
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 通知抽屉 -->
    <el-drawer v-model="showNotifications" title="通知消息" direction="rtl" size="320px">
      <div class="notifications-content">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-empty description="暂无通知" />
        </div>

        <div v-else class="notification-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item"
            :class="{ 'unread': !notification.read }">
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatDate(notification.time) }}</div>
            </div>
            <el-button v-if="!notification.read" text size="small" @click="markAsRead(notification.id)">
              标记已读
            </el-button>
          </div>
        </div>

        <div class="notification-actions">
          <el-button type="primary" text @click="markAllAsRead">
            全部标记已读
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  Bell,
  UserFilled,
  ArrowDown,
  User as UserIcon,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils'
import type { User } from '@/types'

// Props
interface Props {
  user?: User | null
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  collapsed: false
})

// Emits
const emit = defineEmits<{
  'toggle-sidebar': []
  'logout': []
}>()

// Composables
const route = useRoute()
const router = useRouter()

// 响应式数据
const showNotifications = ref(false)
const notifications = ref([
  {
    id: '1',
    title: '报告生成完成',
    message: '您的技术方案报告已生成完成，请及时查看。',
    time: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    title: '检索结果更新',
    message: '专利检索发现新的相关文献，建议您查看。',
    time: new Date(Date.now() - 3600000).toISOString(),
    read: true
  }
])

// 计算属性
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const items = matched.map(item => ({
    title: item.meta?.title as string,
    path: item.path
  }))

  // 添加首页作为根路径
  if (items && items.length > 0 && items[0]?.path !== '/app/dashboard') {
    items.unshift({
      title: '首页',
      path: '/app/dashboard'
    })
  }

  return items
})

// 方法
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/app/profile')
      break
    case 'settings':
      router.push('/app/settings')
      break
    case 'logout':
      emit('logout')
      break
  }
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
}

// 生命周期
onMounted(() => {
  // 这里可以加载用户通知
})
</script>

<style scoped lang="scss">
.app-header {
  height: 64px;
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .menu-toggle {
      color: var(--color-text-secondary);
      font-size: 18px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);

      .logo-icon {
        font-size: 24px;
      }

      .logo-text {
        @media (max-width: 768px) {
          display: none;
        }
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 0 var(--spacing-xl);

    .el-breadcrumb {
      @media (max-width: 768px) {
        display: none;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .notification-badge {
      :deep(.el-badge__content) {
        top: 8px;
        right: 8px;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-base);
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: var(--color-bg-tertiary);
      }

      .username {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);

        @media (max-width: 768px) {
          display: none;
        }
      }

      .dropdown-icon {
        color: var(--color-text-secondary);
        font-size: 12px;
        transition: transform var(--transition-fast);
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
      }
    }
  }
}

.notifications-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .empty-notifications {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-list {
    flex: 1;
    overflow-y: auto;

    .notification-item {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);

      &.unread {
        background-color: rgba(24, 144, 255, 0.05);
        border-left: 3px solid var(--color-primary);
      }

      .notification-content {
        flex: 1;

        .notification-title {
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .notification-message {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--spacing-xs);
        }

        .notification-time {
          color: var(--color-text-placeholder);
          font-size: var(--font-size-xs);
        }
      }
    }
  }

  .notification-actions {
    padding: var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
    text-align: center;
  }
}
</style>

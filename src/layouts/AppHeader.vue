<template>
  <header class="app-header">
    <div class="header-left">
      <el-button class="menu-toggle" :icon="collapsed ? 'Expand' : 'Fold'" text @click="$emit('toggle-sidebar')" />

      <div class="logo">
        <img src="/favicon.ico" alt="Logo" class="logo-icon" />
        <span class="logo-text">{{ $t('auth.loginTitle') }}</span>
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
      <!-- 语言切换 -->
      <el-dropdown @command="handleLanguageChange">
        <el-button text>
          <span :class="`fi fi-${getFlagCode(currentLocale)}`" class="flag-icon-round"></span>
          {{ $t('settings.language') }}
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="lang in SUPPORT_LOCALES" :key="lang" :command="lang"
              :disabled="currentLocale === lang">
              <span :class="`fi fi-${getFlagCode(lang)}`" class="flag-icon-round"></span>
              {{ getLocaleName(lang) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

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
              {{ $t('menu.profile') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              {{ $t('auth.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 通知抽屉 -->
    <el-drawer v-model="showNotifications" :title="$t('notification.title')" direction="rtl" size="320px">
      <div class="notifications-content">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-empty :description="$t('notification.noNotification')" />
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
              {{ $t('notification.markAsRead') }}
            </el-button>
          </div>
        </div>

        <div class="notification-actions">
          <el-button type="primary" text @click="markAllAsRead">
            {{ $t('notification.markAllRead') }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Bell,
  UserFilled,
  ArrowDown,
  User as UserIcon,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils'
import type { User } from '@/types'
import { notificationService, type NotificationMessage } from '@/services/notification'
import { setLocale, type SupportLocale, getLocaleName, SUPPORT_LOCALES } from '@/i18n'

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
const { locale, t } = useI18n()

// 响应式数据
const showNotifications = ref(false)
const notifications = ref<NotificationMessage[]>([])
const currentLocale = computed(() => locale.value)

// 国旗图标映射
const flagMap: Record<string, string> = {
  'zh-CN': '🇨🇳',
  'en-US': '🇺🇸',
  'ja-JP': '🇯🇵',
  'de-DE': '🇩🇪',
  'fr-FR': '🇫🇷',
  'ru-RU': '🇷🇺',
  'ar-SA': '🇸🇦',
}

// 国家代码映射
const flagTextMap: Record<string, string> = {
  'zh-CN': 'CN',
  'en-US': 'US',
  'ja-JP': 'JP',
  'de-DE': 'DE',
  'fr-FR': 'FR',
  'ru-RU': 'RU',
  'ar-SA': 'SA',
}

const currentLanguageFlag = computed(() => flagMap[locale.value] || '🇺🇸')

const getFlagIcon = (lang: string) => {
  return flagMap[lang] || '🇺🇸'
}

// 获取国旗代码
const getFlagCode = (lang: string) => {
  const codeMap: Record<string, string> = {
    'zh-CN': 'cn',
    'en-US': 'us',
    'ja-JP': 'jp',
    'de-DE': 'de',
    'fr-FR': 'fr',
    'ru-RU': 'ru',
    'ar-SA': 'sa',
  }
  return codeMap[lang] || 'us'
}

// 导入 SUPPORT_LOCALES 和 getLocaleName 以供模板使用
const supportedLocales = SUPPORT_LOCALES
const getLanguageName = getLocaleName

// SSE消息处理器取消函数
let unsubscribe: (() => void) | null = null

// 路由名称到翻译键的映射
const routeTitleMap: Record<string, string> = {
  'Dashboard': 'menu.dashboard',
  'TechReport': 'menu.techReport',
  'TechReportNew': 'menu.newReport',
  'TechReportHistory': 'menu.reportHistory',
  'PatentSearch': 'menu.patentSearch',
  'PatentSearchQuick': 'menu.quickSearch',
  'ThreeAnalysis': 'menu.threeAnalysis',
  'ThreeAnalysisNew': 'menu.newAnalysis',
  'ThreeAnalysisHistory': 'menu.analysisHistory',
  'PatentDraft': 'menu.patentDraft',
  'PatentDraftNew': 'menu.newDraft',
  'PatentDraftManage': 'menu.draftManage',
  'DefenseSupport': 'menu.defenseSupport',
  'Profile': 'menu.profile'
}

// 计算属性
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.name)
  const items = matched.map(item => {
    const routeName = item.name as string
    const translationKey = routeTitleMap[routeName]
    return {
      title: translationKey ? t(translationKey) : (item.meta?.title as string || routeName),
      path: item.path
    }
  })

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

// 语言切换
const handleLanguageChange = (locale: string) => {
  setLocale(locale as SupportLocale)
  ElMessage.success(locale === 'zh-CN' ? '语言已切换为中文' : 'Language switched to English')
}

// 生命周期
onMounted(() => {
  // 如果用户已登录，建立SSE连接
  if (props.user?.userId) {
    connectSSE(props.user.userId)
  }
})

onUnmounted(() => {
  // 组件销毁时断开SSE连接
  if (unsubscribe) {
    unsubscribe()
  }
  notificationService.disconnect()
})

// 监听用户信息变化，重新建立SSE连接
watch(() => props.user, (newUser) => {
  if (newUser?.userId) {
    connectSSE(newUser.userId)
  } else {
    // 用户登出，断开连接
    if (unsubscribe) {
      unsubscribe()
    }
    notificationService.disconnect()
    notifications.value = []
  }
})

// 建立SSE连接
const connectSSE = (userId: string | number) => {
  console.log('=== AppHeader: connectSSE 被调用 ===')
  console.log('userId:', userId)

  // 先断开旧连接
  if (unsubscribe) {
    console.log('=== AppHeader: 取消之前的消息监听 ===')
    unsubscribe()
  }
  console.log('=== AppHeader: 断开旧SSE连接 ===')
  notificationService.disconnect()

  // 建立新连接
  console.log('=== AppHeader: 调用 notificationService.connect ===')
  notificationService.connect(userId)

  // 注册消息处理器
  console.log('=== AppHeader: 注册消息处理器 ===')
  unsubscribe = notificationService.onMessage((message) => {
    console.log('=== AppHeader: 收到新通知 ===')
    console.log('通知对象:', message)
    console.log('通知标题:', message.title)
    console.log('通知内容:', message.message)
    console.log('通知类型:', message.type)

    // 过滤掉 SSE 连接成功的系统消息
    const isConnectionMessage =
      message.message.includes('连接成功') ||
      message.message.match(/连接成功[:|：]\s*\d+/) ||
      (message.title === '系统通知' && message.message.includes('连接'))

    if (isConnectionMessage) {
      console.log('=== AppHeader: 过滤掉SSE连接成功消息，不显示 ===')
      return // 不处理连接成功消息
    }

    // 添加到通知列表
    try {
      notifications.value.unshift(message)
      console.log('已添加到通知列表，当前通知数:', notifications.value.length)
      console.log('通知列表:', notifications.value)
    } catch (error) {
      console.error('=== AppHeader: 添加到通知列表失败 ===')
      console.error(error)
    }

    // 显示消息提示
    try {
      console.log('=== AppHeader: 准备显示ElMessage提示 ===')

      // 确保消息内容不为空
      const messageText = message.message || message.title || '新消息'
      const messageType = ['success', 'warning', 'info', 'error'].includes(message.type || '')
        ? (message.type as 'success' | 'warning' | 'info' | 'error')
        : 'info'

      console.log('显示文本:', messageText)
      console.log('显示类型:', messageType)

      ElMessage({
        message: messageText,
        type: messageType,
        duration: 3000,
        showClose: true
      })

      console.log('=== AppHeader: ElMessage已调用 ===')
    } catch (error) {
      console.error('=== AppHeader: 显示ElMessage失败 ===')
      console.error(error)

      // 如果ElMessage失败，尝试使用简单提示
      try {
        ElMessage(message.message || '收到新消息')
      } catch (e) {
        console.error('简单提示也失败:', e)
      }
    }
  })

  console.log('=== AppHeader: SSE连接设置完成 ===')
}
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
      color: #1a1a1a;

      .logo-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
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

    .flag-icon-round {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      overflow: hidden;
      display: inline-block;
      background-size: cover;
      background-position: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-right: 6px;
      flex-shrink: 0;
    }

    :deep(.el-dropdown-menu__item) {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
    }

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
        background-color: rgba(102, 126, 234, 0.05);
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

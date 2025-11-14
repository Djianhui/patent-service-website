<template>
  <header class="app-header">
    <!-- 顶部装饰条 -->
    <div class="header-decoration"></div>

    <div class="header-content">
      <div class="header-left">
        <el-button class="menu-toggle" :icon="collapsed ? 'Expand' : 'Fold'" text @click="$emit('toggle-sidebar')" />

        <div class="logo">
          <router-link :to="{ name: 'Home' }" class="logo-link">
            <div class="logo-icon-wrapper">
              <el-icon :size="24">
                <DataAnalysis />
              </el-icon>
            </div>
            <span class="logo-text">{{ $t('auth.loginTitle') }}</span>
          </router-link>
        </div>
      </div>

      <div class="header-center">
        <!-- 可以添加搜索框或其他中心内容 -->
      </div>

      <div class="header-right">
        <!-- 通知铃铛 -->
        <div class="notification-wrapper">
          <el-badge :value="notifications.length" :max="99" class="notification-badge">
            <el-button class="icon-button" circle text @click="showNotifications = true">
              <el-icon :size="20">
                <Bell />
              </el-icon>
            </el-button>
          </el-badge>
        </div>

        <!-- 用户信息 -->
        <el-dropdown @command="handleUserCommand" trigger="click">
          <div class="user-info">
            <el-avatar :src="user?.avatar" :icon="UserFilled" :size="36" class="user-avatar" />
            <div class="user-details">
              <span class="username">{{ user?.username || '用户' }}</span>
              <span class="user-role">普通用户</span>
            </div>
            <el-icon class="dropdown-icon" :size="14">
              <ArrowDown />
            </el-icon>
          </div>

          <template #dropdown>
            <el-dropdown-menu class="user-dropdown">
              <el-dropdown-item command="profile">
                <el-icon>
                  <UserIcon />
                </el-icon>
                <span>{{ $t('menu.profile') }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                <span>{{ $t('auth.logout') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 通知抽屉 -->
    <el-drawer v-model="showNotifications" :title="$t('notification.title')" direction="rtl" size="380px"
      class="notification-drawer">
      <div class="notifications-content">
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-icon :size="64" color="#d0d7de">
            <Bell />
          </el-icon>
          <p class="empty-text">{{ $t('notification.noNotification') }}</p>
        </div>

        <div v-else class="notification-list">
          <div v-for="notification in notifications" :key="notification.id" class="notification-item"
            :class="{ 'unread': !notification.read }">
            <div class="notification-icon" :class="notification.type">
              <el-icon :size="20">
                <Bell />
              </el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-time">{{ formatDate(notification.time, 'HH:mm') }}</span>
              </div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-footer">
                <span class="notification-date">{{ formatDate(notification.time, 'MM-DD') }}</span>
                <el-button v-if="!notification.read" text size="small" @click="markAsRead(notification.id)">
                  {{ $t('notification.markAsRead') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="notification-actions" v-if="notifications.length > 0">
          <el-button type="primary" text @click="markAllAsRead">
            <el-icon>
              <Check />
            </el-icon>
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
  SwitchButton,
  DataAnalysis,
  Check
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
  const messages: Record<string, string> = {
    'zh-CN': '语言已切换为中文',
    'en-US': 'Language switched to English',
    'ja-JP': '言語が日本語に切り替わりました',
    'de-DE': 'Sprache auf Deutsch umgeschaltet',
    'fr-FR': 'Langue basculée vers le français',
    'ru-RU': 'Язык изменен на русский',
    'ar-SA': 'تم تبديل اللغة إلى العربية',
  }
  ElMessage.success(messages[locale] || 'Language switched')
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
      message.message.includes('ping') ||
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
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
  box-shadow: 0 2px 12px rgba(15, 76, 129, 0.08);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;

  // 顶部装饰条
  .header-decoration {
    height: 3px;
    background: linear-gradient(90deg, #0F4C81 0%, #1a5f9e 50%, #6A5ACD 100%);
    box-shadow: 0 2px 8px rgba(15, 76, 129, 0.3);
  }

  .header-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--spacing-lg);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .menu-toggle {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      color: #0F4C81;
      font-size: 18px;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);

      &:hover {
        background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
        color: #fff;
        transform: rotate(180deg);
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
      }
    }

    .logo {
      .logo-link {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
          transform: translateX(4px);

          .logo-icon-wrapper {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(15, 76, 129, 0.3);
          }
        }

        .logo-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.25);
          transition: all 0.3s ease;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(90deg, #0F4C81 0%, #6A5ACD 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;

          @media (max-width: 768px) {
            display: none;
          }
        }
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 0 var(--spacing-xl);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .notification-wrapper {
      .icon-button {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
        transition: all 0.3s ease;

        .el-icon {
          color: #0F4C81;
          transition: all 0.3s ease;
        }

        &:hover {
          background: linear-gradient(135deg, #0F4C81 0%, #6A5ACD 100%);
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
          transform: translateY(-2px);

          .el-icon {
            color: #fff;
            animation: bell-ring 0.5s ease;
          }
        }
      }

      .notification-badge {
        :deep(.el-badge__content) {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
          font-weight: 600;
        }
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px 6px 6px;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);
      border: 2px solid transparent;

      &:hover {
        background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
        border-color: #0F4C81;
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.15);
        transform: translateY(-2px);

        .user-avatar {
          box-shadow: 0 4px 12px rgba(15, 76, 129, 0.3);
        }

        .dropdown-icon {
          transform: rotate(180deg);
          color: #0F4C81;
        }
      }

      .user-avatar {
        flex-shrink: 0;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(15, 76, 129, 0.15);
        transition: all 0.3s ease;
      }

      .user-details {
        display: flex;
        flex-direction: column;
        gap: 2px;

        @media (max-width: 768px) {
          display: none;
        }

        .username {
          font-weight: 600;
          font-size: 14px;
          color: #2c3e50;
          line-height: 1.2;
        }

        .user-role {
          font-size: 11px;
          color: #6A5ACD;
          font-weight: 500;
          line-height: 1.2;
        }
      }

      .dropdown-icon {
        color: #6A5ACD;
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
    }
  }
}

// 用户下拉菜单样式
:deep(.user-dropdown) {
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 76, 129, 0.15);
  border: 1px solid #e7f0ff;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 8px;
    margin: 2px 0;
    font-weight: 500;
    transition: all 0.3s ease;

    .el-icon {
      font-size: 16px;
      color: #0F4C81;
    }

    &:hover {
      background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
      color: #0F4C81;
      transform: translateX(4px);
    }
  }
}

// 通知抽屉样式
:deep(.notification-drawer) {
  .el-drawer__header {
    padding: 20px 24px;
    margin-bottom: 0;
    border-bottom: 2px solid #e7f0ff;
    background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);

    .el-drawer__title {
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(90deg, #0F4C81 0%, #6A5ACD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .el-drawer__body {
    padding: 0;
  }
}

.notifications-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fafbfd 0%, #f5f7fc 100%);

  .empty-notifications {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    .empty-text {
      color: #9ca3af;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .notification-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 12px;
      background: #fff;
      border: 2px solid #e7f0ff;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        border-color: #0F4C81;
        box-shadow: 0 4px 12px rgba(15, 76, 129, 0.12);
        transform: translateX(4px);
      }

      &.unread {
        background: linear-gradient(135deg, #fff5f5 0%, #ffe7f0 100%);
        border-color: #6A5ACD;

        .notification-icon {
          background: linear-gradient(135deg, #6A5ACD 0%, #8B7EC8 100%);
          animation: pulse 2s ease-in-out infinite;
        }
      }

      .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #e7f0ff 0%, #d5e5ff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0F4C81;
        flex-shrink: 0;
        transition: all 0.3s ease;

        &.success {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
        }

        &.warning {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
        }

        &.error {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          color: #721c24;
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .notification-title {
            font-weight: 600;
            font-size: 14px;
            color: #2c3e50;
            flex: 1;
          }

          .notification-time {
            font-size: 12px;
            color: #6A5ACD;
            font-weight: 500;
            flex-shrink: 0;
            margin-left: 8px;
          }
        }

        .notification-message {
          color: #5a6c7d;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .notification-date {
            font-size: 11px;
            color: #9ca3af;
          }

          .el-button {
            font-size: 12px;
            color: #0F4C81;
            font-weight: 600;

            &:hover {
              color: #6A5ACD;
            }
          }
        }
      }
    }
  }

  .notification-actions {
    padding: 16px 20px;
    border-top: 2px solid #e7f0ff;
    text-align: center;
    background: linear-gradient(135deg, #f8f9fc 0%, #e7f0ff 100%);

    .el-button {
      font-weight: 600;
      color: #0F4C81;

      .el-icon {
        margin-right: 6px;
      }

      &:hover {
        color: #6A5ACD;
      }
    }
  }
}

// 铃铛摇晃动画
@keyframes bell-ring {

  0%,
  100% {
    transform: rotate(0deg);
  }

  10%,
  30% {
    transform: rotate(-10deg);
  }

  20%,
  40% {
    transform: rotate(10deg);
  }
}

// 脉冲动画
@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}
</style>

<template>
  <div class="app-container">
    <AppHeader :user="user" :collapsed="sidebarCollapsed" @toggle-sidebar="toggleSidebar" @logout="handleLogout" />

    <div class="app-body">
      <AppSidebar :collapsed="sidebarCollapsed" :menu-items="menuItems" @menu-select="handleMenuSelect" />

      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 响应式数据
const sidebarCollapsed = ref(false)

// 计算属性
const user = computed(() => authStore.user)

// 菜单项配置 - 使用 computed 以支持语言切换
const menuItems = computed(() => [
  {
    id: 'dashboard',
    title: t('menu.dashboard'),
    icon: 'House',
    path: '/app/dashboard'
  },
  {
    id: 'tech-report',
    title: t('menu.techReport'),
    icon: 'Document',
    path: '/app/tech-report',
    children: [
      {
        id: 'tech-report-new',
        title: t('menu.newReport'),
        path: '/app/tech-report/new'
      },
      {
        id: 'tech-report-history',
        title: t('menu.reportHistory'),
        path: '/app/tech-report/history'
      }
    ]
  },
  {
    id: 'patent-draft',
    title: t('menu.patentDraft'),
    icon: 'Edit',
    path: '/app/patent-draft',
    children: [
      {
        id: 'patent-draft-new',
        title: t('menu.newDraft'),
        path: '/app/patent-draft/new'
      },
      {
        id: 'patent-draft-manage',
        title: t('menu.draftManage'),
        path: '/app/patent-draft/manage'
      }
    ]
  },
  {
    id: 'patent-search',
    title: t('menu.patentSearch'),
    icon: 'Search',
    path: '/app/patent-search',
    children: [
      {
        id: 'patent-search-quick',
        title: t('menu.quickSearch'),
        path: '/app/patent-search/quick'
      }
    ]
  },
  {
    id: 'three-analysis',
    title: t('menu.threeAnalysis'),
    icon: 'DataAnalysis',
    path: '/app/three-analysis',
    children: [
      {
        id: 'three-analysis-new',
        title: t('menu.newAnalysis'),
        path: '/app/three-analysis/new'
      },
      {
        id: 'three-analysis-history',
        title: t('menu.analysisHistory'),
        path: '/app/three-analysis/history'
      }
    ]
  },
  {
    id: 'defense-support',
    title: t('menu.defenseSupport'),
    icon: 'ChatDotSquare',
    path: '/app/defense-support/simulation'
  },
  {
    id: 'profile',
    title: t('menu.profile'),
    icon: 'User',
    path: '/app/profile'
  }
])

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
}

const handleMenuSelect = (path: string) => {
  router.push(path)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// 生命周期
onMounted(() => {
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }

  // 检查登录状态
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
})
</script>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  display: flex;
  flex: 1;
}

.app-main {
  flex: 1;
  padding: var(--spacing-lg);
  min-height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: var(--color-bg-secondary);
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }

  .app-main {
    padding: var(--spacing-md);
  }
}
</style>

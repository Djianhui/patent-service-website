import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'
import AppLayout from '@/layouts/AppLayout.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/LandingView.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  {
    path: '/google-callback',
    name: 'GoogleCallback',
    component: () => import('@/views/auth/GoogleCallback.vue'),
    meta: {
      title: 'Google登录处理',
      requiresAuth: false,
      hideForAuth: true,
    },
  },
  {
    path: '/app',
    component: AppLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        redirect: '/app/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          title: '',
          icon: 'House',
        },
      },
      {
        path: 'tech-report',
        name: 'TechReport',
        meta: {
          title: '技术方案报告',
          icon: 'Document',
        },
        children: [
          {
            path: '',
            redirect: '/app/tech-report/new',
          },
          {
            path: 'new',
            name: 'TechReportNew',
            component: () => import('@/views/tech-report/TechReportNewView.vue'),
            meta: {
              title: '新建报告',
            },
          },
          {
            path: 'history',
            name: 'TechReportHistory',
            component: () => import('@/views/tech-report/TechReportHistoryView.vue'),
            meta: {
              title: '历史报告',
            },
          },
          {
            path: ':id',
            name: 'TechReportDetail',
            component: () => import('@/views/tech-report/TechReportDetailView.vue'),
            meta: {
              title: '报告详情',
            },
          },
        ],
      },
      {
        path: 'patent-search',
        name: 'PatentSearch',
        meta: {
          title: '专利检索',
          icon: 'Search',
        },
        children: [
          {
            path: '',
            redirect: '/app/patent-search/quick',
          },
          {
            path: 'quick',
            name: 'PatentSearchQuick',
            component: () => import('@/views/patent-search/QuickSearchView.vue'),
            meta: {
              title: '快速检索',
            },
          },
          {
            path: 'results',
            name: 'PatentSearchResults',
            component: () => import('@/views/patent-search/SearchResultsView.vue'),
            meta: {
              title: '检索结果',
            },
          },
        ],
      },
      {
        path: 'three-analysis',
        name: 'ThreeAnalysis',
        meta: {
          title: '三性分析',
          icon: 'DataAnalysis',
        },
        children: [
          {
            path: '',
            redirect: '/app/three-analysis/new',
          },
          {
            path: 'new',
            name: 'ThreeAnalysisNew',
            component: () => import('@/views/three-analysis/ThreeAnalysisNewView.vue'),
            meta: {
              title: '新建分析',
            },
          },
          {
            path: 'history',
            name: 'ThreeAnalysisHistory',
            component: () => import('@/views/three-analysis/ThreeAnalysisHistoryView.vue'),
            meta: {
              title: '分析历史',
            },
          },
          {
            path: ':id',
            name: 'ThreeAnalysisDetail',
            component: () => import('@/views/three-analysis/ThreeAnalysisDetailView.vue'),
            meta: {
              title: '分析详情',
            },
          },
        ],
      },
      {
        path: 'patent-draft',
        name: 'PatentDraft',
        meta: {
          title: '专利撰写',
          icon: 'Edit',
        },
        children: [
          {
            path: '',
            redirect: '/app/patent-draft/new',
          },
          {
            path: 'new',
            name: 'PatentDraftNew',
            component: () => import('@/views/patent-draft/PatentDraftNewView.vue'),
            meta: {
              title: '新建草稿',
            },
          },
          {
            path: 'manage',
            name: 'PatentDraftManage',
            component: () => import('@/views/patent-draft/PatentDraftManageView.vue'),
            meta: {
              title: '草稿管理',
            },
          },
          {
            path: 'edit/:id',
            name: 'PatentDraftEdit',
            component: () => import('@/views/patent-draft/PatentDraftEditView.vue'),
            meta: {
              title: '编辑草稿',
            },
          },
        ],
      },
      {
        path: 'defense-support',
        name: 'DefenseSupport',
        meta: {
          title: '答辩支持',
          icon: 'ChatDotSquare',
        },
        children: [
          {
            path: '',
            redirect: '/app/defense-support/simulation',
          },
          {
            path: 'simulation',
            name: 'DefenseSupportSimulation',
            component: () => import('@/views/defense-support/DefenseSimulationView.vue'),
            meta: {
              title: '模拟审查',
            },
          },
        ],
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          title: '用户中心',
          icon: 'User',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { t } = i18n.global

  // 设置页面标题
  const routeName = to.name as string
  const appName = 'PatentPro'
  const separator = ' - '

  // 根据路由名称获取标题翻译键
  const titleTranslationMap: Record<string, string> = {
    Home: 'menu.home',
    Login: 'auth.login',
    Register: 'auth.register',
    GoogleCallback: 'auth.processingGoogleLogin',
    Dashboard: 'menu.dashboard',
    TechReport: 'menu.techReport',
    TechReportNew: 'menu.newReport',
    TechReportHistory: 'menu.reportHistory',
    TechReportDetail: 'techReport.viewReport',
    PatentSearch: 'menu.patentSearch',
    PatentSearchQuick: 'menu.quickSearch',
    PatentSearchResults: 'menu.searchResults',
    ThreeAnalysis: 'menu.threeAnalysis',
    ThreeAnalysisNew: 'menu.newAnalysis',
    ThreeAnalysisHistory: 'menu.analysisHistory',
    ThreeAnalysisDetail: 'patentSearch.viewDetail',
    PatentDraft: 'menu.patentDraft',
    PatentDraftNew: 'menu.newDraft',
    PatentDraftManage: 'menu.draftManage',
    PatentDraftEdit: 'common.edit',
    DefenseSupport: 'menu.defenseSupport',
    DefenseSupportSimulation: 'menu.simulation',
    Profile: 'menu.profile',
    NotFound: 'common.error',
  }

  const translationKey = titleTranslationMap[routeName]
  if (translationKey) {
    const pageTitle = t(translationKey)
    if (routeName === 'Home') {
      // 首页：PatentPro - Intelligent Patent Service Platform
      const suffix = t('auth.loginSubtitle')
      document.title = `${appName}${separator}${suffix}`
    } else {
      // 其他页面：页面标题 - PatentPro
      document.title = `${pageTitle}${separator}${appName}`
    }
  } else {
    // 默认标题
    const suffix = t('auth.loginSubtitle')
    document.title = `${appName}${separator}${suffix}`
  }

  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    // 检查登录状态
    if (!authStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // 如果已登录，不允许访问登录/注册页面
  if (to.meta?.hideForAuth && authStore.isLoggedIn) {
    next('/app/dashboard')
    return
  }

  // 权限检查
  if (to.meta?.permission) {
    const hasPermission = authStore.hasPermission(to.meta.permission as string)
    if (!hasPermission) {
      ElMessage.error('没有权限访问此页面')
      next('/app/dashboard')
      return
    }
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  ElMessage.error('页面加载失败')
})

export default router

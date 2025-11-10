import './assets/styles/index.scss'
import 'flag-icons/css/flag-icons.min.css'

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Error Info:', info)
}

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)

// 设置初始页面标题并监听语言变化
const updatePageTitle = () => {
  const { t } = i18n.global
  const appName = 'PatentPro'
  const separator = ' - '
  const suffix = t('auth.loginSubtitle')
  document.title = `${appName}${separator}${suffix}`
}

// 初始化标题
updatePageTitle()

// 监听语言变化并更新标题
watch(
  () => i18n.global.locale.value,
  () => {
    updatePageTitle()
  },
)

app.mount('#app')

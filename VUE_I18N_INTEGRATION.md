# Vue I18n 多语言切换功能集成文档

## 📋 概述

本文档说明了如何在专利服务平台中使用 Vue I18n 实现多语言切换功能。

## 🎯 功能特性

- ✅ 支持中文（zh-CN）和英文（en-US）
- ✅ 语言选择持久化到 localStorage
- ✅ 全局语言切换按钮（在顶部导航栏）
- ✅ 完整的翻译文件结构
- ✅ TypeScript 类型支持
- ✅ Composition API 风格

## 📦 安装依赖

```bash
npm install vue-i18n@9
```

## 📁 文件结构

```
src/
├── i18n/
│   ├── index.ts           # i18n 配置和工具函数
│   └── locales/
│       ├── zh-CN.ts       # 中文翻译
│       └── en-US.ts       # 英文翻译
├── layouts/
│   └── AppHeader.vue      # 顶部导航（含语言切换器）
└── main.ts                # 应用入口
```

## 🔧 核心配置

### 1. i18n 实例配置 (`src/i18n/index.ts`)

```typescript
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const i18n = createI18n({
  legacy: false,              // 使用 Composition API
  locale: 'zh-CN',           // 默认语言
  fallbackLocale: 'zh-CN',   // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  globalInjection: true      // 全局注入 $t
})

export default i18n
```

### 2. 在 main.ts 中注册

```typescript
import i18n from './i18n'

app.use(i18n)
```

## 📝 翻译文件示例

### 中文翻译 (`src/i18n/locales/zh-CN.ts`)

```typescript
export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    // ...
  },
  menu: {
    home: '首页',
    dashboard: '工作台',
    // ...
  },
  auth: {
    login: '登录',
    username: '用户名',
    // ...
  }
}
```

### 英文翻译 (`src/i18n/locales/en-US.ts`)

```typescript
export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    // ...
  },
  menu: {
    home: 'Home',
    dashboard: 'Dashboard',
    // ...
  },
  auth: {
    login: 'Login',
    username: 'Username',
    // ...
  }
}
```

## 💡 使用方法

### 1. 在模板中使用

```vue
<template>
  <div>
    <!-- 方式1: 使用 $t -->
    <h1>{{ $t('menu.home') }}</h1>
    
    <!-- 方式2: 在属性中使用 -->
    <el-button :label="$t('common.confirm')">
      {{ $t('common.confirm') }}
    </el-button>
    
    <!-- 方式3: 在 placeholder 中使用 -->
    <el-input :placeholder="$t('auth.pleaseEnterUsername')" />
  </div>
</template>
```

### 2. 在脚本中使用

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

// 获取翻译文本
const confirmText = t('common.confirm')

// 在消息提示中使用
ElMessage.success(t('common.success'))

// 获取当前语言
console.log(locale.value) // 'zh-CN' 或 'en-US'
</script>
```

### 3. 切换语言

```vue
<script setup lang="ts">
import { setLocale } from '@/i18n'

// 切换到中文
const switchToChinese = () => {
  setLocale('zh-CN')
}

// 切换到英文
const switchToEnglish = () => {
  setLocale('en-US')
}
</script>
```

## 🎨 语言切换器组件

在 `AppHeader.vue` 中已集成语言切换下拉菜单：

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <el-button :icon="Histogram" circle text />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">
          简体中文
        </el-dropdown-item>
        <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, type SupportLocale } from '@/i18n'
import { ElMessage } from 'element-plus'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const handleLanguageChange = (newLocale: string) => {
  setLocale(newLocale as SupportLocale)
  ElMessage.success(
    newLocale === 'zh-CN' 
      ? '语言已切换为中文' 
      : 'Language switched to English'
  )
}
</script>
```

## 📚 翻译键命名规范

建议使用模块化的命名方式：

```
模块.功能.具体项
```

示例：
- `common.confirm` - 通用确认按钮
- `auth.login` - 认证模块登录
- `patentSearch.startSearch` - 专利检索模块开始检索
- `menu.home` - 菜单首页

## 🔄 添加新翻译

1. 在 `src/i18n/locales/zh-CN.ts` 中添加中文翻译
2. 在 `src/i18n/locales/en-US.ts` 中添加对应的英文翻译
3. 确保键名完全一致

示例：

```typescript
// zh-CN.ts
export default {
  myModule: {
    newFeature: '新功能',
    newButton: '新按钮'
  }
}

// en-US.ts
export default {
  myModule: {
    newFeature: 'New Feature',
    newButton: 'New Button'
  }
}
```

## 🛠️ 工具函数

### setLocale(locale)
切换语言并保存到 localStorage

```typescript
import { setLocale } from '@/i18n'
setLocale('en-US')
```

### getLocale()
获取当前语言

```typescript
import { getLocale } from '@/i18n'
const current = getLocale() // 'zh-CN' 或 'en-US'
```

### getLocaleName(locale)
获取语言的显示名称

```typescript
import { getLocaleName } from '@/i18n'
const name = getLocaleName('zh-CN') // '简体中文'
```

## 📱 响应式语言切换

语言切换是响应式的，所有使用 `$t()` 或 `t()` 的地方会自动更新。

```vue
<template>
  <!-- 切换语言后自动更新 -->
  <h1>{{ $t('menu.home') }}</h1>
</template>
```

## 🌐 支持的语言

当前支持：
- 简体中文 (zh-CN)
- 英文 (en-US)

扩展其他语言：
1. 在 `src/i18n/locales/` 下创建新的语言文件，如 `ja-JP.ts`
2. 在 `src/i18n/index.ts` 中导入并注册
3. 更新 `SUPPORT_LOCALES` 类型

## 💾 持久化

用户选择的语言会自动保存到 `localStorage`，刷新页面后保持选择。

存储键：`locale`

## 🎯 最佳实践

1. **统一管理翻译**：所有翻译文本集中在 `locales` 文件夹中
2. **避免硬编码文本**：界面上的文本都应该使用 `$t()` 或 `t()`
3. **保持键名一致**：中英文翻译文件的键名必须完全一致
4. **模块化命名**：使用清晰的模块化命名规则
5. **提供默认值**：对于可选内容，提供合理的默认值

## 🔍 调试技巧

### 查看缺失的翻译

如果翻译键不存在，Vue I18n 会显示键名本身，便于识别。

### 控制台警告

开发模式下，Vue I18n 会在控制台输出缺失翻译的警告。

## 📖 参考资源

- [Vue I18n 官方文档](https://vue-i18n.intlify.dev/)
- [Vue I18n Composition API](https://vue-i18n.intlify.dev/guide/advanced/composition.html)
- [Element Plus 国际化](https://element-plus.org/zh-CN/guide/i18n.html)

## ✅ 完成检查清单

- [x] 安装 vue-i18n 依赖
- [x] 创建语言文件（zh-CN, en-US）
- [x] 配置 i18n 实例
- [x] 在 main.ts 中注册
- [x] 在 AppHeader 添加语言切换器
- [x] 创建演示页面
- [x] 编写使用文档

## 🎉 使用示例

访问演示页面查看完整示例：
- 路由：`/app/i18n-demo`
- 文件：`src/views/I18nDemoView.vue`

---

**最后更新时间**：2025-10-20

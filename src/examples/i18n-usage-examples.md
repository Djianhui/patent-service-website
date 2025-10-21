# Vue I18n 使用示例

## 示例 1: 基础按钮翻译

```vue
<template>
  <div>
    <el-button type="primary">{{ $t('common.confirm') }}</el-button>
    <el-button>{{ $t('common.cancel') }}</el-button>
  </div>
</template>
```

## 示例 2: 表单翻译

```vue
<template>
  <el-form :model="form">
    <el-form-item :label="$t('auth.username')">
      <el-input 
        v-model="form.username" 
        :placeholder="$t('auth.pleaseEnterUsername')" 
      />
    </el-form-item>
    
    <el-form-item :label="$t('auth.password')">
      <el-input 
        v-model="form.password" 
        type="password"
        :placeholder="$t('auth.pleaseEnterPassword')" 
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary">{{ $t('auth.login') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  username: '',
  password: ''
})
</script>
```

## 示例 3: 在脚本中使用

```vue
<template>
  <div>
    <el-button @click="handleSubmit">{{ $t('common.submit') }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const handleSubmit = () => {
  // 在消息提示中使用翻译
  ElMessage.success(t('common.success'))
  
  // 在确认对话框中使用
  ElMessageBox.confirm(
    t('common.confirmDelete'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }
  )
}
</script>
```

## 示例 4: 动态内容翻译

```vue
<template>
  <div>
    <!-- 状态标签 -->
    <el-tag v-if="status === 'completed'" type="success">
      {{ $t('patentSearch.completed') }}
    </el-tag>
    <el-tag v-else-if="status === 'generating'" type="warning">
      {{ $t('patentSearch.generating') }}
    </el-tag>
    <el-tag v-else type="danger">
      {{ $t('patentSearch.failed') }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const status = ref<'completed' | 'generating' | 'failed'>('completed')
</script>
```

## 示例 5: 页面标题和描述

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ $t('patentSearch.title') }}</h1>
      <p>{{ $t('patentSearch.subtitle') }}</p>
    </div>
    
    <el-card>
      <template #header>
        <span>{{ $t('patentSearch.searchHistory') }}</span>
      </template>
      <!-- 内容 -->
    </el-card>
  </div>
</template>
```

## 示例 6: 菜单翻译

```vue
<template>
  <el-menu>
    <el-menu-item index="1">
      <el-icon><HomeFilled /></el-icon>
      <span>{{ $t('menu.home') }}</span>
    </el-menu-item>
    
    <el-menu-item index="2">
      <el-icon><DataAnalysis /></el-icon>
      <span>{{ $t('menu.dashboard') }}</span>
    </el-menu-item>
    
    <el-sub-menu index="3">
      <template #title>
        <el-icon><Search /></el-icon>
        <span>{{ $t('menu.patentSearch') }}</span>
      </template>
      <el-menu-item index="3-1">{{ $t('menu.quickSearch') }}</el-menu-item>
      <el-menu-item index="3-2">{{ $t('menu.advancedSearch') }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
```

## 示例 7: 表格列头翻译

```vue
<template>
  <el-table :data="tableData">
    <el-table-column 
      prop="title" 
      :label="$t('patentSearch.patentTitle')" 
    />
    <el-table-column 
      prop="publicationNumber" 
      :label="$t('patentSearch.publicationNumber')" 
    />
    <el-table-column 
      prop="publicationDate" 
      :label="$t('patentSearch.publicationDate')" 
    />
    <el-table-column 
      :label="$t('common.actions')"
    >
      <template #default>
        <el-button size="small">{{ $t('common.view') }}</el-button>
        <el-button size="small">{{ $t('common.edit') }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

## 示例 8: 语言切换器

```vue
<template>
  <el-dropdown @command="handleLanguageChange">
    <el-button>
      {{ currentLanguageName }}
      <el-icon><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
        <el-dropdown-item command="en-US">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, getLocaleName, type SupportLocale } from '@/i18n'
import { ElMessage } from 'element-plus'

const { locale } = useI18n()

const currentLanguageName = computed(() => getLocaleName(locale.value as SupportLocale))

const handleLanguageChange = (newLocale: string) => {
  setLocale(newLocale as SupportLocale)
  ElMessage.success(`Language switched to ${getLocaleName(newLocale as SupportLocale)}`)
}
</script>
```

## 常见问题

### Q: 如何添加新的翻译？
A: 在 `src/i18n/locales/zh-CN.ts` 和 `src/i18n/locales/en-US.ts` 中添加对应的键值对。

### Q: 翻译不生效怎么办？
A: 检查翻译键是否正确，确保在两个语言文件中都存在该键。

### Q: 如何在路由守卫中使用翻译？
A: 使用 `i18n.global.t()` 而不是 `useI18n()` 的 `t()`。

```typescript
import i18n from '@/i18n'

router.beforeEach((to, from, next) => {
  document.title = i18n.global.t('menu.home')
  next()
})
```

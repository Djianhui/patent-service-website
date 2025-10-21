# Vue I18n 快速使用指南

## 🚀 快速开始

### 在模板中使用翻译

```vue
<template>
  <!-- 基础用法 -->
  <h1>{{ $t('menu.home') }}</h1>
  
  <!-- 按钮 -->
  <el-button>{{ $t('common.confirm') }}</el-button>
  
  <!-- 输入框 -->
  <el-input :placeholder="$t('auth.pleaseEnterUsername')" />
  
  <!-- 表单标签 -->
  <el-form-item :label="$t('auth.username')">
    <el-input v-model="username" />
  </el-form-item>
</template>
```

### 在脚本中使用翻译

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

// 获取翻译文本
const title = t('menu.home')

// 在消息提示中使用
const showSuccess = () => {
  ElMessage.success(t('common.success'))
}
</script>
```

### 切换语言

```vue
<script setup lang="ts">
import { setLocale } from '@/i18n'

// 切换到英文
setLocale('en-US')

// 切换到中文
setLocale('zh-CN')
</script>
```

## 📝 常用翻译键

### 通用操作
```typescript
$t('common.confirm')    // 确认 / Confirm
$t('common.cancel')     // 取消 / Cancel
$t('common.save')       // 保存 / Save
$t('common.delete')     // 删除 / Delete
$t('common.edit')       // 编辑 / Edit
$t('common.search')     // 搜索 / Search
$t('common.submit')     // 提交 / Submit
$t('common.loading')    // 加载中... / Loading...
```

### 菜单导航
```typescript
$t('menu.home')         // 首页 / Home
$t('menu.dashboard')    // 工作台 / Dashboard
$t('menu.patentSearch') // 专利检索 / Patent Search
$t('menu.techReport')   // 技术方案报告 / Technical Report
```

### 认证相关
```typescript
$t('auth.login')        // 登录 / Login
$t('auth.register')     // 注册 / Register
$t('auth.username')     // 用户名 / Username
$t('auth.password')     // 密码 / Password
```

### 专利检索
```typescript
$t('patentSearch.title')           // 专利快速检索
$t('patentSearch.patentTitle')     // 专利标题
$t('patentSearch.startSearch')     // 开始检索
$t('patentSearch.searching')       // 检索中...
```

## 🎨 语言切换按钮位置

语言切换按钮已添加到顶部导航栏右侧，在通知铃铛图标旁边。

## 📖 完整文档

查看 [VUE_I18N_INTEGRATION.md](./VUE_I18N_INTEGRATION.md) 了解详细使用说明。

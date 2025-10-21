# 面包屑导航国际化修复

## 🐛 问题

面包屑导航中的文本（如"专利撰写 / 新建草稿"）没有被翻译，切换语言后仍然显示中文。

## 🔍 原因分析

面包屑导航从路由配置的 `meta.title` 获取标题，而路由配置中的标题都是硬编码的中文字符串：

```typescript
// router/index.ts
{
  path: 'patent-draft',
  name: 'PatentDraft',
  meta: {
    title: '专利撰写',  // ❌ 硬编码中文
    icon: 'Edit'
  }
}
```

## ✅ 解决方案

在 `AppHeader.vue` 中添加**路由名称到翻译键的映射表**，根据路由名称动态获取翻译文本。

### 修改内容

**文件**：[`src/layouts/AppHeader.vue`](d:\patent-service-website\src\layouts\AppHeader.vue)

#### 1. 导入 `t` 函数
```typescript
const { locale, t } = useI18n()  // 添加 t
```

#### 2. 添加路由映射表
```typescript
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
```

#### 3. 修改面包屑逻辑
```typescript
// 修改前
const breadcrumbItems = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  const items = matched.map(item => ({
    title: item.meta?.title as string,  // ❌ 直接使用中文
    path: item.path
  }))
  return items
})

// 修改后
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
```

## 🎯 工作原理

1. **获取匹配的路由**：通过 `route.matched` 获取当前路由的所有父级路由
2. **查找翻译键**：根据路由的 `name` 在映射表中查找对应的翻译键
3. **动态翻译**：使用 `t(translationKey)` 获取当前语言的翻译文本
4. **降级处理**：如果映射表中没有对应的翻译键，则使用原始的 `meta.title`

## 📝 支持的路由

已添加映射的路由：

| 路由名称 | 翻译键 | 中文 | 英文 |
|---------|--------|------|------|
| Dashboard | menu.dashboard | 工作台 | Dashboard |
| TechReport | menu.techReport | 技术方案报告 | Technical Report |
| TechReportNew | menu.newReport | 新建报告 | New Report |
| TechReportHistory | menu.reportHistory | 报告历史 | Report History |
| PatentSearch | menu.patentSearch | 专利检索 | Patent Search |
| PatentSearchQuick | menu.quickSearch | 快速检索 | Quick Search |
| ThreeAnalysis | menu.threeAnalysis | 三性分析 | Three Analysis |
| ThreeAnalysisNew | menu.newAnalysis | 新建分析 | New Analysis |
| ThreeAnalysisHistory | menu.analysisHistory | 分析历史 | Analysis History |
| PatentDraft | menu.patentDraft | 专利撰写 | Patent Draft |
| PatentDraftNew | menu.newDraft | 新建草稿 | New Draft |
| PatentDraftManage | menu.draftManage | 草稿管理 | Draft Management |
| DefenseSupport | menu.defenseSupport | 答辩支持 | Defense Support |
| Profile | menu.profile | 个人中心 | Profile |

## 🧪 测试效果

刷新页面后：

### 中文模式
- 专利撰写 / 新建草稿
- 技术方案报告 / 历史报告
- 专利检索 / 快速检索

### 英文模式
- Patent Draft / New Draft
- Technical Report / Report History
- Patent Search / Quick Search

## 💡 优势

1. **无需修改路由配置**：保持路由配置的简洁性
2. **集中管理**：所有面包屑翻译在一个地方维护
3. **响应式更新**：切换语言时自动更新面包屑
4. **降级处理**：即使没有翻译键，也能显示原始文本

## 🔄 添加新路由

如果添加新路由，只需在映射表中添加对应的条目：

```typescript
const routeTitleMap: Record<string, string> = {
  // ... 已有的映射
  'NewRouteName': 'menu.newRouteKey',  // 新增
}
```

然后确保翻译文件中有对应的翻译：

```typescript
// zh-CN.ts
menu: {
  newRouteKey: '新路由名称'
}

// en-US.ts
menu: {
  newRouteKey: 'New Route Name'
}
```

---

**更新时间**：2025-10-20
**状态**：✅ 面包屑导航已完成国际化

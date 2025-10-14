# 专利检索功能 API 对接文档

## 更新概述

为专利快速检索和检索历史功能对接后端API，使用与技术报告相同的接口，type=2。

---

## 一、API 接口信息

### 1. 提交检索任务
```
POST /api/manus/task
```

**请求参数**：
```json
{
  "prompt": "组装式食用菌种植棚",
  "type": 2
}
```

**响应**：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

### 2. 获取检索历史
```
POST /api/task/getPage
```

**请求参数**：
```json
{
  "keyword": "",
  "pageIndex": 1,
  "pageSize": 20,
  "type": 2
}
```

**响应**：同技术报告接口

---

## 二、已完成更新

### 1. 服务层（patentSearch.ts）
- ✅ 添加 PageQueryRequest 和 PageQueryResponse 接口定义
- ✅ quickSearch() - 提交检索任务到 /manus/task
- ✅ getSearchHistory() - 获取检索历史列表

### 2. 数据转换
- ✅ 后端记录 → Patent 类型
- ✅ 保留 firstImgUrl、pdfUrl、wordUrl、mdUrl 字段
- ✅ 状态映射：generating(0)/completed(1)/failed(2)

---

## 三、待更新（页面部分）

### QuickSearchView.vue
需要更新为调用检索历史列表，类似技术报告历史记录页面。

### SearchResultsView.vue  
需要更新为显示检索历史，添加图片展示功能。

---

## 四、图片展示规格

与技术报告相同：
- 桌面端：280×210px
- 移动端：100%×280px
- 点击放大预览
- 悬停蒙层效果


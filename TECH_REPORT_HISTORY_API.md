# 技术报告历史记录 API 对接文档

## 一、接口信息

### 接口地址
```
POST https://patent.langdetech.cn/api/task/getPage
```

### 接口说明
获取技术报告历史记录的分页列表

### 认证要求
- 需要登录认证
- Token 自动在请求头中添加

---

## 二、请求参数

### 请求体格式
JSON

### 参数说明

| 参数名称 | 参数说明 | 请求类型 | 是否必须 | 数据类型 | schema |
|---------|---------|---------|---------|---------|--------|
| keyword | 搜索关键字 | body | false | string | |
| pageIndex | 页码，默认为1，示例值(1) | body | false | integer(int64) | |
| pageSize | 页大小，默认为10，示例值(10) | body | false | integer(int64) | |
| pageSorts | 排序 | body | false | array | OrderItem |
| - asc | 升序 | body | false | boolean | |
| - column | 排序列 | body | false | string | |
| state | 状态(0:未完成 1:已完成 2:失败) | body | false | integer(int32) | |
| **type** | **类型(1:技术报告 2:专利检索 3:三性分析 4:专利撰写 5:答辩支持)** | body | **true** | integer(int32) | |

### 请求示例

```json
{
  "keyword": "反无人机",
  "pageIndex": 1,
  "pageSize": 10,
  "type": 1,
  "state": 1
}
```

---

## 三、响应参数

### 响应格式
JSON

### 参数说明

| 参数名称 | 参数说明 | 类型 |
|---------|---------|------|
| code | 状态码 | integer(int32) |
| msg | 消息 | string |
| data | 分页结果数据（任意类型） | |
| - pageIndex | 页码 | integer(int64) |
| - pageSize | 页大小 | integer(int64) |
| - total | 总行数 | integer(int64) |
| - records | 数据列表 | array |
| -- createTime | 创建时间 | string |
| -- firstImgUrl | 首页图片路径 | string |
| -- id | 主键自增 | integer |
| -- mdUrl | markdown路径 | string |
| -- params | 参数 | object |
| -- pdfUrl | pdf路径 | string |
| -- state | 状态(0:未完成 1:已完成 2:失败) | integer |
| -- taskId | 任务id | string |
| -- taskJson | 任务类型 | string |
| -- type | 类型(1:技术报告 2:专利检索 3:三性分析 4:专利撰写 5:答辩支持) | integer |
| -- updateTime | 最后修改时间 | string |
| -- userId | 所属用户id | integer |
| -- wordUrl | word路径 | string |

### 响应示例

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "pageIndex": 1,
    "pageSize": 10,
    "total": 2,
    "records": [
      {
        "id": 1,
        "taskId": "task_12345",
        "type": 1,
        "state": 1,
        "taskJson": "{\"prompt\":\"反无人机\",\"type\":1}",
        "pdfUrl": "https://example.com/reports/report1.pdf",
        "wordUrl": "https://example.com/reports/report1.docx",
        "mdUrl": "https://example.com/reports/report1.md",
        "firstImgUrl": "https://example.com/images/report1.png",
        "userId": 1,
        "createTime": "2025-10-10 10:30:00",
        "updateTime": "2025-10-10 10:35:00",
        "params": {}
      }
    ]
  }
}
```

---

## 四、状态映射关系

### 前端状态 -> 后端状态

| 前端状态 | 后端 state 值 | 说明 |
|---------|--------------|------|
| generating | 0 | 处理中/生成中 |
| completed | 1 | 已完成 |
| failed | 2 | 失败 |

### 后端 state -> 前端状态

| 后端 state | 前端状态 | 显示文本 | 标签类型 |
|-----------|---------|---------|---------|
| 0 | generating | 生成中 | warning |
| 1 | completed | 已完成 | success |
| 2 | failed | 生成失败 | danger |

---

## 五、数据转换逻辑

### 后端数据 -> 前端 TechReport 类型

```typescript
{
  id: String(record.id),                    // 主键转字符串
  title: `${prompt}技术方案报告`,            // 从 taskJson 解析
  inputType: 'text',                        // 固定为文本输入
  inputContent: taskJson.prompt,            // 从 taskJson 解析
  technicalField: taskJson.prompt,          // 技术领域
  createTime: record.createTime,            // 创建时间
  status: convertState(record.state),       // 状态转换
  userId: String(record.userId),            // 用户ID转字符串
  reportContent: { ... },                   // 报告内容（如已完成）
  pdfUrl: record.pdfUrl,                    // PDF下载链接
  wordUrl: record.wordUrl,                  // Word下载链接
  mdUrl: record.mdUrl,                      // Markdown链接
  firstImgUrl: record.firstImgUrl           // 首页图片
}
```

---

## 六、已实现功能

### 1. 分页查询 ✅
- 支持关键词搜索
- 支持状态筛选
- 支持分页显示

### 2. 状态显示 ✅
- 生成中（黄色标签）
- 已完成（绿色标签）
- 生成失败（红色标签）

### 3. 文件下载 ✅
- PDF 格式下载
- Word 格式下载
- 直接打开链接

### 4. Token 认证 ✅
- 自动添加到请求头
- 401 错误自动处理

---

## 七、使用方法

### 1. 前端调用

```typescript
// 在组件中使用
import { useTechReportStore } from '@/stores/techReport'

const techReportStore = useTechReportStore()

// 加载报告列表
await techReportStore.getReportList({
  page: 1,
  pageSize: 10,
  keyword: '反无人机',
  status: 'completed'
})

// 获取列表数据
const reports = techReportStore.reportList
const total = techReportStore.total
```

### 2. 下载报告

```typescript
// PDF 下载
await techReportStore.exportReport(reportId, 'pdf')

// Word 下载
await techReportStore.exportReport(reportId, 'word')
```

---

## 八、注意事项

1. **Type 参数必须传递**
   - 技术报告：type = 1
   - 其他类型请参考接口文档

2. **Token 处理**
   - Token 已通过 storage.set() 存储，读取时需要 JSON.parse()
   - 参考 TOKEN_FIX.md 文档

3. **taskJson 解析**
   - 后端返回的 taskJson 是 JSON 字符串
   - 需要 JSON.parse() 解析后获取 prompt 等信息

4. **文件下载**
   - 优先使用后端返回的 URL（pdfUrl、wordUrl）
   - 如果没有 URL，使用 blob 下载方式

---

## 九、调试日志

### 请求日志
```
=== 获取报告列表 ===
请求参数: {page: 1, pageSize: 10, keyword: '', status: ''}
最终请求数据: {keyword: '', pageIndex: 1, pageSize: 10, type: 1}
```

### 响应日志
```
后端返回数据: {code: 200, msg: '操作成功', data: {...}}
转换后的报告列表: [{id: '1', title: '反无人机技术方案报告', ...}]
```

---

## 十、错误处理

| 错误类型 | HTTP 状态码 | 处理方式 |
|---------|-----------|---------|
| 认证失败 | 401 | 清除 token，跳转登录页 |
| 权限不足 | 403 | 提示无权限 |
| 资源不存在 | 404 | 提示资源不存在 |
| 服务器错误 | 500 | 提示服务器错误 |
| 网络错误 | - | 提示检查网络连接 |

---

## 更新日志

- 2025-10-10: 创建文档，完成技术报告历史记录 API 对接

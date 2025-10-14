# 答辩支持功能API对接完成

## 概述

已完成答辩支持功能的后端API对接，支持模拟审查和答辩意见回复两种功能。

## 实现细节

### 1. 功能选择

用户可以选择两种功能：
- **模拟审查** (Subtype = 0)：上传专利文件生成审查意见通知书
- **答辩意见回复** (Subtype = 1)：根据上传的文件和描述生成答辩意见回复

### 2. 文件上传

#### 文件上传接口
- **接口地址**: `POST /api/file/common/upload`
- **Content-Type**: `multipart/form-data`
- **认证**: 需要携带Token
- **支持格式**: PDF、DOC、DOCX
- **文件大小**: 最大10MB

#### 返回参数
```typescript
{
  code: 200,
  data: {
    fileName: string,           // 文件名
    newFileName: string,        // 新文件名
    originalFilename: string,   // 原始文件名
    url: string                 // 文件路径（用于提交任务）
  },
  msg: string
}
```

### 3. 创建答辩支持任务

#### API对接
- **接口地址**: `POST /api/manus/task`
- **Type参数**: `5`（答辩支持）
- **Subtype参数**: 
  - `0`：模拟审查
  - `1`：答辩意见回复

#### 请求参数
```typescript
{
  fileUrls: string[],         // 专利文件路径数组
  prompt: string,             // 答辩信息描述
  type: 5,                    // 5: 答辩支持
  typeSub: 0 | 1              // 0: 模拟审查, 1: 答辩意见回复
}
```

#### 提交流程
1. 用户选择功能类型（模拟审查或答辩意见回复）
2. 上传专利文件（支持多个文件）
3. 每个文件上传成功后获取文件URL
4. 填写描述信息（答辩意见回复时必填，模拟审查可选）
5. 点击提交按钮
6. 将所有文件URL、描述信息、功能类型提交到后端
7. 提交成功后清空表单并刷新列表

### 4. 任务列表

#### API对接
- **接口地址**: `POST /api/task/getPage`
- **Type参数**: `5`（答辩支持）
- **分页参数**: pageIndex, pageSize
- **筛选参数**: keyword（搜索关键词）, state（状态）

#### 列表功能
- ✅ 功能类型显示（模拟审查/答辩意见回复）
- ✅ 图片展示（280x210px）
- ✅ 点击图片可放大预览
- ✅ PDF下载按钮（通过pdfUrl字段）
- ✅ Word下载按钮（通过wordUrl字段）
- ✅ 状态筛选（全部/已完成/生成中/失败）
- ✅ 关键词搜索
- ✅ 分页支持

#### 数据解析
从后端返回的`taskJson`字段中解析：
```typescript
const taskData = JSON.parse(record.taskJson)
const functionType = taskData.typeSub || 0        // 功能类型
const description = taskData.prompt || ''         // 描述信息
const fileUrls = taskData.fileUrls || []          // 文件路径数组
```

### 5. 服务层（defenseSupport.ts）

#### 文件上传方法
```typescript
async uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await request.upload<UploadFileResponse>('/file/common/upload', formData)
  
  if (response.code === 200 && response.data) {
    return response.data.url  // 返回文件URL
  } else {
    throw new Error(response.msg || '文件上传失败')
  }
}
```

#### 创建任务方法
```typescript
async createDefenseTask(data: {
  functionType: DefenseFunctionType
  fileUrls: string[]
  prompt: string
}): Promise<any> {
  const response = await request.post<any>('/manus/task', {
    fileUrls: data.fileUrls,
    prompt: data.prompt,
    type: 5,  // 5: 答辩支持
    typeSub: data.functionType  // 0: 模拟审查, 1: 答辩意见回复
  })
  
  return response
}
```

#### 获取任务列表方法
```typescript
async getDefenseList(params: {
  page?: number
  pageSize?: number
  keyword?: string
  state?: number
} = {}) {
  const requestData: PageQueryRequest = {
    keyword: params.keyword || '',
    pageIndex: params.page || 1,
    pageSize: params.pageSize || 10,
    type: 5  // 5: 答辩支持
  }
  
  if (params.state !== undefined) {
    requestData.state = params.state
  }
  
  const response = await request.post<PageQueryResponse>('/task/getPage', requestData)
  
  // 解析 taskJson 并转换为前端数据格式
  const defenseList = response.data.records.map(record => {
    const taskData = JSON.parse(record.taskJson)
    return {
      id: String(record.id),
      functionType: taskData.typeSub || 0,
      description: taskData.prompt || '',
      fileUrls: taskData.fileUrls || [],
      firstImgUrl: record.firstImgUrl,
      pdfUrl: record.pdfUrl,
      wordUrl: record.wordUrl,
      state: record.state,
      createTime: record.createTime,
      updateTime: record.updateTime
    }
  })
  
  return { data: defenseList, total: response.data.total }
}
```

## 界面功能

### 1. 功能选择区
- 使用Radio Button选择模拟审查或答辩意见回复
- 默认选中模拟审查
- 切换功能时输入框placeholder会相应变化

### 2. 文件上传区
- 支持拖拽上传
- 支持点击上传
- 显示已上传文件列表
- 每个文件显示文件名、文件大小、删除按钮
- 文件上传后立即调用API获取URL

### 3. 描述输入区
- Textarea输入框
- 最大1000字符
- 显示字数统计
- 根据功能类型显示不同的placeholder

### 4. 任务列表
- 显示功能类型（模拟审查/答辩意见回复）
- 显示创建时间
- 显示文件数量
- 状态标签（已完成/生成中/失败）
- PDF和Word下载按钮
- 图片展示和放大预览
- 描述信息展示

## 状态映射

| 前端显示 | 后端state值 | Tag颜色 |
|---------|-----------|---------|
| 已完成   | 1         | success |
| 生成中   | 0         | warning |
| 失败     | 2         | danger  |

## 功能类型映射

| 功能名称       | typeSub值 | 枚举值 |
|---------------|----------|--------|
| 模拟审查       | 0        | DefenseFunctionType.SIMULATION_REVIEW |
| 答辩意见回复   | 1        | DefenseFunctionType.DEFENSE_REPLY |

## 文件修改清单

1. **src/services/defenseSupport.ts** (新建)
   - 定义DefenseFunctionType枚举
   - 实现uploadFile方法（文件上传）
   - 实现createDefenseTask方法（创建任务）
   - 实现getDefenseList方法（获取列表）

2. **src/views/defense-support/DefenseSimulationView.vue** (重写)
   - 添加功能选择组件
   - 更新文件上传逻辑（支持多文件+立即上传）
   - 添加描述输入框
   - 更新列表展示（显示功能类型、图片、PDF/Word下载）
   - 更新图标导入

## 用户体验优化

- 文件上传即时反馈，显示上传进度
- 支持多个文件上传
- 文件列表显示文件大小
- 描述输入框根据功能类型自适应提示
- 图片大尺寸展示（280x210px），清晰可见内容
- 图片懒加载，提升页面性能
- 点击图片可放大预览
- PDF和Word下载按钮根据URL是否存在自动启用/禁用
- 提交成功后自动清空表单并刷新列表
- 友好的加载状态和错误提示

## HTTP请求携带Token

文件上传接口使用`request.upload`方法，该方法会自动在请求头中添加Token：
```typescript
// http.ts 中的请求拦截器会自动添加
config.headers.Authorization = token
```

## 后续优化建议

1. 支持批量文件上传（一次选择多个文件）
2. 添加上传进度条
3. 支持文件预览功能
4. 添加任务详情页面
5. 支持任务结果导出（多种格式）
6. 添加任务历史版本管理

## 测试建议

1. 测试功能选择
   - 切换功能类型
   - 验证placeholder变化
   - 验证必填项校验

2. 测试文件上传
   - 单文件上传
   - 多文件上传
   - 文件格式验证
   - 文件大小验证
   - 上传失败处理

3. 测试任务提交
   - 模拟审查功能提交
   - 答辩意见回复功能提交
   - 必填项验证
   - 提交成功后表单清空

4. 测试任务列表
   - 图片展示和放大
   - PDF/Word下载
   - 搜索功能
   - 状态筛选
   - 分页功能

5. 测试异常情况
   - 文件上传失败
   - Token过期
   - 网络错误
   - 无图片时的显示
   - 无PDF/Word时的按钮状态

---

**更新时间**: 2025-10-10
**完成状态**: ✅ 已完成

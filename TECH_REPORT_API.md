# 技术报告生成API对接说明

## 一、接口信息

### 1. 基本信息
- **接口地址**: `POST /api/report`
- **完整URL**: `https://patent.langdetech.cn/api/task
- **需要登录**: 是（需要在请求头中携带 token）
- **Content-Type**: `application/json`

### 2. 请求参数
```json
{
  "prompt": "反无人机",
  "type": 1
}
```

**参数说明**：
- `prompt` (string, 必填): 技术领域描述，用户输入的技术信息
- `type` (number, 可选): 报告类型，默认为 1

### 3. 响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null,
  "time": "2025-10-14 10:32:51"
}
```

**响应说明**：
- `code`: 状态码，200 表示成功
- `msg`: 提示信息
- `data`: 返回数据（如果有）
- `time`: 响应时间

## 二、前端实现

### 1. 服务层实现 (`src/services/techReport.ts`)

```typescript
export interface GenerateReportRequest {
  prompt: string
  type?: number
}

export const techReportService = {
  async generateReport(data: GenerateReportRequest): Promise<any> {
    try {
      const response = await request.post<any>('/report', {
        prompt: data.prompt,
        type: data.type || 1
      })
      
      if (response.code === 200) {
        return {
          success: true,
          message: response.msg || '报告生成成功',
          data: response.data
        }
      } else {
        throw new Error(response.msg || '报告生成失败')
      }
    } catch (error: any) {
      // 错误处理
      if (error.response && error.response.data) {
        const backendError = error.response.data
        throw new Error(backendError.msg || '报告生成失败')
      }
      throw new Error(error.message || '网络错误')
    }
  }
}
```

### 2. 页面调用 (`src/views/tech-report/TechReportNewView.vue`)

```typescript
const generateReport = async () => {
  // 表单验证
  const valid = await formRef.value.validate()
  if (!valid) return
  
  generating.value = true
  
  try {
    // 调用API生成报告
    const result = await techReportService.generateReport({
      prompt: formData.technicalField,  // 用户输入的技术领域
      type: 1
    })
    
    ElMessage.success(result.message || '报告生成成功')
    
    // 处理返回数据
    if (result.data) {
      // 显示报告内容
      previewData.value = result.data
    }
  } catch (error: any) {
    ElMessage.error(error.message || '报告生成失败')
  } finally {
    generating.value = false
  }
}
```

## 三、认证机制

### 1. Token 携带方式
系统已配置自动在请求头中添加 token：

```typescript
// src/services/http.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 2. 登录要求
- 用户必须先登录系统
- 登录成功后 token 会自动保存到 localStorage
- 后续所有API请求会自动携带 token

## 四、使用流程

### 1. 用户操作流程
```
登录系统 
  ↓
进入"新建技术方案报告"页面
  ↓
输入技术领域描述（如"反无人机"）
  ↓
点击"生成报告"按钮
  ↓
系统调用API生成报告
  ↓
显示生成结果
```

### 2. 数据流转
```
用户输入技术领域
  ↓
前端表单验证
  ↓
调用 techReportService.generateReport()
  ↓
发送 POST 请求到 /api/report
  ↓
携带参数 {prompt: "反无人机", type: 1}
  ↓
后端处理并返回结果
  ↓
前端显示成功/失败提示
```

## 五、测试步骤

### 1. 登录系统
- 用户名: `admin`
- 密码: `admin123`

### 2. 进入报告生成页面
访问: `http://localhost:5173/app/tech-report/new`

### 3. 输入技术领域
在"技术领域"输入框中输入：`反无人机`

### 4. 生成报告
点击"生成报告"按钮

### 5. 查看结果
- 成功：显示"操作成功"提示
- 失败：显示错误信息

### 6. 检查请求
打开浏览器开发者工具 - Network 面板：
- 请求URL: `https://patent.langdetech.cn/api/manus/task`
- 请求方法: POST
- 请求头包含: `Authorization: Bearer [token]`
- 请求体: `{"prompt":"反无人机","type":1}`

## 六、错误处理

### 1. 未登录
- 错误：401 Unauthorized
- 处理：自动跳转到登录页面

### 2. Token 过期
- 错误：401 Unauthorized
- 处理：清除本地 token，跳转登录页

### 3. 参数错误
- 错误：400 Bad Request
- 处理：显示后端返回的错误信息

### 4. 服务器错误
- 错误：500 Internal Server Error
- 处理：显示"服务器错误"提示

### 5. 网络错误
- 错误：Network Error
- 处理：显示"网络错误，请检查网络连接"

## 七、注意事项

1. **Token 必需**：所有API请求都需要携带有效的登录 token

2. **输入验证**：
   - 技术领域描述至少 5 个字符
   - 不能为空

3. **进度提示**：
   - 生成过程中显示进度条
   - 避免用户重复提交

4. **错误提示**：
   - 显示友好的错误提示信息
   - 区分不同类型的错误

5. **返回数据**：
   - 目前后端返回 `data: null`
   - 如果后续返回报告数据，前端会自动显示

## 八、后续扩展

如果后端返回完整的报告数据，可以按以下格式处理：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "summary": "技术方案摘要内容...",
    "background": "技术背景分析...",
    "innovation": "创新点分析...",
    "advantage": "技术优势..."
  }
}
```

前端会自动解析并显示这些数据。

## 九、相关文件

- `src/services/techReport.ts` - 技术报告服务
- `src/views/tech-report/TechReportNewView.vue` - 新建报告页面
- `src/services/http.ts` - HTTP 请求封装
- `src/stores/techReport.ts` - 技术报告状态管理

## 十、联系方式

如有问题，请联系前端开发团队。

# SSE 实时通知功能集成文档

## 概述

本次更新实现了基于 SSE (Server-Sent Events) 的实时通知推送功能，后端可以主动推送消息给前端用户。

## 主要修改

### 1. 新增通知服务 (`src/services/notification.ts`)

创建了一个完整的 SSE 通知服务，支持：

- **自定义请求头**：使用 fetch + ReadableStream 代替 EventSource，支持在请求头中传递 Authorization token
- **自动连接管理**：根据用户 ID 建立 SSE 连接
- **自动重连机制**：连接断开时自动重试（最多 5 次）
- **消息处理**：接收并解析后端推送的消息
- **事件监听**：支持多个消息处理器同时监听

#### 核心方法

```typescript
// 连接 SSE 服务（使用 fetch 支持自定义请求头）
notificationService.connect(userId)

// 注册消息处理器
const unsubscribe = notificationService.onMessage((message) => {
  console.log('收到消息:', message)
})

// 断开连接
notificationService.disconnect()

// 取消消息监听
unsubscribe()
```

### 2. 更新用户信息接口 (`src/services/auth.ts`)

- 实现了真实的 `/api/getInfo` 接口调用
- 返回包含 `userId` 字段的用户信息，用于建立 SSE 连接

### 3. 扩展用户类型定义 (`src/types/index.ts`)

在 `User` 接口中新增 `userId` 字段：

```typescript
export interface User {
  id: string
  username: string
  // ... 其他字段
  userId?: string | number // 用于SSE连接的用户ID
}
```

### 4. 集成到应用头部 (`src/layouts/AppHeader.vue`)

#### 功能特性

1. **自动连接**：用户登录后自动建立 SSE 连接
2. **实时通知**：接收后端推送的消息并显示在通知列表中
3. **消息提示**：新消息到达时显示 ElMessage 提示
4. **生命周期管理**：
   - 组件挂载时建立连接
   - 组件卸载时断开连接
   - 监听用户变化，自动重连或断开

#### 代码示例

```vue
<script setup lang="ts">
import { notificationService, type NotificationMessage } from '@/services/notification'

// 建立SSE连接
const connectSSE = (userId: string | number) => {
  notificationService.connect(userId)
  
  unsubscribe = notificationService.onMessage((message) => {
    // 添加到通知列表
    notifications.value.unshift(message)
    
    // 显示消息提示
    ElMessage({
      message: message.message,
      type: message.type || 'info',
      duration: 3000
    })
  })
}
</script>
```

## API 规范

### SSE 连接接口

- **URL**: `https://patent.langdetech.cn/api/sse/connect/{clientId}`
- **方法**: GET
- **认证方式**: 通过请求头 `Authorization` 传递 token
- **参数**: 
  - `clientId`: 用户 ID (从 `/api/getInfo` 获取的 `userId`)
- **请求头**:
  ```
  Authorization: <token>
  Accept: text/event-stream
  Cache-Control: no-cache
  ```
- **示例**: 
  ```
  GET https://patent.langdetech.cn/api/sse/connect/1
  Headers:
    Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    Accept: text/event-stream
    Cache-Control: no-cache
  ```

### 消息格式

后端推送的消息应符合以下 JSON 格式：

```json
{
  "id": "notification_123",
  "title": "消息标题",
  "message": "消息内容",
  "time": "2024-12-09T10:30:00Z",
  "type": "info"
}
```

**字段说明**：
- `id`: 消息唯一标识（可选，前端会自动生成）
- `title`: 消息标题
- `message` 或 `content`: 消息内容
- `time`: 消息时间（可选，默认为当前时间）
- `type`: 消息类型，可选值：`info` | `success` | `warning` | `error`

### 事件类型

支持两种事件类型：

1. **默认事件** (`message`): 标准的 SSE 消息事件
2. **自定义事件** (`notification`): 专门用于通知的事件类型

后端可以使用任意一种方式推送消息。

## 使用示例

### 后端推送示例（Node.js）

```javascript
// Express.js 示例
app.get('/api/sse/connect/:clientId', (req, res) => {
  const { clientId } = req.params
  const { token } = req.query
  
  // 验证 token
  if (!validateToken(token)) {
    return res.status(401).send('Unauthorized')
  }
  
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  // 发送消息
  const sendNotification = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  
  // 示例：每 10 秒发送一条消息
  const timer = setInterval(() => {
    sendNotification({
      id: `notification_${Date.now()}`,
      title: '系统通知',
      message: '这是一条测试消息',
      time: new Date().toISOString(),
      type: 'info'
    })
  }, 10000)
  
  // 客户端断开时清理
  req.on('close', () => {
    clearInterval(timer)
    res.end()
  })
})
```

### 前端监听示例

```typescript
import { notificationService } from '@/services/notification'

// 建立连接
notificationService.connect(userId)

// 监听消息
const unsubscribe = notificationService.onMessage((message) => {
  console.log('收到通知:', message)
  // 处理消息...
})

// 取消监听
unsubscribe()

// 断开连接
notificationService.disconnect()
```

## 连接状态

通过以下方法可以查询连接状态：

```typescript
// 获取连接状态
const state = notificationService.getConnectionState()
// 0: CONNECTING
// 1: OPEN
// 2: CLOSED

// 检查是否已连接
const isConnected = notificationService.isConnected()
```

## 注意事项

1. **Token 传递**：SSE 连接通过请求头 `Authorization` 传递 token，确保后端正确验证
2. **技术实现**：由于标准 EventSource API 不支持自定义请求头，使用 fetch + ReadableStream 实现
3. **自动重连**：连接断开时会自动重试，最多 5 次，每次间隔 3 秒
4. **内存管理**：组件卸载时会自动断开连接和取消监听，避免内存泄漏
5. **CORS 配置**：确保后端正确配置 CORS，允许跨域 SSE 连接
6. **消息持久化**：当前通知仅保存在内存中，刷新页面后会丢失

## 后续优化建议

1. **消息持久化**：将通知保存到 localStorage 或后端数据库
2. **消息分类**：支持不同类型的通知（系统通知、任务通知等）
3. **通知设置**：允许用户自定义通知偏好
4. **离线消息**：支持获取离线期间的历史消息
5. **音效提醒**：重要通知可以添加音效提示

## 测试建议

1. 测试正常连接和消息接收
2. 测试网络断开后的自动重连
3. 测试用户登录/登出时的连接管理
4. 测试多个标签页同时打开的情况
5. 测试长时间保持连接的稳定性

## 相关文件

- `src/services/notification.ts` - SSE 通知服务
- `src/services/auth.ts` - 用户认证服务
- `src/types/index.ts` - 类型定义
- `src/layouts/AppHeader.vue` - 应用头部组件
- `src/stores/auth.ts` - 认证状态管理

---

**更新时间**: 2024-12-09
**版本**: 1.0.0

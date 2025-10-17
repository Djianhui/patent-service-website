# SSE Token 认证方式修改说明

## 修改原因

原先的实现将 token 作为 URL 查询参数传递：
```
https://patent.langdetech.cn/api/sse/connect/1?token=xxx
```

但根据实际的后端接口要求，**token 应该通过请求头 `Authorization` 传递**，而不是 URL 参数。

## 技术挑战

标准的 `EventSource` API **不支持自定义请求头**，这是一个已知的浏览器限制。

## 解决方案

使用 **fetch API + ReadableStream** 替代 EventSource，实现支持自定义请求头的 SSE 连接。

### 实现方式

```typescript
// 使用 fetch 发起 SSE 请求
fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': token,          // 在请求头中传递 token
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  },
  signal: abortController.signal
})
.then(response => {
  // 读取响应流
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  // 递归读取数据
  const readStream = () => {
    reader.read().then(({ done, value }) => {
      if (done) return
      
      // 解码并解析 SSE 消息
      const chunk = decoder.decode(value, { stream: true })
      parseSSEMessage(chunk)
      
      readStream() // 继续读取
    })
  }
  
  readStream()
})
```

## 主要变更

### 1. 修改 `src/services/notification.ts`

**修改前：**
```typescript
class NotificationService {
  private eventSource: EventSource | null = null
  
  connect(userId: string | number) {
    const url = `${baseUrl}/${userId}?token=${token}`
    this.eventSource = new EventSource(url)
  }
}
```

**修改后：**
```typescript
class NotificationService {
  private eventSource: EventSource | null = null
  private abortController: AbortController | null = null
  private currentUserId: string | number | null = null
  
  connect(userId: string | number) {
    const url = `${baseUrl}/${userId}` // 不在 URL 中传递 token
    
    fetch(url, {
      headers: {
        'Authorization': token,  // 通过请求头传递
        'Accept': 'text/event-stream'
      },
      signal: this.abortController.signal
    })
    // ... 处理响应流
  }
}
```

### 2. 新增方法

**parseSSEMessage(chunk: string)**
- 解析 SSE 消息格式 `data: {...}\n\n`
- 提取 JSON 数据并转换为通知对象
- 触发消息处理器

### 3. 改进 disconnect()

现在同时支持断开：
- EventSource 连接（向后兼容）
- fetch 请求（通过 AbortController）

```typescript
disconnect() {
  if (this.eventSource) {
    this.eventSource.close()
    this.eventSource = null
  }
  
  if (this.abortController) {
    this.abortController.abort()  // 取消 fetch 请求
    this.abortController = null
  }
}
```

## API 接口要求

### 后端接口规范

**URL**: `GET https://patent.langdetech.cn/api/sse/connect/{clientId}`

**请求头：**
```
Authorization: <token>
Accept: text/event-stream
Cache-Control: no-cache
```

**响应头：**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: * (或具体域名)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Authorization, Accept, Cache-Control
```

**消息格式：**
```
data: {"id":"123","title":"标题","message":"内容","type":"info"}

```

## 调试日志

### 连接建立日志

```
=== SSE Service: 构建连接URL ===
完整URL: https://patent.langdetech.cn/api/sse/connect/1

=== SSE Service: 发起 fetch 请求 ===
(请求头中包含 Authorization: <token>)

=== SSE Service: 收到响应 ===
status: 200
statusText: OK
headers: {
  "content-type": "text/event-stream",
  "connection": "keep-alive"
}

=== SSE Service: 连接已建立成功! ===
```

### 接收消息日志

```
=== SSE Service: 收到数据块 ===
原始数据: data: {"id":"123","title":"测试通知","message":"测试消息","type":"info"}

=== SSE Service: 解析消息 ===
数据字符串: {"id":"123","title":"测试通知","message":"测试消息","type":"info"}

解析后的数据: {
  id: "123",
  title: "测试通知",
  message: "测试消息",
  type: "info"
}
```

## 优势对比

### 使用 EventSource (原方案)

**优点：**
- 简单易用
- 自动重连
- 原生支持

**缺点：**
- ❌ 不支持自定义请求头
- ❌ 只能通过 URL 传递认证信息（不安全）
- ❌ 无法灵活控制连接

### 使用 fetch + ReadableStream (新方案)

**优点：**
- ✅ 支持自定义请求头（通过 Authorization 传递 token）
- ✅ 符合标准的 HTTP 认证方式
- ✅ 完全控制连接生命周期
- ✅ 可以使用 AbortController 取消请求

**缺点：**
- 需要手动实现重连（已实现）
- 需要手动解析 SSE 消息格式（已实现）

## 兼容性

- ✅ Chrome 42+
- ✅ Firefox 39+
- ✅ Safari 10.1+
- ✅ Edge 14+

所有现代浏览器都支持 fetch API 和 ReadableStream。

## 测试建议

### 1. 使用 curl 测试接口

```bash
curl -H "Authorization: <your-token>" \
     -H "Accept: text/event-stream" \
     -N \
     https://patent.langdetech.cn/api/sse/connect/1
```

### 2. 使用 Postman 测试

1. 设置 Method: GET
2. URL: `https://patent.langdetech.cn/api/sse/connect/1`
3. Headers:
   - `Authorization`: `<your-token>`
   - `Accept`: `text/event-stream`
4. 点击 Send，查看响应流

### 3. 浏览器控制台测试

```javascript
// 获取 token
const token = localStorage.getItem('token')

// 手动发起 fetch 请求测试
fetch('https://patent.langdetech.cn/api/sse/connect/1', {
  headers: {
    'Authorization': token,
    'Accept': 'text/event-stream'
  }
})
.then(response => {
  console.log('Status:', response.status)
  console.log('Headers:', Object.fromEntries(response.headers.entries()))
})
```

## 注意事项

1. **CORS 配置**：后端必须正确配置 CORS，允许前端域名访问，并允许 `Authorization` 请求头

2. **Token 格式**：确保 token 不包含双引号，如果从 localStorage 读取需要用 `JSON.parse`

3. **连接保持**：SSE 连接会长时间保持，确保后端支持长连接

4. **重连机制**：前端已实现自动重连（最多 5 次，每次间隔 3 秒）

5. **消息格式**：后端发送的消息必须符合 SSE 格式：`data: <json>\n\n`

## 相关文件

- `src/services/notification.ts` - SSE 通知服务实现
- `src/stores/auth.ts` - 登录时建立 SSE 连接
- `src/layouts/AppHeader.vue` - 消息展示组件
- `SSE_NOTIFICATION_INTEGRATION.md` - 完整技术文档
- `SSE_DEBUG_GUIDE.md` - 调试指南

---

**更新时间**: 2024-12-09
**版本**: 2.0.0 (Token 认证方式修改版本)

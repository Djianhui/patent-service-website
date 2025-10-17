# SSE 消息解析容错处理修复

## 问题描述

SSE 连接成功并接收到消息，但消息没有显示在通知列表中。

### 错误信息

```
SyntaxError: Unexpected token '连', "连接成功: 2" is not valid JSON
at JSON.parse (<anonymous>)
at NotificationService.parseSSEMessage (notification.ts:164:29)
```

### 问题原因

后端发送的 SSE 消息是纯文本格式，而不是 JSON 格式：

**实际消息：**
```
data: 连接成功: 2
```

**期望的 JSON 格式：**
```
data: {"title":"连接成功","message":"客户端数量: 2","type":"info"}
```

前端代码强制使用 `JSON.parse()` 解析，导致纯文本消息解析失败并抛出异常，消息被丢弃。

## 解决方案

增强 `parseSSEMessage` 方法，添加容错处理：

1. 优先尝试 JSON 解析
2. JSON 解析失败时，将原始文本作为消息内容
3. 为纯文本消息创建默认通知对象
4. 添加详细的日志输出

## 代码修改

### 修改前

```typescript
private parseSSEMessage(chunk: string) {
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('data:')) {
      try {
        const dataStr = line.substring(5).trim()
        if (!dataStr) continue
        
        const data = JSON.parse(dataStr)  // ❌ 强制 JSON 解析
        
        const notification: NotificationMessage = {
          id: data.id || `notification_${Date.now()}`,
          title: data.title || '新消息',
          message: data.message || data.content || '',
          time: data.time || new Date().toISOString(),
          read: false,
          type: data.type || 'info'
        }
        
        this.messageHandlers.forEach(handler => handler(notification))
      } catch (error) {
        console.error('解析消息失败:', error)
        // ❌ 错误被捕获，消息被丢弃
      }
    }
  }
}
```

### 修改后

```typescript
private parseSSEMessage(chunk: string) {
  const lines = chunk.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const dataStr = line.substring(5).trim()
      if (!dataStr) continue
      
      let notification: NotificationMessage
      
      try {
        // ✅ 尝试 JSON 解析
        const data = JSON.parse(dataStr)
        console.log('解析后的数据:', data)
        
        notification = {
          id: data.id || `notification_${Date.now()}`,
          title: data.title || '新消息',
          message: data.message || data.content || data.msg || '',
          time: data.time || new Date().toISOString(),
          read: false,
          type: data.type || 'info'
        }
      } catch (error) {
        // ✅ JSON 解析失败时，作为纯文本处理
        console.warn('JSON 解析失败，将消息作为纯文本处理')
        console.warn('error:', error)
        
        notification = {
          id: `notification_${Date.now()}`,
          title: '系统通知',
          message: dataStr,  // ✅ 使用原始文本
          time: new Date().toISOString(),
          read: false,
          type: 'info'
        }
        
        console.log('作为纯文本处理:', notification)
      }
      
      // ✅ 无论哪种方式，都会创建通知对象
      console.log('转换后的通知对象:', notification)
      
      this.messageHandlers.forEach((handler, index) => {
        console.log(`执行处理器 ${index + 1}`)
        try {
          handler(notification)
          console.log(`处理器 ${index + 1} 执行成功`)
        } catch (error) {
          console.error(`处理器 ${index + 1} 执行失败:`, error)
        }
      })
    }
  }
}
```

## 改进点

### 1. 容错机制

✅ **JSON 格式消息**: 正常解析并提取字段
```json
data: {"title":"报告完成","message":"您的报告已生成","type":"success"}
```
→ 结果：
```javascript
{
  id: "notification_1234567890",
  title: "报告完成",
  message: "您的报告已生成",
  type: "success",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
```

✅ **纯文本消息**: 作为消息内容处理
```
data: 连接成功: 2
```
→ 结果：
```javascript
{
  id: "notification_1234567890",
  title: "系统通知",
  message: "连接成功: 2",
  type: "info",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
```

### 2. 增强的字段映射

支持多种字段名称：
```typescript
message: data.message || data.content || data.msg || ''
```

这样可以兼容不同的后端消息格式：
- `message` - 标准字段
- `content` - 内容字段
- `msg` - 简短字段

### 3. 错误隔离

每个消息处理器都被 try-catch 包裹：

```typescript
this.messageHandlers.forEach((handler, index) => {
  try {
    handler(notification)
    console.log(`处理器 ${index + 1} 执行成功`)
  } catch (error) {
    console.error(`处理器 ${index + 1} 执行失败:`, error)
    // ✅ 一个处理器失败不影响其他处理器
  }
})
```

### 4. 详细的日志输出

```
=== SSE Service: 解析消息 ===
数据字符串: 连接成功: 2

=== SSE Service: JSON 解析失败，将消息作为纯文本处理 ===
error: SyntaxError: Unexpected token ...

作为纯文本处理: {
  id: "notification_1234567890",
  title: "系统通知",
  message: "连接成功: 2",
  ...
}

转换后的通知对象: { ... }

=== SSE Service: 触发消息处理器 ===
处理器数量: 1
执行处理器 1
处理器 1 执行成功
```

## 测试用例

### 用例 1: JSON 格式消息

**输入：**
```
data: {"id":"123","title":"任务完成","message":"您的任务已完成","type":"success"}
```

**输出：**
```javascript
{
  id: "123",
  title: "任务完成",
  message: "您的任务已完成",
  type: "success",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
```

**显示效果：**
- 通知标题：任务完成
- 通知内容：您的任务已完成
- 通知类型：success (绿色)

### 用例 2: 纯文本消息

**输入：**
```
data: 连接成功: 2
```

**输出：**
```javascript
{
  id: "notification_1234567890",
  title: "系统通知",
  message: "连接成功: 2",
  type: "info",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
```

**显示效果：**
- 通知标题：系统通知
- 通知内容：连接成功: 2
- 通知类型：info (蓝色)

### 用例 3: 使用不同字段名的 JSON

**输入：**
```
data: {"title":"警告","msg":"内存使用率过高","type":"warning"}
```

**输出：**
```javascript
{
  id: "notification_1234567890",
  title: "警告",
  message: "内存使用率过高",  // msg 字段被识别
  type: "warning",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
```

### 用例 4: 空消息

**输入：**
```
data: 
```

**行为：**
- 被 `if (!dataStr) continue` 跳过
- 不创建通知对象

## 后端建议

### 推荐的消息格式

**标准 JSON 格式（推荐）：**
```json
data: {"id":"123","title":"标题","message":"内容","type":"info"}

```

**支持的字段：**
- `id` (可选): 消息唯一标识
- `title` (可选): 通知标题，默认为"新消息"
- `message` | `content` | `msg`: 消息内容
- `type` (可选): 消息类型，可选值：info | success | warning | error
- `time` (可选): 消息时间，默认为当前时间

**示例：**

```javascript
// 成功消息
data: {"title":"操作成功","message":"数据已保存","type":"success"}

// 警告消息
data: {"title":"警告","message":"磁盘空间不足","type":"warning"}

// 错误消息
data: {"title":"错误","message":"连接超时","type":"error"}

// 普通消息
data: {"title":"提示","message":"有新消息","type":"info"}
```

### 兼容的纯文本格式

前端也支持纯文本格式（不推荐，仅用于调试）：

```
data: 这是一条纯文本消息
```

会被转换为：
```javascript
{
  title: "系统通知",
  message: "这是一条纯文本消息",
  type: "info"
}
```

## 验证步骤

1. **启动开发服务器**
2. **登录系统**
3. **查看控制台日志**，确认 SSE 连接成功
4. **后端发送测试消息**
5. **观察前端**：
   - 控制台应显示消息解析日志
   - 页面右上角通知图标应显示未读数量
   - 点击通知图标应显示消息列表
   - ElMessage 应弹出提示

## 相关文件

- `src/services/notification.ts` - SSE 消息解析服务
- `src/layouts/AppHeader.vue` - 消息展示组件
- `SSE_NOTIFICATION_INTEGRATION.md` - SSE 集成文档
- `SSE_DEBUG_GUIDE.md` - SSE 调试指南

---

**修复时间**: 2024-12-09
**版本**: 2.1.0 (容错处理增强版本)

# SSE 连接消息过滤

## 需求说明

SSE 连接成功时，后端会发送 "连接成功: 2" 这样的系统消息，这是用于确认连接建立的心跳消息，不需要显示给用户。只有业务相关的推送消息才需要显示。

## 实现方案

在 AppHeader 组件的消息处理器中添加过滤逻辑，识别并忽略连接成功消息。

### 过滤规则

```typescript
const isConnectionMessage = 
  message.message.includes('连接成功') || 
  message.message.match(/连接成功[:：]\s*\d+/) ||
  (message.title === '系统通知' && message.message.includes('连接'))
```

**匹配条件：**
1. 消息内容包含 "连接成功"
2. 消息格式为 "连接成功: 数字" 或 "连接成功：数字"
3. 标题为 "系统通知" 且内容包含 "连接"

**匹配示例：**
- ✅ `连接成功: 2`
- ✅ `连接成功：2`
- ✅ `连接成功 2`
- ✅ 标题 "系统通知" + 内容 "连接成功"
- ❌ `报告生成成功`（不匹配）
- ❌ `任务完成`（不匹配）

## 代码实现

### 修改位置

文件：`src/layouts/AppHeader.vue`

### 修改前

```typescript
unsubscribe = notificationService.onMessage((message) => {
  console.log('收到新通知:', message)

  // 直接添加到通知列表
  notifications.value.unshift(message)

  // 直接显示 ElMessage
  ElMessage({
    message: message.message,
    type: message.type || 'info',
    duration: 3000
  })
})
```

**问题：**
所有消息都会显示，包括连接成功的系统消息。

### 修改后

```typescript
unsubscribe = notificationService.onMessage((message) => {
  console.log('=== AppHeader: 收到新通知 ===')
  console.log('通知对象:', message)
  console.log('通知标题:', message.title)
  console.log('通知内容:', message.message)

  // ✅ 过滤掉 SSE 连接成功的系统消息
  const isConnectionMessage = 
    message.message.includes('连接成功') || 
    message.message.match(/连接成功[:：]\s*\d+/) ||
    (message.title === '系统通知' && message.message.includes('连接'))
  
  if (isConnectionMessage) {
    console.log('=== AppHeader: 过滤掉SSE连接成功消息，不显示 ===')
    return // ✅ 不处理连接成功消息
  }

  // 添加到通知列表
  notifications.value.unshift(message)

  // 显示 ElMessage
  ElMessage({
    message: message.message || message.title || '新消息',
    type: message.type || 'info',
    duration: 3000,
    showClose: true
  })
})
```

## 工作流程

### 场景 1: 连接成功消息（被过滤）

```
后端推送: data: 连接成功: 2

↓

=== SSE Service: 收到数据块 ===
原始数据: data: 连接成功: 2

↓

=== SSE Service: 解析消息 ===
JSON 解析失败，作为纯文本处理
转换后的通知对象: {
  id: "notification_1234567890",
  title: "系统通知",
  message: "连接成功: 2",
  type: "info"
}

↓

=== AppHeader: 收到新通知 ===
通知内容: 连接成功: 2

↓

=== AppHeader: 过滤掉SSE连接成功消息，不显示 ===
(结束处理，不添加到列表，不显示提示)
```

**结果：**
- ❌ 不添加到通知列表
- ❌ 不显示 ElMessage
- ❌ 通知图标不增加数量

### 场景 2: 业务消息（正常显示）

```
后端推送: data: {"title":"报告完成","message":"您的技术方案报告已生成","type":"success"}

↓

=== SSE Service: 收到数据块 ===
=== SSE Service: 解析消息 ===
JSON 解析成功
转换后的通知对象: {
  id: "notification_1234567890",
  title: "报告完成",
  message: "您的技术方案报告已生成",
  type: "success"
}

↓

=== AppHeader: 收到新通知 ===
通知内容: 您的技术方案报告已生成
(不匹配过滤规则，继续处理)

↓

已添加到通知列表，当前通知数: 1

↓

=== AppHeader: ElMessage已调用 ===
```

**结果：**
- ✅ 添加到通知列表
- ✅ 显示绿色 ElMessage："您的技术方案报告已生成"
- ✅ 通知图标显示未读数量 1

## 测试用例

### 用例 1: 连接成功消息（纯文本）

**输入：**
```
data: 连接成功: 2
```

**处理：**
```
通知对象: {
  title: "系统通知",
  message: "连接成功: 2",
  type: "info"
}

isConnectionMessage: true
→ 过滤掉，不显示
```

**结果：**
- ❌ 不显示

### 用例 2: 连接成功消息（JSON）

**输入：**
```
data: {"title":"系统通知","message":"连接成功","type":"info"}
```

**处理：**
```
通知对象: {
  title: "系统通知",
  message: "连接成功",
  type: "info"
}

isConnectionMessage: true (title='系统通知' && message包含'连接')
→ 过滤掉，不显示
```

**结果：**
- ❌ 不显示

### 用例 3: 业务消息

**输入：**
```
data: {"title":"任务完成","message":"您的任务已完成","type":"success"}
```

**处理：**
```
通知对象: {
  title: "任务完成",
  message: "您的任务已完成",
  type: "success"
}

isConnectionMessage: false
→ 正常处理
```

**结果：**
- ✅ 显示绿色提示："您的任务已完成"
- ✅ 添加到通知列表

### 用例 4: 包含"连接"但不是连接成功消息

**输入：**
```
data: {"title":"网络提示","message":"数据库连接失败","type":"error"}
```

**处理：**
```
通知对象: {
  title: "网络提示",
  message: "数据库连接失败",
  type: "error"
}

isConnectionMessage: false (title≠'系统通知')
→ 正常处理
```

**结果：**
- ✅ 显示红色提示："数据库连接失败"
- ✅ 添加到通知列表

## 调试日志

### 连接成功消息被过滤

```
=== SSE Service: 收到数据块 ===
原始数据: data: 连接成功: 2

=== SSE Service: 解析消息 ===
数据字符串: 连接成功: 2
JSON 解析失败，将消息作为纯文本处理
作为纯文本处理: {
  title: "系统通知",
  message: "连接成功: 2",
  type: "info"
}

=== SSE Service: 触发消息处理器 ===
处理器数量: 1
执行处理器 1

=== AppHeader: 收到新通知 ===
通知对象: {...}
通知标题: 系统通知
通知内容: 连接成功: 2
通知类型: info

=== AppHeader: 过滤掉SSE连接成功消息，不显示 ===

处理器 1 执行成功
```

### 业务消息正常显示

```
=== SSE Service: 收到数据块 ===
原始数据: data: {"title":"报告完成","message":"已生成报告"}

=== SSE Service: 解析消息 ===
解析后的数据: {title: "报告完成", message: "已生成报告"}

=== AppHeader: 收到新通知 ===
通知标题: 报告完成
通知内容: 已生成报告
(未匹配过滤规则，继续处理)

已添加到通知列表，当前通知数: 1

=== AppHeader: 准备显示ElMessage提示 ===
显示文本: 已生成报告
显示类型: info

=== AppHeader: ElMessage已调用 ===
```

## 扩展过滤规则

如果需要过滤更多类型的系统消息，可以扩展过滤条件：

```typescript
const isSystemMessage = 
  // 连接相关消息
  message.message.includes('连接成功') || 
  message.message.includes('连接失败') ||
  message.message.match(/连接成功[:：]\s*\d+/) ||
  
  // 心跳消息
  message.message.includes('心跳') ||
  message.message.includes('ping') ||
  
  // 其他系统消息
  (message.title === '系统通知' && 
   (message.message.includes('连接') || 
    message.message.includes('初始化')))

if (isSystemMessage) {
  console.log('=== AppHeader: 过滤掉系统消息，不显示 ===')
  return
}
```

## 注意事项

1. **过滤规则要精确**：避免误过滤业务消息
2. **日志保留**：即使过滤掉，仍在控制台输出日志，方便调试
3. **灵活调整**：根据实际业务需求调整过滤规则
4. **后端规范**：建议后端在消息中添加 `isSystem` 标识：

```json
{
  "title": "系统通知",
  "message": "连接成功: 2",
  "type": "info",
  "isSystem": true  // 标识为系统消息
}
```

前端可以简化为：
```typescript
if (message.isSystem) {
  return // 过滤系统消息
}
```

## 相关文件

- `src/layouts/AppHeader.vue` - 消息处理和过滤
- `src/services/notification.ts` - SSE 消息解析
- `SSE_MESSAGE_PARSE_FIX.md` - 消息解析修复文档

---

**更新时间**: 2024-12-09
**版本**: 2.3.0 (消息过滤增强版本)

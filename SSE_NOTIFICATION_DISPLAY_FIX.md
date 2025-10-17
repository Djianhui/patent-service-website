# SSE 通知显示问题修复

## 问题描述

SSE 连接成功，消息也能收到并解析，但是通知不显示在界面上。

## 问题排查

### 可能的原因

1. **ElMessage 参数错误** - type 参数不正确导致显示失败
2. **消息内容为空** - message 字段为空字符串
3. **type 类型不匹配** - TypeScript 类型检查失败
4. **通知列表更新失败** - Vue 响应式数据更新异常
5. **ElMessage 组件未正确导入** - 组件引用错误

## 解决方案

增强消息处理器，添加完整的错误处理和日志：

### 修改前

```typescript
unsubscribe = notificationService.onMessage((message) => {
  console.log('=== AppHeader: 收到新通知 ===')
  console.log('通知对象:', message)

  // 添加到通知列表
  notifications.value.unshift(message)
  console.log('已添加到通知列表，当前通知数:', notifications.value.length)

  // 显示消息提示
  console.log('=== AppHeader: 显示ElMessage提示 ===')
  ElMessage({
    message: message.message,  // ❌ 可能为空
    type: message.type || 'info',  // ❌ type 可能不是有效值
    duration: 3000
  })
})
```

**潜在问题：**
1. `message.message` 可能为空字符串
2. `message.type` 可能是无效的类型值
3. 没有错误处理，一旦失败整个处理器停止

### 修改后

```typescript
unsubscribe = notificationService.onMessage((message) => {
  console.log('=== AppHeader: 收到新通知 ===')
  console.log('通知对象:', message)
  console.log('通知标题:', message.title)
  console.log('通知内容:', message.message)
  console.log('通知类型:', message.type)

  // ✅ 添加到通知列表（带错误处理）
  try {
    notifications.value.unshift(message)
    console.log('已添加到通知列表，当前通知数:', notifications.value.length)
    console.log('通知列表:', notifications.value)
  } catch (error) {
    console.error('=== AppHeader: 添加到通知列表失败 ===')
    console.error(error)
  }

  // ✅ 显示消息提示（带错误处理）
  try {
    console.log('=== AppHeader: 准备显示ElMessage提示 ===')
    
    // ✅ 确保消息内容不为空
    const messageText = message.message || message.title || '新消息'
    
    // ✅ 验证 type 类型
    const messageType = ['success', 'warning', 'info', 'error'].includes(message.type || '') 
      ? (message.type as 'success' | 'warning' | 'info' | 'error') 
      : 'info'
    
    console.log('显示文本:', messageText)
    console.log('显示类型:', messageType)
    
    ElMessage({
      message: messageText,
      type: messageType,
      duration: 3000,
      showClose: true  // ✅ 添加关闭按钮
    })
    
    console.log('=== AppHeader: ElMessage已调用 ===')
  } catch (error) {
    console.error('=== AppHeader: 显示ElMessage失败 ===')
    console.error(error)
    
    // ✅ 降级处理：如果ElMessage失败，尝试使用简单提示
    try {
      ElMessage(message.message || '收到新消息')
    } catch (e) {
      console.error('简单提示也失败:', e)
    }
  }
})
```

## 改进点

### 1. 消息内容保护

```typescript
// 优先使用 message，其次 title，最后默认值
const messageText = message.message || message.title || '新消息'
```

**处理场景：**
- `message.message` 为空 → 使用 `message.title`
- 两者都为空 → 使用 "新消息"

### 2. 类型验证

```typescript
// 验证 type 是否为有效值
const messageType = ['success', 'warning', 'info', 'error'].includes(message.type || '') 
  ? (message.type as 'success' | 'warning' | 'info' | 'error') 
  : 'info'
```

**有效类型：**
- ✅ `success` - 成功（绿色）
- ✅ `warning` - 警告（黄色）
- ✅ `info` - 信息（蓝色）
- ✅ `error` - 错误（红色）
- ❌ 其他值 → 默认 `info`

### 3. 错误隔离

```typescript
try {
  // 添加到通知列表
} catch (error) {
  console.error('添加失败:', error)
}

try {
  // 显示 ElMessage
} catch (error) {
  console.error('显示失败:', error)
  // 降级处理
}
```

**好处：**
- 一个操作失败不影响另一个
- 添加列表失败，仍会显示提示
- 显示提示失败，通知仍在列表中

### 4. 详细日志

```typescript
console.log('通知对象:', message)
console.log('通知标题:', message.title)
console.log('通知内容:', message.message)
console.log('通知类型:', message.type)
console.log('显示文本:', messageText)
console.log('显示类型:', messageType)
```

**调试信息：**
- 原始通知对象
- 各个字段值
- 处理后的显示值
- 操作结果

### 5. 降级处理

```typescript
try {
  ElMessage({
    message: messageText,
    type: messageType,
    duration: 3000,
    showClose: true
  })
} catch (error) {
  // 如果完整参数失败，尝试简单调用
  ElMessage(message.message || '收到新消息')
}
```

## 调试日志示例

### 成功场景

```
=== AppHeader: 收到新通知 ===
通知对象: {
  id: "notification_1234567890",
  title: "系统通知",
  message: "连接成功: 2",
  type: "info",
  read: false,
  time: "2024-12-09T12:00:00.000Z"
}
通知标题: 系统通知
通知内容: 连接成功: 2
通知类型: info

已添加到通知列表，当前通知数: 1
通知列表: [{...}]

=== AppHeader: 准备显示ElMessage提示 ===
显示文本: 连接成功: 2
显示类型: info

=== AppHeader: ElMessage已调用 ===
```

### 消息内容为空

```
=== AppHeader: 收到新通知 ===
通知对象: {
  id: "notification_1234567890",
  title: "系统通知",
  message: "",  // 空字符串
  type: "info",
  read: false
}
通知标题: 系统通知
通知内容: (空)
通知类型: info

显示文本: 系统通知  // ✅ 降级使用 title
显示类型: info

=== AppHeader: ElMessage已调用 ===
```

### 类型无效

```
=== AppHeader: 收到新通知 ===
通知对象: {
  title: "测试",
  message: "测试消息",
  type: "invalid-type",  // 无效类型
  ...
}
通知类型: invalid-type

显示文本: 测试消息
显示类型: info  // ✅ 降级为 info

=== AppHeader: ElMessage已调用 ===
```

### ElMessage 失败降级

```
=== AppHeader: 准备显示ElMessage提示 ===
显示文本: 连接成功: 2
显示类型: info

=== AppHeader: 显示ElMessage失败 ===
Error: [具体错误信息]

尝试简单提示...
(使用 ElMessage('连接成功: 2') 调用)
```

## 验证步骤

### 1. 检查控制台日志

登录后，查看控制台应有完整的日志输出：

```
=== Store: 登录成功 ===
=== Store: 获取用户详细信息并建立SSE连接 ===
=== SSE Service: 连接已建立成功! ===
=== AppHeader: 注册消息处理器 ===

// 收到消息时
=== SSE Service: 收到数据块 ===
=== SSE Service: 解析消息 ===
=== AppHeader: 收到新通知 ===
通知标题: 系统通知
通知内容: 连接成功: 2
显示文本: 连接成功: 2
显示类型: info
=== AppHeader: ElMessage已调用 ===
```

### 2. 检查界面显示

- ✅ 页面右上角通知图标显示未读数量（红色徽章）
- ✅ 屏幕上方弹出 ElMessage 提示框
- ✅ 点击通知图标，抽屉中显示消息列表

### 3. 检查通知列表

点击通知图标，应看到：

```
┌─────────────────────────────┐
│ 通知消息                     │
├─────────────────────────────┤
│ ● 系统通知               [×] │
│   连接成功: 2                │
│   刚刚                       │
├─────────────────────────────┤
│   [全部标记已读]             │
└─────────────────────────────┘
```

### 4. 测试不同消息格式

**JSON 消息：**
```json
data: {"title":"任务完成","message":"报告已生成","type":"success"}
```

**纯文本消息：**
```
data: 连接成功: 2
```

**空消息测试：**
```json
data: {"title":"","message":"","type":"info"}
```
应显示："新消息"

## 常见问题

### Q1: ElMessage 不显示

**可能原因：**
1. Element Plus 未正确导入
2. message 为空字符串
3. type 类型错误

**解决方法：**
- 检查 import 语句
- 使用降级值：`message || title || '新消息'`
- 验证 type 类型

### Q2: 通知列表为空

**可能原因：**
1. `notifications.value.unshift()` 失败
2. Vue 响应式失效

**解决方法：**
- 查看控制台错误日志
- 检查 `notifications` 是否为 `ref` 类型
- 确认通知对象结构正确

### Q3: 只有提示没有列表

**可能原因：**
- 添加到列表失败但 ElMessage 成功

**解决方法：**
- 查看 "添加到通知列表失败" 日志
- 检查通知对象是否符合 NotificationMessage 类型

### Q4: 日志显示调用成功但看不到

**可能原因：**
1. ElMessage 的 duration 太短
2. z-index 被遮挡
3. ElMessage 容器未正确挂载

**解决方法：**
```typescript
ElMessage({
  message: messageText,
  type: messageType,
  duration: 5000,  // 延长显示时间
  showClose: true,  // 添加关闭按钮
  grouping: false   // 不合并相同消息
})
```

## 相关文件

- `src/layouts/AppHeader.vue` - 消息处理和显示
- `src/services/notification.ts` - SSE 消息解析
- `src/types/index.ts` - NotificationMessage 类型定义

---

**修复时间**: 2024-12-09
**版本**: 2.2.0 (通知显示增强版本)

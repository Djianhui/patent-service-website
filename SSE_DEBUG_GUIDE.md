# SSE 实时通知调试指南

## 调试日志流程

登录成功后，控制台会输出以下完整的 SSE 连接调试日志：

### 1. 登录流程日志

```
=== Store: 开始登录 ===
=== Store: 登录响应 ===
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
Token长度: xxx
用户信息: { ... }
=== Store: 保存到localStorage ===
localStorage.token: eyJhbGciOiJIUzI1NiIsInR5cCI6...
localStorage.user: {"id":"1","username":"admin"...
```

### 2. 获取用户详细信息

```
=== Store: 获取用户详细信息并建立SSE连接 ===
用户详细信息: {
  id: "1",
  username: "admin",
  userId: 1,
  ...
}
```

### 3. SSE 连接建立流程

```
=== SSE: 开始连接 ===
userId: 1

=== SSE Service: connect 方法被调用 ===
userId: 1

=== SSE Service: 检测到旧连接，先断开 ===  (如果有旧连接)

=== SSE Service: disconnect 方法被调用 ===
=== SSE Service: 取消 fetch 请求 ===
=== SSE Service: fetch 请求已取消 ===
=== SSE Service: 断开完成 ===

=== SSE Service: 获取到token ===
token 前30字符: eyJhbGciOiJIUzI1NiIsInR5cCI6...

=== SSE Service: 构建连接URL ===
完整URL: https://patent.langdetech.cn/api/sse/connect/1

=== SSE Service: 发起 fetch 请求 ===

=== SSE Service: fetch 请求已发送，等待连接... ===
```

### 4. SSE 连接成功

```
=== SSE Service: 收到响应 ===
status: 200
statusText: OK
headers: {
  "content-type": "text/event-stream",
  "connection": "keep-alive",
  ...
}

=== SSE Service: 连接已建立成功! ===

=== SSE: 连接请求已发送 ===
=====================
```

### 5. AppHeader 组件注册消息监听

```
=== AppHeader: connectSSE 被调用 ===
userId: 1

=== AppHeader: 取消之前的消息监听 ===  (如果有)
=== AppHeader: 断开旧SSE连接 ===

=== AppHeader: 调用 notificationService.connect ===

=== AppHeader: 注册消息处理器 ===
=== SSE Service: 注册消息处理器 ===
当前处理器总数: 1

=== AppHeader: SSE连接设置完成 ===
```

### 6. 接收消息时的日志

当后端推送消息时：

```
=== SSE Service: 收到数据块 ===
原始数据: data: {"id":"123","title":"测试通知","message":"这是一条测试消息","type":"info"}

=== SSE Service: 解析消息 ===
数据字符串: {"id":"123","title":"测试通知","message":"这是一条测试消息","type":"info"}

解析后的数据: {
  id: "123",
  title: "测试通知",
  message: "这是一条测试消息",
  type: "info"
}

转换后的通知对象: {
  id: "123",
  title: "测试通知",
  message: "这是一条测试消息",
  time: "2024-12-09T12:00:00.000Z",
  read: false,
  type: "info"
}

=== SSE Service: 触发消息处理器 ===
处理器数量: 1
执行处理器 1

=== AppHeader: 收到新通知 ===
通知对象: { ... }
已添加到通知列表，当前通知数: 1

=== AppHeader: 显示ElMessage提示 ===
```

### 7. 连接错误时的日志

```
=== SSE Service: 连接错误 ===
error: [Error object]
readyState: 2

=== SSE Service: 连接已关闭，准备重连 ===
=== SSE Service: 连接断开，准备第 1 次重连 ===
3秒后尝试重连...

=== SSE Service: 开始重连 ===
(重复连接流程...)
```

### 8. 登出时的日志

```
=== SSE: 登出时断开连接 ===
=== SSE Service: disconnect 方法被调用 ===
=== SSE Service: 取消 fetch 请求 ===
=== SSE Service: fetch 请求已取消 ===
=== SSE Service: 清除重连定时器 ===
=== SSE Service: 断开完成 ===
```

## 调试技巧

### 1. 检查连接状态

在浏览器控制台输入：

```javascript
// 检查连接状态
notificationService.isConnected()
// true: 已连接
// false: 未连接

// 获取详细状态
notificationService.getConnectionState()
// 0: CONNECTING (正在连接)
// 1: OPEN (已连接)
// 2: CLOSED (已关闭)
```

### 2. 查看当前用户信息

```javascript
// 在控制台查看
JSON.parse(localStorage.getItem('user'))
```

### 3. 手动触发连接

```javascript
// 获取 userId
const user = JSON.parse(localStorage.getItem('user'))
console.log('userId:', user.userId)

// 手动连接
notificationService.connect(user.userId)
```

### 4. 查看网络请求

打开浏览器开发者工具 -> Network 标签页：
1. 筛选类型选择 "EventStream" 或 "All"
2. 找到 `sse/connect/{userId}` 请求
3. 查看请求头、响应头和数据流

## 常见问题排查

### 问题 1: 连接建立失败

**检查步骤：**

1. 查看控制台日志，确认是否有 `userId`：
   ```
   === SSE: userId 为空，无法建立SSE连接 ===
   ```

2. 检查 token 是否存在：
   ```
   === SSE Service: 连接失败 - 未找到token ===
   ```

3. 查看 Network 标签，检查请求状态码：
   - 401: Token 无效或已过期
   - 403: 权限不足
   - 404: 接口路径错误

### 问题 2: 能连接但收不到消息

**检查步骤：**

1. 确认消息处理器已注册：
   ```
   === SSE Service: 注册消息处理器 ===
   当前处理器总数: 1  // 应该 > 0
   ```

2. 在 Network 标签中查看 EventStream，确认后端有发送数据

3. 检查消息格式是否正确（应为 JSON 格式）

### 问题 3: 连接频繁断开重连

**检查步骤：**

1. 查看重连日志：
   ```
   === SSE Service: 连接断开，准备第 X 次重连 ===
   ```

2. 检查网络稳定性

3. 查看后端日志，确认服务端是否主动断开连接

### 问题 4: 登录后没有建立连接

**检查步骤：**

1. 确认登录成功后有执行 `getUserInfo`：
   ```
   === Store: 获取用户详细信息并建立SSE连接 ===
   ```

2. 确认返回的用户信息包含 `userId`

3. 检查是否有错误日志：
   ```
   === 获取用户信息或建立SSE连接失败 ===
   ```

## 后端接口要求

### 1. `/api/getInfo` 接口

必须返回包含 `userId` 的用户信息：

```json
{
  "code": 200,
  "msg": "操作成功",
  "user": {
    "userId": 1,
    "userName": "admin",
    "email": "admin@example.com",
    ...
  }
}
```

### 2. `/api/sse/connect/{clientId}` 接口

- **认证方式**：从请求头 `Authorization` 中读取 token
- 返回正确的 SSE 响应头：
  ```
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive
  Access-Control-Allow-Origin: * (或具体域名)
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Headers: Authorization, Accept, Cache-Control
  ```

- 消息格式：
  ```
  data: {"id":"123","title":"标题","message":"内容","type":"info"}

  ```
  或
  ```
  event: notification
  data: {"id":"123","title":"标题","message":"内容","type":"info"}

  ```

## 测试建议

### 1. 基础连接测试

1. 登录系统
2. 查看控制台日志，确认连接成功
3. 查看 Network 标签，确认 SSE 连接保持打开状态

### 2. 消息接收测试

1. 后端手动推送一条测试消息
2. 查看控制台日志，确认收到消息
3. 查看页面右上角通知图标，确认未读数量增加
4. 点击通知图标，查看消息列表

### 3. 重连测试

1. 断开网络连接
2. 查看控制台，确认开始重连
3. 恢复网络连接
4. 确认重连成功

### 4. 登出测试

1. 点击登出按钮
2. 查看控制台，确认 SSE 连接已断开
3. 确认通知列表已清空

## 性能监控

### 监控指标

1. **连接建立时间**: 从调用 `connect` 到 `onopen` 的时间
2. **消息延迟**: 后端发送到前端接收的时间差
3. **重连次数**: 一段时间内的重连次数
4. **内存使用**: 通知列表的大小

### 优化建议

1. 通知列表限制最大数量（如 100 条）
2. 定期清理已读通知
3. 考虑将通知持久化到 localStorage
4. 监控连接状态，异常时提示用户

---

**更新时间**: 2024-12-09
**版本**: 1.0.0

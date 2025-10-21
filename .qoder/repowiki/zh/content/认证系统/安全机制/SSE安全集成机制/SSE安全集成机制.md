# SSE安全集成机制

<cite>
**Referenced Files in This Document**   
- [SSE_TOKEN_AUTH_CHANGE.md](file://SSE_TOKEN_AUTH_CHANGE.md)
- [src/stores/auth.ts](file://src/stores/auth.ts)
- [src/services/notification.ts](file://src/services/notification.ts)
</cite>

## 目录
1. [引言](#引言)
2. [认证方式演进](#认证方式演进)
3. [技术挑战与解决方案](#技术挑战与解决方案)
4. [核心组件分析](#核心组件分析)
5. [SSE连接生命周期管理](#sse连接生命周期管理)
6. [安全连接实现流程](#安全连接实现流程)
7. [错误处理与重连机制](#错误处理与重连机制)
8. [最佳实践与注意事项](#最佳实践与注意事项)
9. [结论](#结论)

## 引言
本文档深入解析专利服务平台中基于token的SSE（Server-Sent Events）连接安全机制。随着系统安全要求的提升，原有的URL参数传递token方式已被弃用，转而采用符合标准的Authorization请求头认证方式。本文档详细阐述了这一安全机制的演进过程、技术实现细节以及完整的连接管理流程。

## 认证方式演进

### 从URL参数到请求头
在系统早期版本中，SSE连接通过URL查询参数传递token：
```
https://patent.langdetech.cn/api/sse/connect/1?token=xxx
```
这种方式存在明显的安全缺陷，因为token会暴露在浏览器历史记录、服务器日志和网络监控中。

### 标准化认证方式
根据后端接口规范，token应通过标准的`Authorization`请求头传递：
```
Authorization: <token>
Accept: text/event-stream
Cache-Control: no-cache
```
这种方式符合HTTP认证标准，有效保护了敏感信息。

**Section sources**
- [SSE_TOKEN_AUTH_CHANGE.md](file://SSE_TOKEN_AUTH_CHANGE.md#L1-L50)

## 技术挑战与解决方案

### EventSource的限制
标准的`EventSource` API存在一个关键限制：**不支持自定义请求头**。这使得无法通过`Authorization`头传递token，迫使系统寻找替代方案。

### fetch API + ReadableStream方案
采用fetch API结合ReadableStream的解决方案，完美解决了这一限制：

```mermaid
flowchart TD
A[发起SSE连接] --> B[创建AbortController]
B --> C[使用fetch发起GET请求]
C --> D[设置Authorization请求头]
D --> E[获取响应体Reader]
E --> F[递归读取数据流]
F --> G[解析SSE消息格式]
G --> H[触发消息处理器]
H --> I[持续监听新消息]
```

**Diagram sources**
- [src/services/notification.ts](file://src/services/notification.ts#L50-L150)

**Section sources**
- [SSE_TOKEN_AUTH_CHANGE.md](file://SSE_TOKEN_AUTH_CHANGE.md#L50-L100)

## 核心组件分析

### NotificationService实现
`NotificationService`类是SSE连接的核心管理组件，实现了完整的连接生命周期管理。

#### 连接建立流程
```mermaid
sequenceDiagram
participant AuthStore as AuthStore
participant NotificationService as NotificationService
participant Backend as 后端服务
AuthStore->>NotificationService : connect(userId)
NotificationService->>NotificationService : 获取token
NotificationService->>Backend : fetch请求
Backend-->>NotificationService : 200 OK + text/event-stream
NotificationService->>NotificationService : 创建Reader
loop 持续监听
Backend->>NotificationService : data : {message}\n\n
NotificationService->>NotificationService : 解析消息
NotificationService->>AuthStore : 触发消息处理器
end
```

**Diagram sources**
- [src/services/notification.ts](file://src/services/notification.ts#L50-L200)

#### 消息解析机制
服务端发送的SSE消息格式为：
```
data: {"id":"123","title":"标题","message":"内容","type":"info"}
```
客户端通过`parseSSEMessage`方法解析该格式，提取JSON数据并转换为通知对象。

**Section sources**
- [src/services/notification.ts](file://src/services/notification.ts#L200-L250)

## SSE连接生命周期管理

### 连接建立
当用户成功登录后，系统立即建立SSE连接：

```mermaid
flowchart TD
A[用户登录] --> B[调用login方法]
B --> C[获取用户信息]
C --> D{userId存在?}
D --> |是| E[调用notificationService.connect]
D --> |否| F[记录警告]
E --> G[创建fetch请求]
G --> H[设置Authorization头]
H --> I[建立安全连接]
```

**Diagram sources**
- [src/stores/auth.ts](file://src/stores/auth.ts#L50-L100)

### 连接断开
用户登出时，系统安全断开SSE连接：

```mermaid
flowchart TD
A[用户登出] --> B[调用logout方法]
B --> C[调用notificationService.disconnect]
C --> D[关闭EventSource]
D --> E[取消fetch请求]
E --> F[清除重连定时器]
F --> G[清除连接状态]
G --> H[清除本地存储]
```

**Diagram sources**
- [src/stores/auth.ts](file://src/stores/auth.ts#L180-L200)

**Section sources**
- [src/stores/auth.ts](file://src/stores/auth.ts#L50-L200)

## 安全连接实现流程

### 完整连接流程
```mermaid
sequenceDiagram
participant LoginView as 登录界面
participant AuthStore as AuthStore
participant NotificationService as NotificationService
participant Backend as 后端服务
LoginView->>AuthStore : 提交登录凭证
AuthStore->>Backend : 调用login接口
Backend-->>AuthStore : 返回token和用户信息
AuthStore->>AuthStore : 保存token到localStorage
AuthStore->>AuthStore : 获取完整用户信息
AuthStore->>NotificationService : connect(userId)
NotificationService->>Backend : fetch + Authorization头
Backend-->>NotificationService : 建立SSE连接
loop 消息推送
Backend->>NotificationService : 推送通知消息
NotificationService->>LoginView : 显示通知
end
```

**Diagram sources**
- [src/stores/auth.ts](file://src/stores/auth.ts#L50-L100)
- [src/services/notification.ts](file://src/services/notification.ts#L50-L150)

### 安全断开流程
```mermaid
sequenceDiagram
participant ProfileView as 个人中心
participant AuthStore as AuthStore
participant NotificationService as NotificationService
ProfileView->>AuthStore : 点击登出
AuthStore->>Backend : 调用logout接口
AuthStore->>NotificationService : disconnect()
NotificationService->>NotificationService : 关闭EventSource
NotificationService->>NotificationService : 取消fetch请求
NotificationService->>NotificationService : 清除定时器
AuthStore->>AuthStore : 清除本地存储
AuthStore-->>ProfileView : 完成登出
```

**Diagram sources**
- [src/stores/auth.ts](file://src/stores/auth.ts#L180-L200)

## 错误处理与重连机制

### 错误处理策略
系统实现了多层次的错误处理机制：

```mermaid
flowchart TD
A[连接错误] --> B{错误类型}
B --> |AbortError| C[主动断开，不重连]
B --> |HTTP错误| D[启动重连机制]
B --> |解析错误| E[作为纯文本处理]
D --> F[检查重连次数]
F --> |未达上限| G[延迟后重连]
F --> |已达上限| H[停止重连]
```

**Section sources**
- [src/services/notification.ts](file://src/services/notification.ts#L150-L250)

### 重连机制
系统实现了智能重连机制，最多尝试5次，每次间隔3秒：

```typescript
private maxReconnectAttempts = 5
private reconnectDelay = 3000
```

**Section sources**
- [src/services/notification.ts](file://src/services/notification.ts#L20-L30)

## 最佳实践与注意事项

### CORS配置
后端必须正确配置CORS，允许前端域名访问，并允许`Authorization`请求头：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization, Accept, Cache-Control
```

### Token管理
确保token不包含双引号，从localStorage读取时需正确解析。

### 连接保持
SSE连接会长时间保持，后端需支持长连接，前端需实现心跳机制。

**Section sources**
- [SSE_TOKEN_AUTH_CHANGE.md](file://SSE_TOKEN_AUTH_CHANGE.md#L200-L250)

## 结论
通过采用fetch API + ReadableStream方案，系统成功实现了基于Authorization请求头的安全SSE连接机制。该方案不仅解决了EventSource不支持自定义请求头的技术限制，还提升了系统的整体安全性。结合完善的连接生命周期管理、错误处理和重连机制，为用户提供了稳定可靠的消息推送服务。
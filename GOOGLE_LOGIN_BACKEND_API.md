# 后端Google登录接口文档

## 接口规范

### 1. 授权码登录接口

```
GET /api/google/auth/toLogin
```

#### 请求参数

| 参数名 | 类型   | 必填 | 说明         |
| ------ | ------ | ---- | ------------ |
| code   | string | 是   | Google授权码 |

#### 请求示例

```
GET /api/google/auth/toLogin?code=4%2F0AVGzR1CyUQpjr1sN8wE8SK9NNPl6vFIhnuygkrfFvwAjWYGfZb8m9lFHXUh79aGOfgYcxQ
```

#### 成功响应

```json
{
  "code": 200,
  "msg": "操作成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "123456",
    "username": "google_user",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### 失败响应

```json
{
  "code": 400,
  "msg": "无效的授权码"
}
```

### 2. ID Token登录接口（备用）

```
POST /google-login
```

#### 请求参数

| 参数名  | 类型   | 必填 | 说明            |
| ------- | ------ | ---- | --------------- |
| idToken | string | 是   | Google ID Token |

#### 请求示例

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ..."
}
```

#### 响应格式

同上

## 前端调用示例

### JavaScript/TypeScript

```typescript
// 使用授权码登录
const response = await request.get<any>('/api/google/auth/toLogin', {
  params: {
    code: '授权码',
  },
})

// 使用ID Token登录
const response = await request.post<any>('/google-login', {
  idToken: 'ID Token',
})
```

## 错误处理

### 常见错误码

| 错误码 | 说明           |
| ------ | -------------- |
| 200    | 操作成功       |
| 400    | 请求参数错误   |
| 401    | 认证失败       |
| 500    | 服务器内部错误 |

### 错误处理建议

1. 授权码过期：引导用户重新登录
2. 网络错误：提示用户检查网络连接
3. 服务器错误：显示友好错误信息并记录日志

## 安全建议

1. 授权码只能使用一次，使用后立即失效
2. Token应设置合理的过期时间
3. 对敏感操作进行二次验证
4. 记录登录日志用于安全审计

## 测试用例

### 正常流程

1. 用户点击Google登录按钮
2. 重定向到Google授权页面
3. 用户授权后返回授权码
4. 前端将授权码发送到后端
5. 后端验证授权码并返回用户信息和Token
6. 前端保存Token并跳转到首页

### 异常流程

1. 授权码过期或无效
2. 网络连接中断
3. 后端服务不可用
4. 用户取消授权

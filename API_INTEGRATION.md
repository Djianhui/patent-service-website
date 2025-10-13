# 前后端联调说明文档

## 一、后端 API 配置

### 1. API 基础地址
```
https://patent.langdetech.cn/api
```

### 2. 环境配置
项目已配置以下环境文件：
- `.env` - 默认环境配置
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

所有环境文件中的 `VITE_API_BASE_URL` 都已设置为后端地址。

## 二、登录接口

### 1. 接口信息
- **请求方式**: POST
- **请求地址**: `/login`
- **完整URL**: `https://patent.langdetech.cn/api/login`
- **Content-Type**: `application/json`

### 2. 请求参数
```json
{
  "username": "admin",
  "password": "123456"
}
```

### 3. 测试账号
根据项目配置，支持以下测试账号：

#### 管理员账号
- 用户名：`admin`
- 密码：`admin123`

### 4. 响应格式
后端需要返回以下格式的数据：
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "expiresIn": 7200
}
```

**注意**: 如果后端返回的数据结构不同，前端会自动适配。只要包含 `token` 字段即可。

## 三、前端实现细节

### 1. 文件修改清单
- ✅ `src/services/http.ts` - HTTP 请求封装，配置基础URL和拦截器
- ✅ `src/services/auth.ts` - 认证服务，实现真实API调用
- ✅ `src/views/auth/LoginView.vue` - 登录页面，增加调试信息
- ✅ `src/stores/auth.ts` - 认证状态管理
- ✅ `.env` - 环境配置文件

### 2. 请求流程
```
用户输入 → 表单验证 → authStore.login() 
  → authService.login() → HTTP POST /login 
  → 保存 token 和用户信息 → 跳转到首页
```

### 3. Token 存储
- Token 存储在 `localStorage` 中
- 每次请求自动在 header 中添加 `Authorization: Bearer ${token}`
- Token 过期后自动清除并跳转登录页

### 4. 错误处理
- 401: 未授权，清除 token 并跳转登录页
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器错误
- 网络错误: 提示检查网络连接

## 四、测试步骤

### 1. 启动项目
```bash
npm run dev
```

### 2. 访问登录页
```
http://localhost:5173/login
```

### 3. 测试登录
1. 使用测试账号登录：
   - 手机号：15211191964
   - 密码：123456

2. 或点击"一键登录"按钮快速填充

3. 查看浏览器控制台，会显示：
   - 开始登录，用户名: xxx
   - 发送请求: POST /login
   - 登录成功
   - 准备跳转到: /app/dashboard

### 4. 检查请求
打开浏览器开发者工具的 Network 面板，查看：
- 请求URL: `https://patent.langdetech.cn/api/login`
- 请求方法: POST
- 请求头: Content-Type: application/json
- 请求体: {"username":"admin","password":"admin123"}

### 5. 检查响应
- 成功: 返回 token 和用户信息
- 失败: 显示错误提示信息

## 五、常见问题

### 1. 跨域问题
如果遇到 CORS 错误，需要后端配置允许跨域：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. 请求超时
默认超时时间为 30 秒，可在 `src/services/http.ts` 中修改：
```typescript
timeout: 30000  // 毫秒
```

### 3. Token 格式
确保后端返回的 token 是字符串格式，前端会自动添加 `Bearer` 前缀。

### 4. 用户信息不完整
如果后端只返回 token，前端会自动补充基本的用户信息。建议后端返回完整的用户信息。

## 六、后续接口对接

其他接口的对接可以参考登录接口的实现方式：

1. 在对应的 service 文件中使用 `request.post/get/put/delete` 方法
2. 传入相对路径（如 `/users`），会自动拼接基础URL
3. Token 会自动添加到请求头
4. 错误会自动处理并显示提示

例如：
```typescript
// 获取用户列表
export const getUserList = async () => {
  return request.get('/users')
}

// 创建用户
export const createUser = async (data: any) => {
  return request.post('/users', data)
}
```

## 七、调试技巧

### 1. 查看请求详情
在浏览器控制台会打印：
```
发送请求: POST /login
```

### 2. 查看错误信息
登录失败时，控制台会显示：
```
登录失败: Error: 用户名或密码错误
```

### 3. 检查 Token
登录成功后，在控制台执行：
```javascript
localStorage.getItem('token')
```

### 4. 清除登录状态
```javascript
localStorage.clear()
location.reload()
```

## 八、联系方式

如有问题，请联系前端开发团队。

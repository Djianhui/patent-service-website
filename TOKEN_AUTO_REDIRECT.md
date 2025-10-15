# Token失效自动跳转功能文档

## 概述

实现了token失效时自动跳转到登录界面的功能，当用户的认证token过期或无效时，系统会自动清除认证信息并引导用户重新登录。

## 实现位置

### 主要文件
- **HTTP拦截器**: `src/services/http.ts`
- **路由守卫**: `src/router/index.ts`
- **认证Store**: `src/stores/auth.ts`

## 功能实现

### 1. HTTP响应拦截器（核心实现）

**文件**: `src/services/http.ts`

#### 401错误处理流程

```typescript
// 响应拦截器中的401处理
case 401:
  // 防止重复提示
  if (!isTokenExpiredMessageShown) {
    isTokenExpiredMessageShown = true
    ElMessage.error('登录已过期，请重新登录')
    
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpireTime')
    
    // 延迟跳转，确保消息显示
    setTimeout(() => {
      isTokenExpiredMessageShown = false
      // 使用router跳转，保留当前路径用于登录后跳转回来
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register') {
        router.push({
          path: '/login',
          query: { redirect: currentPath }
        })
      } else {
        router.push('/login')
      }
    }, 500)
  }
  break
```

#### 关键改进点

1. **防重复提示机制**
   ```typescript
   let isTokenExpiredMessageShown = false
   ```
   - 防止多个401请求同时触发时重复弹出消息
   - 在延迟后重置标志，允许下次提示

2. **使用Vue Router替代window.location**
   - **之前**: `window.location.href = '/login'` （会导致整页刷新）
   - **现在**: `router.push('/login')` （SPA内路由跳转，保留应用状态）

3. **保留重定向路径**
   ```typescript
   router.push({
     path: '/login',
     query: { redirect: currentPath }
   })
   ```
   - 登录成功后可以跳转回原页面
   - 提升用户体验

4. **完整清除认证信息**
   ```typescript
   localStorage.removeItem('token')
   localStorage.removeItem('user')
   localStorage.removeItem('tokenExpireTime')
   ```

### 2. 路由守卫（前置检查）

**文件**: `src/router/index.ts`

```typescript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    if (!authStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 其他检查...
  next()
})
```

**作用**：
- 在路由跳转前检查认证状态
- 未登录用户访问受保护页面时自动跳转到登录页
- 保留目标路径，登录后可跳转回去

### 3. 认证Store（状态管理）

**文件**: `src/stores/auth.ts`

```typescript
const logout = async () => {
  loading.value = true
  try {
    await authService.logout()
  } catch (error) {
    console.error('登出请求失败:', error)
  } finally {
    // 清除本地数据
    token.value = null
    user.value = null
    storage.remove('token')
    storage.remove('user')
    storage.remove('tokenExpireTime')
    loading.value = false
  }
}
```

**作用**：
- 提供统一的登出方法
- 清除所有认证相关数据
- 重置store状态

## 触发场景

### 1. API请求返回401

```
用户操作 → 发起API请求 → 后端验证token失败 → 返回401
  ↓
HTTP拦截器捕获401
  ↓
显示"登录已过期"提示
  ↓
清除本地认证信息
  ↓
跳转到登录页（带redirect参数）
```

### 2. 路由导航检查

```
用户访问受保护路由
  ↓
路由守卫检查认证状态
  ↓
未登录 → 显示"请先登录"提示 → 跳转登录页
已登录 → 允许访问
```

## 用户体验流程

### 场景1：Token在使用中过期

1. 用户正在使用系统（如浏览报告列表）
2. Token已过期，下一个API请求返回401
3. 系统提示："登录已过期，请重新登录"
4. 自动跳转到登录页
5. 登录成功后自动返回到之前的页面

### 场景2：刷新页面时Token已过期

1. 用户刷新页面
2. 路由守卫检查认证状态
3. Token无效或不存在
4. 提示"请先登录"
5. 跳转到登录页

### 场景3：直接访问受保护页面

1. 未登录用户直接访问 `/app/dashboard`
2. 路由守卫拦截
3. 提示"请先登录"
4. 跳转到登录页，带上 `redirect=/app/dashboard`
5. 登录成功后自动跳转到Dashboard

## 技术细节

### 1. 防止重复提示

```typescript
let isTokenExpiredMessageShown = false

// 在401处理中
if (!isTokenExpiredMessageShown) {
  isTokenExpiredMessageShown = true
  // 显示消息和处理...
  
  setTimeout(() => {
    isTokenExpiredMessageShown = false
    // 跳转...
  }, 500)
}
```

**为什么需要**：
- 多个API请求同时返回401时，避免弹出多个相同提示
- 使用标志位控制，只显示一次

### 2. 延迟跳转

```typescript
setTimeout(() => {
  // 跳转逻辑
}, 500)
```

**为什么需要**：
- 确保用户能看到"登录已过期"的提示消息
- 给消息足够的显示时间
- 避免跳转过快导致用户不知道发生了什么

### 3. 路径检查

```typescript
const currentPath = window.location.pathname
if (currentPath !== '/login' && currentPath !== '/register') {
  router.push({
    path: '/login',
    query: { redirect: currentPath }
  })
} else {
  router.push('/login')
}
```

**为什么需要**：
- 避免在登录/注册页面时重复跳转
- 只在非登录页面时保留redirect参数
- 防止无限循环跳转

### 4. 使用Router而非window.location

**优势**：
- ✅ 不会整页刷新
- ✅ 保留Vue应用状态
- ✅ 更好的用户体验
- ✅ 支持路由过渡动画
- ✅ 可以使用路由守卫

**对比**：
```typescript
// ❌ 旧方式：会导致整页刷新
window.location.href = '/login'

// ✅ 新方式：SPA内路由跳转
router.push('/login')
```

## 错误处理

### 1. 401 - 未授权（Token失效）
- 提示："登录已过期，请重新登录"
- 清除认证信息
- 跳转到登录页

### 2. 403 - 禁止访问（权限不足）
- 提示："没有权限访问此资源"
- 不跳转，保持当前页面

### 3. 404 - 资源不存在
- 提示："请求的资源不存在"

### 4. 500 - 服务器错误
- 提示："服务器内部错误"

### 5. 网络错误
- 提示："网络错误，请检查网络连接"

## 安全性

### 1. 完整清除认证信息
```typescript
localStorage.removeItem('token')
localStorage.removeItem('user')
localStorage.removeItem('tokenExpireTime')
```
- 确保token不会被恶意利用
- 清除所有相关数据

### 2. 请求拦截器自动添加Token
```typescript
// 自动从localStorage读取token并添加到请求头
const token = getTokenFromStorage()
if (token) {
  config.headers.Authorization = token
}
```

### 3. Token格式处理
```typescript
// 处理JSON.stringify包裹的token
let token: string | null = null
if (tokenStr) {
  try {
    token = JSON.parse(tokenStr)
  } catch {
    token = tokenStr
  }
}
```

## 登录后跳转回原页面

### 登录页面实现

```typescript
// LoginView.vue
const route = useRoute()
const router = useRouter()

const handleLogin = async () => {
  // 登录逻辑...
  await authStore.login(credentials)
  
  // 获取重定向路径
  const redirectPath = (route.query.redirect as string) || '/app/dashboard'
  router.push(redirectPath)
}
```

### 完整流程

```
1. 用户访问 /app/tech-report/history
   ↓
2. Token失效，跳转到 /login?redirect=/app/tech-report/history
   ↓
3. 用户登录成功
   ↓
4. 自动跳转回 /app/tech-report/history
```

## 测试场景

### 1. Token过期测试
- ✅ 正常使用中token过期
- ✅ 显示正确的提示消息
- ✅ 自动跳转到登录页
- ✅ 登录后返回原页面

### 2. 刷新页面测试
- ✅ Token无效时刷新页面
- ✅ 路由守卫正确拦截
- ✅ 跳转到登录页

### 3. 直接访问测试
- ✅ 未登录直接访问受保护路由
- ✅ 正确拦截并跳转
- ✅ 保留redirect参数

### 4. 多请求并发测试
- ✅ 多个401同时返回
- ✅ 只显示一次提示
- ✅ 不会重复跳转

### 5. 边界情况测试
- ✅ 在登录页收到401不会循环
- ✅ 在注册页收到401不会循环
- ✅ 网络错误不会误判为401

## 最佳实践

### 1. Token刷新机制
```typescript
// 建议在token即将过期时主动刷新
const checkAuth = async () => {
  const expireTime = storage.get<number>('tokenExpireTime')
  if (expireTime && Date.now() > expireTime) {
    await refreshToken()
  }
}
```

### 2. 统一的认证检查
```typescript
// 在App.vue中初始化时检查
onMounted(async () => {
  await authStore.checkAuth()
})
```

### 3. 清晰的错误提示
- 401: "登录已过期，请重新登录"（明确告知原因）
- 不要使用技术性语言如"Token无效"

### 4. 保留用户操作状态
- 使用redirect参数保留目标路径
- 登录后自动返回，减少用户操作

## 相关文档

- [HTTP服务配置文档](./HTTP_SERVICE.md)
- [认证流程文档](./AUTH_FLOW.md)
- [路由守卫文档](./ROUTER_GUARD.md)

## 总结

Token失效自动跳转功能通过以下机制实现：

1. **HTTP拦截器**: 捕获401错误，清除认证信息，跳转登录页
2. **路由守卫**: 前置检查认证状态，拦截未授权访问
3. **防重复机制**: 避免多次提示和跳转
4. **优雅降级**: 使用Vue Router而非页面刷新
5. **用户体验**: 保留redirect路径，登录后自动返回

这套机制确保了系统的安全性，同时提供了良好的用户体验。

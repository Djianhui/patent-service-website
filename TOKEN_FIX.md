# Token 双引号问题修复说明

## 问题描述

Authorization 请求头中的 token 值被错误地包含了双引号，导致后端认证失败返回 401 错误。

### 原因分析

1. **存储方式**：`storage.set()` 使用 `JSON.stringify()` 保存 token
   ```typescript
   // src/utils/index.ts
   set(key: string, value: any): void {
     localStorage.setItem(key, JSON.stringify(value))
   }
   ```
   这会将字符串 token 转换为 JSON 格式，例如：
   - 原始 token: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - 存储后: `"eyJhbGciOiJIUzI1NiIsInR5cCI6..."`（带双引号）

2. **读取方式不匹配**：HTTP 拦截器直接使用 `localStorage.getItem('token')`
   ```typescript
   // 错误的方式
   const token = localStorage.getItem('token')
   // 获取到的是: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." （包含双引号）
   ```

3. **结果**：Authorization 头变成了 `"eyJhbGciOiJIUzI1NiIsInR5cCI6..."`，后端无法识别

## 解决方案

### 方案一：修改读取方式（已采用）

在读取 token 时，先尝试 JSON.parse()，如果失败则直接使用原始值：

```typescript
// src/services/http.ts
const tokenStr = localStorage.getItem('token')
let token: string | null = null
if (tokenStr) {
  try {
    // 尝试解析JSON（如果是通过storage.set存储的）
    token = JSON.parse(tokenStr)
  } catch {
    // 如果不是JSON格式，直接使用原始值
    token = tokenStr
  }
}
```

### 方案二：修改存储方式（备选）

修改 `storage.set()` 对字符串类型不进行 JSON.stringify()：

```typescript
set(key: string, value: any): void {
  try {
    // 对字符串类型直接存储，不进行JSON序列化
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  } catch (err) {
    console.error('存储失败:', err)
  }
}
```

## 修复文件列表

1. ✅ `src/services/http.ts`
   - 请求拦截器：添加 JSON.parse() 处理
   - 响应拦截器：添加 JSON.parse() 处理（用于日志）

2. ✅ `src/views/tech-report/TechReportNewView.vue`
   - generateReport 方法：添加 JSON.parse() 处理

## 测试步骤

1. 清除浏览器缓存：`localStorage.clear()`
2. 使用 admin/admin123 重新登录
3. 检查控制台日志，确认：
   - localStorage原始值显示带双引号
   - Token解析后不带双引号
   - Authorization头不带双引号
4. 生成技术报告，验证 401 错误已解决

## 预防措施

### 建议规范

1. **统一存储读取方式**：
   - 使用 `storage.set()` 存储时，必须使用 `storage.get()` 读取
   - 直接使用 `localStorage.setItem()` 存储时，使用 `localStorage.getItem()` 读取

2. **Token 存储最佳实践**：
   ```typescript
   // 推荐：直接存储字符串
   localStorage.setItem('token', token)
   
   // 或者：统一使用 storage 工具
   storage.set('token', token)
   const token = storage.get<string>('token')
   ```

3. **添加类型检查**：
   ```typescript
   const token = storage.get<string>('token')
   if (token && typeof token === 'string') {
     config.headers.Authorization = token
   }
   ```

## 相关问题

- [x] Authorization 头包含双引号
- [x] 401 认证失败
- [x] 后端无法识别 token 格式

## 更新日志

- 2025-10-10: 修复 token 双引号问题，采用方案一（读取时 JSON.parse）

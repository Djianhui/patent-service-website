# 登录功能验证码集成文档

## 概述

登录功能已集成验证码验证，与注册功能保持一致，提高账户安全性。

## API接口

### 1. 获取验证码
- **接口地址**: `/api/captchaImage`
- **请求方法**: `GET`
- **请求参数**: 无
- **返回数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "captchaEnabled": true,
  "uuid": "51ae29f7e6fd4ef48c54fb698dd8d79a",
  "img": "/9j/4AAQSkZJRgABAgAAAQABAAD/..." // Base64编码（不含data:前缀）
}
```

### 2. 用户登录
- **接口地址**: `/api/login`
- **请求方法**: `POST`
- **请求参数**:
```json
{
  "username": "用户名",
  "password": "密码",
  "code": "验证码",
  "uuid": "验证码唯一标识"
}
```
- **返回数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 前端实现

### 1. 修改的文件

#### src/services/auth.ts
- 修改 `LoginRequest` 接口，新增字段：
  - `code`: 验证码
  - `uuid`: 验证码唯一标识
- 修改 `login()` 方法：将验证码参数传递给后端

#### src/stores/auth.ts
- 修改 `login` action 参数类型，支持传入验证码

#### src/views/auth/LoginView.vue
- **新增字段**：
  - 验证码输入框
  - 验证码图片展示
- **新增功能**：
  - 页面加载时自动获取验证码
  - 点击验证码图片刷新
  - 登录失败后自动刷新验证码
  - 验证码输入验证（4位）

### 2. 登录流程

1. **页面加载**
   - 自动调用 `/api/captchaImage` 获取验证码
   - 显示验证码图片

2. **用户输入**
   - 输入用户名（至少3位）
   - 输入密码（至少6位）
   - 输入4位验证码

3. **提交登录**
   - 验证所有表单字段
   - 调用 `/api/login` 提交登录信息
   - 成功后跳转到 Dashboard
   - 失败后自动刷新验证码并清空验证码输入

4. **验证码刷新**
   - 点击验证码图片可刷新
   - 登录失败后自动刷新

### 3. 表单验证规则

```typescript
{
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: validateCode, trigger: 'blur' } // 验证码长度为4位
  ]
}
```

## 代码示例

### 获取验证码
```typescript
const getCaptcha = async () => {
  try {
    const response = await authStore.getCaptcha()
    captchaImg.value = response.img // 已自动添加Base64前缀
    captchaUuid.value = response.uuid
  } catch (error: any) {
    ElMessage.error(error.message || '获取验证码失败')
  }
}
```

### 登录提交
```typescript
await authStore.login({
  username: loginForm.username,
  password: loginForm.password,
  code: loginForm.code,
  uuid: captchaUuid.value,
  remember: loginForm.remember
})
```

## 错误处理

### 1. 获取验证码失败
- 显示错误提示消息
- 用户可点击验证码区域重新获取

### 2. 登录失败
- 显示后端返回的错误信息
- 自动刷新验证码
- 清空验证码输入框
- 保留用户名和密码输入

### 3. 验证码错误
- 后端验证失败时返回错误信息
- 前端自动刷新验证码
- 提示用户重新输入

## 安全特性

1. **防暴力破解**: 每次登录都需要输入验证码
2. **一次性验证**: 验证码使用后自动失效
3. **自动刷新**: 登录失败后自动获取新验证码
4. **有效期控制**: 验证码具有时效性（由后端控制）

## 用户体验优化

1. **自动加载**: 页面打开时自动获取验证码
2. **点击刷新**: 提供便捷的验证码刷新方式
3. **回车提交**: 支持在验证码输入框按回车登录
4. **失败恢复**: 登录失败后自动刷新验证码
5. **响应式设计**: 适配移动端和桌面端
6. **加载状态**: 登录过程中显示加载状态

## 界面设计

1. **验证码区域**:
   - 宽度120px，高度40px
   - 支持点击刷新
   - 悬停时有视觉反馈
2. **移动端适配**: 在小屏幕设备上验证码宽度调整为100px
3. **输入框布局**: 验证码输入框与图片并排显示

## 与注册功能的一致性

登录和注册功能的验证码实现完全一致：
- ✅ 使用相同的验证码接口
- ✅ 相同的验证码处理逻辑（Base64前缀）
- ✅ 相同的验证规则（4位验证码）
- ✅ 相同的刷新机制
- ✅ 相同的错误处理
- ✅ 相同的UI设计

## 测试要点

1. ✅ 页面加载时能否正常获取验证码
2. ✅ 点击验证码图片能否刷新
3. ✅ 表单验证是否正确
4. ✅ 登录成功后是否跳转到 Dashboard
5. ✅ 登录失败后是否刷新验证码
6. ✅ 回车键是否能提交登录
7. ✅ 错误提示是否友好
8. ✅ 移动端适配是否正常
9. ✅ 记住我功能是否正常

## 注意事项

1. **验证码图片格式**: 后端返回纯Base64字符串，前端自动添加 `data:image/jpeg;base64,` 前缀
2. **uuid一致性**: 获取验证码和提交登录时的uuid必须一致
3. **一次性使用**: 验证码使用后需要刷新，无论登录成功或失败
4. **验证码长度**: 默认为4位，如后端调整需同步修改前端验证
5. **与注册一致**: 保持登录和注册的验证码功能完全一致

## 后续优化建议

1. 可以添加验证码刷新的防抖处理
2. 可以添加验证码过期时间提示
3. 可以添加验证码输入错误次数限制
4. 可以支持滑动验证码等其他验证方式
5. 可以添加验证码语音播报功能（无障碍支持）

## 相关文档

- [注册功能API集成文档](./REGISTER_API_INTEGRATION.md)
- [验证码图片显示问题修复](./CAPTCHA_FIX.md)

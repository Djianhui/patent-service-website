# Google OAuth 配置指南

## 问题描述

当前Google登录功能出现以下错误：

```
Not a valid origin for the client: http://localhost:5174 has not been registered for client ID 122338399225-v3l7uvkq2k4u2m9c0hl254t2eo03g9f8.apps.googleusercontent.com. Please go to https://console.developers.google.com/ and register this origin for your project's client ID.
```

这是由于Google OAuth安全机制要求将使用OAuth的域名添加到授权来源列表中。

## 解决方案

### 1. 访问Google Cloud Console

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择或创建项目
3. 启用Google+ API（如果尚未启用）

### 2. 配置OAuth同意屏幕

1. 在左侧菜单中选择 "API和服务" > "OAuth同意屏幕"
2. 选择用户类型（通常选择"外部"）
3. 填写应用信息：
   - 应用名称：专利服务平台
   - 用户支持邮箱：your-email@example.com
   - 应用域名：http://localhost:5175
   - 应用首页链接：http://localhost:5175
4. 添加授权域：
   - http://localhost:5175
5. 保存配置

### 3. 创建OAuth 2.0客户端ID

1. 在左侧菜单中选择 "API和服务" > "凭据"
2. 点击 "创建凭据" > "OAuth 2.0客户端ID"
3. 应用类型选择 "Web应用程序"
4. 名称：专利服务平台
5. 授权JavaScript来源：
   - http://localhost:5175
6. 授权重定向URI：
   - http://localhost:5175
7. 点击创建

### 4. 更新代码中的客户端ID

获取新创建的客户端ID，并更新代码中的相应位置：

1. 在 `LoginView.vue` 文件中找到以下行：

   ```javascript
   client_id: 'YOUR_NEW_CLIENT_ID.apps.googleusercontent.com'
   ```

2. 将 `YOUR_NEW_CLIENT_ID` 替换为实际的客户端ID

### 5. 本地开发环境配置

对于本地开发，确保以下配置：

1. 使用的域名和端口必须与Google Cloud Console中配置的一致
2. 如果使用不同的端口，需要在Google Cloud Console中添加相应的授权来源

当前项目运行在端口5175上，请确保在Google Cloud Console中添加：

- http://localhost:5175

### 6. 生产环境配置

对于生产环境部署：

1. 添加实际的生产域名到授权来源列表
2. 例如：
   - https://patent.langdetech.cn
   - https://www.patent.langdetech.cn

### 7. 测试配置

配置完成后：

1. 重新启动开发服务器
2. 清除浏览器缓存和Cookie
3. 刷新页面并尝试Google登录

## 常见问题

### 1. 仍然出现"无效来源"错误

- 确保在Google Cloud Console中正确添加了授权来源
- 确保协议（http/https）和端口号完全匹配
- 等待配置生效（可能需要几分钟）

### 2. CORS错误

- 确保后端API支持CORS
- 检查后端是否正确处理Google ID Token

### 3. ID Token验证失败

- 确保后端正确实现了Google ID Token验证逻辑
- 检查后端Google API客户端库配置

## 安全建议

1. 不要在代码中硬编码客户端密钥
2. 为不同的环境（开发、测试、生产）创建不同的OAuth客户端
3. 定期轮换客户端密钥
4. 限制授权域的数量，只添加必要的域

## 参考链接

- [Google OAuth 2.0文档](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

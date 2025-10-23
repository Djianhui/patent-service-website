# Google OAuth 重定向URI不匹配问题解决方案

## 问题描述

错误信息：

```
错误 400： redirect_uri_mismatch
禁止访问："test_gg_login"的请求无效
duanhui105@gmail.com无法登录，因为"test_gg_login"发送的请求无效。
```

这个错误表示在Google Cloud Console中配置的重定向URI与应用实际使用的URI不匹配。

## 问题分析

根据代码分析，当前应用使用以下重定向URI：

- 登录页面构建的重定向URI：`${window.location.origin}/google-callback`
- 路由配置中的回调路径：`/google-callback`

假设当前应用运行在 `http://localhost:5176`，则实际使用的重定向URI为：

```
http://localhost:5176/google-callback
```

## 解决方案

### 1. 更新Google Cloud Console配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 "API和服务" > "凭据"
4. 找到您的OAuth 2.0客户端ID
5. 点击编辑按钮
6. 在"授权重定向URI"中添加以下URI：
   ```
   http://localhost:5176/google-callback
   https://patent.langdetech.cn/google-callback
   ```
7. 保存更改

### 2. 验证当前运行环境

确保您知道应用当前运行的域名和端口：

- 本地开发环境：通常是 `http://localhost:5176`
- 生产环境：应该是 `https://patent.langdetech.cn`

### 3. 检查代码中的重定向URI构建

在 `LoginView.vue` 中，重定向URI是这样构建的：

```javascript
const redirectUri = encodeURIComponent(`${window.location.origin}/google-callback`)
```

这会根据当前页面的origin动态生成重定向URI，确保与实际部署环境匹配。

### 4. 常见配置示例

#### 本地开发环境

```
授权JavaScript来源：
- http://localhost:5176

授权重定向URI：
- http://localhost:5176/google-callback
```

#### 生产环境

```
授权JavaScript来源：
- https://patent.langdetech.cn

授权重定向URI：
- https://patent.langdetech.cn/google-callback
```

## 测试步骤

1. 更新Google Cloud Console配置后，等待几分钟让配置生效
2. 清除浏览器缓存和Cookie
3. 重新尝试Google登录
4. 如果仍然失败，检查浏览器开发者工具中的网络请求，确认重定向URI是否正确

## 注意事项

1. 协议必须匹配（http/https）
2. 端口号必须匹配（如果使用非标准端口）
3. 路径必须完全匹配（包括大小写）
4. 配置更改后可能需要几分钟才能生效
5. 每个环境（开发、测试、生产）应该有独立的OAuth客户端配置

## 故障排除

如果问题仍然存在：

1. 检查浏览器地址栏确认当前应用的完整URL
2. 在浏览器开发者工具中查看网络请求，确认发送给Google的redirect_uri参数
3. 确保Google Cloud Console中的配置与应用实际使用的URI完全一致
4. 检查是否有代理或CDN影响了实际的请求URI

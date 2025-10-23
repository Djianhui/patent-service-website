Google登录流程说明
正确的Google登录流程应该是：
用户点击Google登录按钮
前端构建Google OAuth授权URL并重定向用户到Google授权页面
用户在Google页面授权后，Google会重定向回我们的回调页面(GoogleCallback.vue)
回调页面获取授权码并通过authStore.googleLogin方法完成登录

# Google登录功能完整实现指南

## 1. 获取Google Client ID

### 1.1 访问Google Cloud Console

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google+ API（如果尚未启用）

### 1.2 创建OAuth 2.0客户端ID

1. 在左侧导航栏中，点击"API和服务" > "凭据"
2. 点击"创建凭据" > "OAuth客户端ID"
3. 应用类型选择"Web应用程序"
4. 设置授权域名和重定向URI：
   - 授权JavaScript来源：`http://localhost:3000`（开发环境）
   - 授权重定向URI：`http://localhost:3000/auth/google/callback`（根据实际需要调整）

### 1.3 保存Client ID

- 复制生成的Client ID，将在代码中使用

## 2. 配置项目

### 2.1 在index.html中添加Google脚本

```html
<!-- Google登录脚本 -->
<script src="https://apis.google.com/js/platform.js" async defer></script>
```

### 2.2 替换Client ID

在`LoginView.vue`中找到以下代码并替换为实际的Client ID：

```javascript
const auth2 = await window.gapi.auth2.init({
  client_id: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com', // 替换为实际Client ID
  scope: 'profile email',
})
```

## 3. 后端API实现

### 3.1 创建Google登录接口

在后端创建`/google-login`接口，用于验证Google ID Token：

```javascript
// 示例Node.js实现
app.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body

    // 验证ID Token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const userid = payload['sub']
    const email = payload['email']
    const name = payload['name']

    // 检查用户是否已存在，如果不存在则创建新用户
    let user = await User.findOne({ googleId: userid })
    if (!user) {
      user = new User({
        googleId: userid,
        email: email,
        username: name,
        // 其他用户信息
      })
      await user.save()
    }

    // 生成JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' })

    res.json({
      code: 200,
      token: token,
      user: user,
      expiresIn: 7200,
    })
  } catch (error) {
    res.status(401).json({
      code: 401,
      msg: 'Google登录验证失败',
    })
  }
})
```

## 4. 前端实现详情

### 4.1 完整的handleGoogleLogin函数

```javascript
const handleGoogleLogin = async () => {
  try {
    // 检查gapi是否已加载
    if (typeof window.gapi === 'undefined') {
      ElMessage.error(t('auth.googleLoginError'));
      return;
    }

    // 显示加载状态
    loading.value = true;

    // 加载auth2库
    await new Promise((resolve, reject) => {
      window.gapi.load('auth2', () => {
        resolve();
      });
    });

    // 初始化auth2
    const auth2 = await window.gapi.auth2.init({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      scope: 'profile email'
    });

    // 执行登录
    const googleUser = await auth2.signIn();

    // 获取ID Token
    const idToken = googleUser.getAuthResponse().id_token;

    // 调用后端API进行验证和登录
    await authStore.googleLogin({ idToken });

    ElMessage.success(t('auth.googleLoginSuccess'));

    // 登录成功后跳转到仪表板
    const redirectPath = (route.query.redirect as string) || '/app/dashboard';
    router.push(redirectPath);
  } catch (error: any) {
    console.error('Google登录失败:', error);
    ElMessage.error(error.message || t('auth.googleLoginFailed'));
  } finally {
    loading.value = false;
  }
}
```

## 5. 测试和部署

### 5.1 本地测试

1. 启动开发服务器
2. 访问登录页面
3. 点击Google登录按钮
4. 验证是否能成功登录

### 5.2 生产环境部署

1. 在Google Cloud Console中添加生产域名
2. 更新Client ID为生产环境的ID
3. 确保HTTPS配置正确

## 6. 故障排除

### 6.1 常见问题

1. **gapi未定义**：检查index.html中是否正确添加了Google脚本
2. **Client ID错误**：确认使用了正确的Client ID
3. **CORS错误**：检查后端CORS配置
4. **Token验证失败**：检查后端Google API配置

### 6.2 调试技巧

1. 使用浏览器开发者工具检查网络请求
2. 查看控制台错误信息
3. 在Google Cloud Console中检查API使用情况

## 7. 安全注意事项

1. 始终在后端验证ID Token
2. 使用HTTPS传输敏感信息
3. 设置适当的授权域和重定向URI
4. 定期轮换Client Secret

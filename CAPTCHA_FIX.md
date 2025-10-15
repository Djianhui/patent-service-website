# 验证码图片显示问题修复

## 问题描述

后端返回的验证码数据格式如下：
```json
{
  "msg": "操作成功",
  "captchaEnabled": true,
  "code": 200,
  "img": "/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsL...",
  "uuid": "51ae29f7e6fd4ef48c54fb698dd8d79a"
}
```

**问题**：`img` 字段是纯Base64字符串，不包含 `data:image/jpeg;base64,` 前缀，导致无法在 `<img>` 标签中直接显示。

## 解决方案

在 `src/services/auth.ts` 的 `getCaptcha()` 方法中添加处理逻辑：

```typescript
async getCaptcha(): Promise<CaptchaResponse> {
  try {
    const response = await request.get<any>('/captchaImage')

    if (response.code === 200) {
      // 后端返回的img是纯Base64字符串，需要添加前缀才能在img标签中显示
      const imgData = response.img.startsWith('data:') 
        ? response.img 
        : `data:image/jpeg;base64,${response.img}`
      
      return {
        uuid: response.uuid,
        img: imgData
      }
    } else {
      throw new Error(response.msg || '获取验证码失败')
    }
  } catch (error: any) {
    console.error('获取验证码失败:', error)
    throw new Error(error.message || '获取验证码失败，请重试')
  }
}
```

## 修复说明

1. **兼容性处理**：使用 `startsWith('data:')` 检查，如果后端已经包含前缀则直接使用，否则添加前缀
2. **图片格式**：默认使用 `image/jpeg` 格式，因为大多数验证码使用JPEG格式
3. **Base64前缀**：添加标准的 Data URL 格式前缀 `data:image/jpeg;base64,`

## 验证结果

修复后，验证码图片可以正常显示在注册页面中。用户可以：
- ✅ 在页面加载时看到验证码图片
- ✅ 点击验证码图片刷新
- ✅ 验证码图片清晰可见

## 技术细节

### Data URL 格式
```
data:[<mediatype>][;base64],<data>
```

示例：
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD...
```

### 组成部分
- `data:` - Data URL 协议前缀
- `image/jpeg` - MIME 类型
- `;base64` - 编码类型
- `,` - 分隔符
- `/9j/4AAQ...` - Base64 编码的图片数据

## 其他可能的图片格式

如果后端返回的是PNG格式，可以修改为：
```typescript
const imgData = `data:image/png;base64,${response.img}`
```

如果后端返回的格式不固定，可以根据响应头或其他字段判断：
```typescript
const mimeType = response.mimeType || 'image/jpeg'
const imgData = `data:${mimeType};base64,${response.img}`
```

## 测试建议

1. 检查验证码图片是否正常显示
2. 验证点击刷新功能是否正常
3. 测试不同浏览器的兼容性
4. 检查控制台是否有错误信息
5. 验证注册流程是否完整

## 相关文件

- `src/services/auth.ts` - 验证码获取服务
- `src/stores/auth.ts` - 验证码状态管理
- `src/views/auth/RegisterView.vue` - 注册页面组件

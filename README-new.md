# 专利服务网站

## 项目简介

专利服务网站是一个基于Vue3技术栈的现代化专利服务平台，为用户提供从专利检索、技术方案分析到专利撰写和答辩支持的全流程专业服务。

## 核心功能

### 🔍 专利检索
- 快速检索：支持关键词、发明人、申请人等多种检索方式
- 高级检索：提供复杂条件组合检索
- 检索历史：保存和管理检索记录
- 专利收藏：收藏感兴趣的专利文献

### 📊 技术方案报告
- 智能分析：基于AI的技术方案自动分析
- 文件上传：支持多种格式技术文档上传
- 报告生成：自动生成专业的技术分析报告
- 报告管理：历史报告查看和下载

### 🎯 三性分析
- 新颖性分析：评估技术方案的新颖性
- 创造性分析：分析技术方案的创造性水平
- 实用性分析：评估技术方案的实用性
- 综合评估：提供整体评分和建议

### ✍️ 专利撰写
- 撰写向导：步骤化的专利撰写流程
- 模板管理：多种专利类型模板
- 实时预览：撰写过程中实时预览效果
- 草稿保存：支持草稿保存和继续编辑

### 🛡️ 答辩支持
- 案例管理：管理专利答辩案例
- 模拟审查：模拟专利审查过程
- 答辩策略：提供专业的答辩策略建议
- 文档生成：自动生成答辩文档

## 技术栈

### 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 现代化的构建工具

### 状态管理
- **Pinia** - Vue 3推荐的状态管理库

### UI组件库
- **Element Plus** - 基于Vue 3的组件库
- **@element-plus/icons-vue** - Element Plus图标库

### 路由管理
- **Vue Router 4** - Vue.js官方路由管理器

### HTTP客户端
- **Axios** - Promise基的HTTP库

### 样式处理
- **SCSS** - CSS预处理器
- **CSS Variables** - 原生CSS变量系统

### 数据可视化
- **ECharts** - 企业级图表库

### 富文本编辑
- **Quill** - 现代化的富文本编辑器

### 测试框架
- **Vitest** - 基于Vite的测试框架
- **@vue/test-utils** - Vue组件测试工具
- **jsdom** - DOM环境模拟

## 项目结构

```
src/
├── assets/          # 静态资源
│   ├── images/      # 图片资源
│   └── styles/      # 样式文件
├── components/      # 通用组件
├── composables/     # 组合式函数
├── layouts/         # 布局组件
├── router/          # 路由配置
├── services/        # API服务
├── stores/          # 状态管理
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
├── views/           # 页面组件
│   ├── auth/        # 认证相关页面
│   ├── tech-report/ # 技术方案报告页面
│   ├── patent-search/ # 专利检索页面
│   ├── three-analysis/ # 三性分析页面
│   ├── patent-draft/ # 专利撰写页面
│   └── defense-support/ # 答辩支持页面
├── App.vue          # 根组件
└── main.ts          # 入口文件
```

## 开发指南

### 环境要求

- Node.js >= 20.19.0
- npm >= 10.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将运行在 http://localhost:5180

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 测试

### 运行测试

```bash
npm run test
```

### 运行测试（单次）

```bash
npm run test:run
```

### 测试UI界面

```bash
npm run test:ui
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

## 设计特色

### 🎨 现代化设计
- 采用简洁的设计语言
- 统一的色彩系统和间距规范
- 响应式布局，支持多设备访问

### 🚀 性能优化
- 基于Vite的快速构建
- 组件懒加载
- 代码分割优化

### 🔧 开发体验
- TypeScript类型安全
- 完善的ESLint和Prettier配置
- 热模块替换(HMR)
- Vue DevTools支持

### 🧪 质量保证
- 完整的单元测试
- 组件测试覆盖
- 持续集成支持

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 版本历史

### v1.0.0
- ✨ 初始版本发布
- 🎯 完整的专利服务功能
- 🔍 专利检索和分析功能
- ✍️ 专利撰写和答辩支持
- 🧪 完整的测试覆盖

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: support@patent-service.com
- 问题反馈: [GitHub Issues](https://github.com/your-org/patent-service/issues)

---

**专利服务网站** - 专业的专利服务解决方案 © 2024
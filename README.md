# Flomo Clipper

一个简单好用的 Chrome 扩展，帮助你快速将网页内容同步到 Flomo。

## 功能特点

- 🚀 一键唤起/收起侧边栏
- 📝 自动获取页面标题和链接
- 📌 支持复制原文摘要
- 💭 添加个人感想
- 🔄 一键同步到 Flomo

## 安装方法

1. 下载本项目代码
2. 打开 Chrome 浏览器，进入扩展程序页面（chrome://extensions/）
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹即可

## 使用说明

1. 在任意网页点击工具栏中的 Flomo Clipper 图标
2. 在右侧弹出的侧边栏中：
   - 标题和链接会自动填充
   - 可以复制粘贴原文摘要
   - 可以输入个人感想
3. 点击"提交到 Flomo"按钮即可同步内容

### 使用限制
- 插件在 Flomo 的编辑页面不可用
- 仅支持正常的网页内容
- 不支持浏览器特殊页面（如新标签页）

## 版本历史

### 0.1.2
- ✨ 新增AI总结功能，支持一键生成网页内容摘要
- 🎨 优化输入框自适应效果，更流畅的高度调整
- 💄 改进UI样式，优化按钮和输入框的视觉效果
- 🐛 修复Edge浏览器下提交按钮可能不可见的问题
- ⚡️ 优化输入框性能，添加平滑过渡效果

### 0.1.1
- 🐛 修复页面刷新后需要点击两次的问题
- ✨ 优化错误提示机制
- 🔧 完善页面加载状态检查
- 💄 优化提交内容格式

### 0.1.0
- ✨ 首次发布
- 🎨 支持侧边栏展示
- 📋 支持复制摘要和添加感想
- 🔗 支持一键同步到 Flomo
- 🛡️ 添加域名限制和错误处理

## API配置

### DeepSeek API
本项目使用DeepSeek API来实现AI总结功能。

- API文档：https://api-docs.deepseek.com/zh-cn/
- 使用模型：deepseek-chat
- API Key: 请在项目根目录下创建 `.env` 文件，添加以下内容：
  ```
  DEEPSEEK_API_KEY=your_api_key_here
  ```
  注意：不要直接在代码中硬编码API Key

### Flomo API
- API文档：https://v.flomoapp.com/mine?source=incoming_webhook
- Webhook地址：https://flomoapp.com/iwh/ODcyOTY/8ed3b45bc8b3e51b9d02234f876acf51/

## 技术栈

- Chrome Extension API
- JavaScript
- CSS3

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License 
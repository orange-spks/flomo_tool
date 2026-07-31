# Flomo Clipper

一个简单好用的 Chrome 扩展，帮助你快速将网页内容同步到 Flomo。

## 功能特点

- 🚀 一键唤起/收起侧边栏
- 📝 自动获取页面标题和链接
- 🎨 **富文本编辑**：支持加粗、下划线、高亮、列表等格式
- 📌 支持复制原文摘要
- 💭 添加个人感想
- 🖼️ **图片上传**：支持粘贴上传和点击上传
- 🤖 AI 自动总结网页内容
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

### 富文本编辑功能

编辑器支持以下格式：

| 功能 | 快捷键 | 工具栏 |
|------|--------|--------|
| 加粗 | `Ctrl+B` | B |
| 下划线 | `Ctrl+U` | U |
| 高亮 | - | 🖍 |
| 无序列表 | - | ☰ |
| 有序列表 | - | 1. |
| 图片上传 | 粘贴或点击 + | + |

- **浮动工具栏**：选中文本时自动出现，可快速设置格式
- **固定工具栏**：位于每个编辑器底部，始终可见
- **图片上传**：支持直接粘贴图片，或点击 + 按钮选择图片

### 使用限制
- 插件在 Flomo 的编辑页面不可用
- 仅支持正常的网页内容
- 不支持浏览器特殊页面（如新标签页）

## 版本历史

### 0.1.3
- ✨ 新增富文本编辑器，支持加粗、下划线、高亮、列表等格式
- 🖼️ 支持图片上传（粘贴上传和点击上传）
- ⌨️ 支持快捷键操作（Ctrl+B 加粗、Ctrl+U 下划线等）
- 🔧 浮动工具栏：选中文本时自动显示格式按钮
- 📝 优化输出到 Flomo 的格式模板

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

### DeepSeek API（密钥本地存储）
本项目使用 DeepSeek API 来实现 AI 总结功能。

- API文档：https://api-docs.deepseek.com/zh-cn/
- 使用模型：deepseek-chat
- API Key 配置：打开侧边栏 → 点击「⚙️ 设置」→ 在「DeepSeek API Key」处填写你的 API Key → 点击「保存 API Key」
- 密钥仅存于本机 Chrome 本地存储（`chrome.storage.local`），不会随代码泄露

### Flomo API（密钥不明文写入代码）
- API 文档：https://v.flomoapp.com/mine?source=incoming_webhook
- Webhook 地址**不写在代码里**，仅在扩展内通过「Flomo Webhook 设置」填写并保存，密钥仅存于本机 Chrome 本地存储（`chrome.storage.local`），不会随代码泄露。
- 使用步骤：打开侧边栏 → 点击「⚙️ 设置」→ 粘贴你的 incoming webhook 地址（形如 `https://flomoapp.com/iwh/xxx/xxx/`）→ 点击「保存 Webhook」。

## 辅助阅读（多模型支持）

辅助阅读功能支持切换 **火山引擎 Ark**、**DeepSeek**、**智谱 GLM**。在扩展里通过 Chrome 本地存储选择模型与填写对应 API Key。

### 在扩展中切换模型

在任意页面打开开发者工具 → Console，执行：

```javascript
// 使用智谱（需先设置智谱 API Key）
chrome.storage.local.set({ HELP_READ_PROVIDER: 'zhipu', ZHIPU_API_KEY: '你的智谱API Key' });

// 使用 DeepSeek
chrome.storage.local.set({ HELP_READ_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: '你的DeepSeek Key' });

// 使用火山引擎 Ark（默认）
chrome.storage.local.set({ HELP_READ_PROVIDER: 'ark', ARK_API_KEY: '你的Ark Key' });
```

智谱 API Key 获取：<https://open.bigmodel.cn/>，模型使用 `glm-4-flash`。

## 辅助阅读 E2E 测试（指定文章）

用指定文章 URL 跑完整流程（抓取正文 → 调用大模型 → 解析 → 生成 HTML）：

```bash
# 仅抓取正文并生成示例 HTML（不调 API）
node test_help_read_e2e.js

# 完整流程（任选其一 Key，优先 Ark → DeepSeek → 智谱）
ARK_API_KEY=你的key node test_help_read_e2e.js
ZHIPU_API_KEY=你的key node test_help_read_e2e.js
DEEPSEEK_API_KEY=你的key node test_help_read_e2e.js
```

脚本默认使用文章：<https://www.aitntnews.com/newDetail.html?newId=22115>  
结果会写入项目根目录下的 `test_help_read_result.html`，用浏览器打开即可查看辅助阅读渲染效果。

## 技术栈

- Chrome Extension API
- JavaScript
- CSS3

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License 
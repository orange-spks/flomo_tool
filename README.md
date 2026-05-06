# Flomo Clipper

一键将网页内容同步到 Flomo 的 Chrome 浏览器扩展。

## 功能特性

- 🚀 **一键唤起侧边栏**：点击扩展图标，在当前页面右侧弹出编辑面板
- 📝 **自动获取页面信息**：自动提取当前页面标题和链接
- ✨ **富文本编辑**：支持加粗、高亮、无序/有序列表、下划线等格式
- 🤖 **AI 自动总结**：支持 DeepSeek、硅基流动、Kimi、Qwen 等任意 OpenAI 兼容格式平台
- 🖼️ **图片处理**：编辑器支持图片展示（粘贴上传入口当前隐藏，等待 Flomo 支持）
- 🔒 **配置本地存储**：Webhook 地址和 API Key 均保存在浏览器本地，不上传服务器

## 安装方法

1. 下载本项目代码
2. 打开 Chrome 扩展管理页面（`chrome://extensions/`）
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"，选择本项目根目录

## 配置说明

### 1. Flomo Webhook 地址

1. 打开 Flomo 网页版 → 设置 → API 与第三方应用
2. 复制 "Incoming Webhook" 地址
3. 在扩展侧边栏的「设置」中粘贴并保存

### 2. AI 模型配置（用于 AI 总结功能）

在扩展侧边栏的「设置」中配置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| API Base URL | 大模型 API 的基础地址 | `https://api.deepseek.com` |
| 模型名称 | 要调用的模型 ID | `deepseek-v4` |
| API Key | 你的 API 密钥 | `sk-xxxxxxxx` |

**支持的默认平台**（已在 manifest 中授权）：
- DeepSeek: `https://api.deepseek.com`
- 硅基流动: `https://api.siliconflow.cn`
- Kimi (Moonshot): `https://api.moonshot.cn`
- Qwen (DashScope): `https://dashscope.aliyuncs.com`

若使用其他平台，需在 `chrome://extensions` → 扩展详情 → 站点访问权限中手动添加对应域名。

## 版本历史

### v0.1.3
- 重构：彻底清理辅助阅读冗余代码
- 升级：AI 总结支持通用 OpenAI 格式多模型配置
- 调整：前端隐藏图片上传入口（Flomo Webhook 暂不支持 Base64 图片）

### v0.1.2
- 修复提交后侧边栏无法关闭的问题
- 修复 Flomo 内容格式渲染不完整的问题
- 添加 `content_type: "markdown"` 参数确保格式正确解析

# flomo 随记（flomo Memo）

一键将网页内容同步到 Flomo 的 Chrome 浏览器扩展。本扩展为第三方工具，与 flomo 官方无关。

## 功能特性

- 🚀 **一键唤起侧边栏**：点击扩展图标，在当前页面右侧弹出编辑面板
- 📝 **自动获取页面信息**：自动提取当前页面标题和链接
- ✨ **富文本编辑**：支持加粗、无序/有序列表（下划线、高亮因 Flomo 不支持已禁用）
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
| API Base URL | 大模型 API 的基础地址 | `https://api.deepseek.com` 或 `https://api.siliconflow.cn/v1` |
| 模型名称 | 要调用的模型 ID | `deepseek-chat` / `deepseek-ai/DeepSeek-V3` |
| API Key | 你的 API 密钥 | `sk-xxxxxxxx` |

**各平台配置示例**：

| 平台 | Base URL | 模型示例 |
|------|----------|----------|
| DeepSeek | `https://api.deepseek.com` | `deepseek-chat` |
| 硅基流动 | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3` |
| Kimi (Moonshot) | `https://api.moonshot.cn` | `moonshot-v1-8k` |
| Qwen (DashScope) | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` |

> 注意：硅基流动的模型 ID 必须带厂商前缀，如 `deepseek-ai/DeepSeek-V3`，不能简写为 `DeepSeek-V3`。

若使用其他平台，需在 `chrome://extensions` → 扩展详情 → 站点访问权限中手动添加对应域名。

## 打包与上架

```bash
bash build.sh          # macOS / Linux
powershell -ExecutionPolicy Bypass -File build.ps1   # Windows
```

产物：

| 路径 | 用途 |
|------|------|
| `dist/flomo-memo-v1.0.0.zip` | 直接上传 Chrome Web Store / Edge Add-ons |
| `dist/unpacked/` | 在 `chrome://extensions` 里「加载已解压的扩展程序」做验收 |

打包脚本会依次做：manifest 校验（含引用文件、`_locales`、`web_accessible_resources` 是否存在）→ 硬编码密钥扫描 → 白名单收集（`manifest.json` / `scripts` / `images` / `_locales`）→ 压缩。

上架相关的全部材料在 [`docs/store/`](docs/store/README.md)：商店文案（中英）、截图与宣传图、权限说明、审核备注、逐步提交指南。

## 版本历史

### v1.0.0
- 上架商店首个正式版：扩展定名「flomo 随记」（英文：flomo Memo），通过 `_locales` 支持中英文名称
  （商店标题直接取 manifest 的 `name`，改 `_locales/*/messages.json` 的 `appName` 后需重新打包）
- 新增设置面板打赏区（微信/支付宝收款码，图片缺失时自动隐藏）
- 安全自查：全仓库无硬编码 API Key / Webhook Token，商店 zip 仅含运行时文件

### v0.1.4
- 调整：禁用富文本编辑器中的「下划线」和「高亮」按钮（Flomo Webhook 不支持这些格式）
- 调整：下划线 fallback 从斜体改为加粗，确保至少保留强调语义
- 文档：更新 README 和 FUNCTIONAL_DESIGN.md，反映当前富文本格式支持范围

### v0.1.3
- 重构：彻底清理辅助阅读冗余代码
- 升级：AI 总结支持通用 OpenAI 格式多模型配置
- 调整：前端隐藏图片上传入口（Flomo Webhook 暂不支持 Base64 图片）
- 修复：`htmlToMarkdown` 段落分隔问题，确保文本与块元素正确换行
- 修复：高亮/下划线 fallback 到标准 Markdown（Flomo 不支持 `==高亮==` 和 `<u>` 标签）

### v0.1.2
- 修复提交后侧边栏无法关闭的问题
- 修复 Flomo 内容格式渲染不完整的问题
- 添加 `content_type: "markdown"` 参数确保格式正确解析

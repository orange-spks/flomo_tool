# Flomo Clipper 重构设计文档

## 日期
2026-05-06

## 背景

Flomo Clipper 是一个 Chrome 扩展（Manifest V3），用于将网页内容同步到 Flomo 笔记。当前代码存在以下问题：

1. **历史代码冗余**：早期"辅助阅读"功能已注释停用，但代码块仍保留在 `background.js`（~320行）和 `content.js`（~60行）中，造成仓库上下文臃肿
2. **模型硬编码**：AI 总结功能仅支持 DeepSeek，且模型名称 `deepseek-chat` 已过时，需升级到 `deepseek-v4`
3. **图片上传不可行**：Flomo Webhook 不支持 Base64 图片传递，前端应暂时隐藏上传入口
4. **文档滞后**：README 未反映当前多模型支持的能力

## 目标

1. 彻底去除辅助阅读冗余代码，使仓库上下文干净
2. 将 AI 总结升级为通用 OpenAI 格式，支持用户配置任意大模型平台
3. 前端隐藏图片上传入口（后端代码保留并加注释）
4. 同步更新 README.md 和项目文档

---

## 第1节：去除辅助阅读冗余代码

### 改动范围

| 文件 | 操作 | 说明 |
|------|------|------|
| `scripts/background.js` | 删除第103-422行 | 被注释的辅助阅读代码块（含多模型并发、流式传输、重试逻辑、ConcurrencyLimiter 等） |
| `scripts/content.js` | 删除第1406-1468行 | 被注释的辅助阅读代码块（状态管理、DOM 注入、进度显示、流式渲染等） |
| `manifest.json` | 移除 `prompt_help_read.txt` | `web_accessible_resources` 中不再引用该文件 |

### 影响评估

- **运行时**：零影响，这些代码已被注释停用
- **文件大小**：`background.js` 从 ~422 行缩减到 ~102 行，`content.js` 从 ~2100 行缩减到 ~2040 行

---

## 第2节：多模型支持与 DeepSeek 模型升级

### 核心设计：通用 OpenAI 格式

替换原来硬编码的 DeepSeek 调用，改为从 `chrome.storage.local` 读取三项配置：

| 配置项 | Storage Key | 示例值 |
|--------|-------------|--------|
| API Base URL | `AI_API_BASE_URL` | `https://api.deepseek.com` |
| 模型名称 | `AI_MODEL` | `deepseek-v4` |
| API Key | `AI_API_KEY` | `sk-xxxxxxxx` |

### 统一调用逻辑

所有平台统一使用 OpenAI 兼容的 `/chat/completions` 接口：

```
POST ${baseUrl}/chat/completions
Headers: Authorization: Bearer ${apiKey}
Body: { model, messages: [{role, content}], stream: false }
```

### 向后兼容：自动迁移旧配置

首次加载时检测旧配置 `DEEPSEEK_API_KEY`：
- 若存在且新配置 `AI_API_KEY` 为空，则自动迁移：
  - `AI_API_BASE_URL` = `https://api.deepseek.com`
  - `AI_MODEL` = `deepseek-v4`（新默认值）
  - `AI_API_KEY` = 旧 `DEEPSEEK_API_KEY` 的值
  - 迁移完成后删除旧 `DEEPSEEK_API_KEY`

### 未配置时的提示

若用户未配置任何模型，点击"AI总结"按钮时提示："请先在设置中配置 AI 模型（API Base URL、模型名称、API Key）"，并自动展开设置面板。

### 设置面板 UI 调整

原"DeepSeek API Key"区域改为"AI 模型配置"区域：

```
🤖 AI 模型配置
├─ API Base URL  [url输入框]  placeholder: https://api.deepseek.com
├─ 模型名称      [文本输入框]  placeholder: deepseek-v4
└─ API Key       [password输入框]  placeholder: sk-xxxxxxxx
         [保存配置]
```

保存逻辑：每个字段独立保存/清除。点击"保存配置"时，对三个字段分别处理——值为空则清除对应 storage key，有值则保存。不需要三个字段同时填写。

### Host Permissions 处理

Manifest V3 的 `host_permissions` 不支持通配所有域名。策略：

- 保留常用平台的 host_permissions：
  - `https://*.flomoapp.com/*`
  - `https://api.deepseek.com/*`
  - `https://api.siliconflow.cn/*`
  - `https://api.moonshot.cn/*`
  - `https://dashscope.aliyuncs.com/*`
- 在 README 中说明：若使用其他平台，需在 `chrome://extensions` → 扩展详情 → 站点访问权限中手动添加对应域名

---

## 第3节：隐藏图片上传入口

### 改动范围

| 位置 | 操作 | 说明 |
|------|------|------|
| HTML 模板（`createSidebar`） | 移除两个 `+` 按钮 | 从摘要和感想编辑器的工具栏中移除 `.upload-btn` |
| `handlePaste` | 添加开关常量 | `const ENABLE_IMAGE_UPLOAD = false;` 为 false 时图片粘贴不拦截，走默认粘贴行为 |
| CSS | 保留 | `.image-preview`、`.image-thumb` 等样式保留，以备将来恢复 |
| 后端函数 | 保留并加注释 | `triggerImageUpload`、`compressImage`、`uploadImage`、`insertImage`、图片转 Markdown 逻辑全部保留，顶部添加注释说明当前未启用 |

### 保留代码的注释规范

在图片相关函数区域顶部添加统一注释：

```javascript
// ============================================================
// 图片上传功能（当前已禁用）
// 原因：Flomo Webhook 暂不支持 Base64 图片传递
// 前端上传入口已隐藏（ENABLE_IMAGE_UPLOAD = false）
// 以下代码保留，以便未来 Flomo 支持图片时快速恢复
// ============================================================
```

---

## 第4节：文档更新

### README.md 更新内容

1. **功能列表**：更新 AI 总结为"支持 DeepSeek、硅基流动、Kimi、Qwen 等任意 OpenAI 兼容格式平台"
2. **配置说明**：新增"AI 模型配置"章节，说明三项配置的含义和示例
3. **已知限制**：说明图片上传功能当前不可用
4. **版本号**：manifest.json 同步更新到 `0.1.3`

### CLAUDE.md（项目级）更新

- 移除技术债务项"辅助阅读功能已注释停用"
- 新增决策记录：
  - 2026-05-06：AI 总结改为通用 OpenAI 格式，支持多模型配置
  - 2026-05-06：图片上传功能前端隐藏，后端代码保留

---

## 文件改动清单

| 文件 | 改动类型 |
|------|----------|
| `scripts/background.js` | 删除辅助阅读代码块 |
| `scripts/content.js` | 删除辅助阅读代码块、修改 AI 调用逻辑、修改设置面板 UI、隐藏图片上传按钮、添加图片保留注释 |
| `manifest.json` | 移除 `prompt_help_read.txt`、更新 host_permissions、更新版本号 |
| `README.md` | 更新功能说明和配置文档 |
| `CLAUDE.md` | 更新技术债务和决策记录 |

---

## 风险与回退

| 风险 | 缓解措施 |
|------|----------|
| 误删非辅助阅读代码 | 删除前确认代码块完全在 `/* ... */` 注释内 |
| 旧配置迁移异常 | 迁移逻辑使用 try-catch 包裹，失败不影响主流程 |
| 多模型 fetch 跨域失败 | 保留常用平台 host_permissions，文档说明手动授权方法 |
| 图片功能未来恢复困难 | 后端代码完整保留并加注释，只需改一个常量和 HTML |

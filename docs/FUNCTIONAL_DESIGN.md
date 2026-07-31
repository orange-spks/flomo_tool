# Flomo Clipper - 功能设计文档

> 本文档用于梳理项目功能目标与特性设计，作为后续技术重构的参考依据，确保不遗漏重要功能。

---

## 一、项目概述

**Flomo Clipper** 是一个 Chrome 浏览器扩展，核心目标是帮助用户快速将网页内容（包括标题、链接、摘要、感想、图片）一键同步到 Flomo 笔记服务。

### 1.1 核心定位
- **产品类型**: Chrome Extension (Manifest V3)
- **目标用户**: 经常使用 Flomo 记录网页内容的用户
- **核心价值**: 降低从网页到笔记的 friction，支持富文本编辑和 AI 辅助

### 1.2 版本信息
- 当前版本: `0.1.3`
- Manifest 版本: V3

---

## 二、功能目标

### 2.1 主要功能

| 优先级 | 功能 | 描述 | 状态 |
|--------|------|------|------|
| P0 | 侧边栏唤起 | 点击扩展图标，在页面右侧弹出侧边栏 | ✅ 已实现 |
| P0 | 自动填充 | 自动获取当前页面标题和链接 | ✅ 已实现 |
| P0 | 富文本编辑 | 支持加粗、下划线、高亮、列表等格式 | ✅ 已实现 |
| P0 | 图片上传 | 支持粘贴上传和点击上传，Base64 存储 | ✅ 已实现 |
| P0 | Flomo 同步 | 通过 Webhook 将内容提交到 Flomo | ✅ 已实现 |
| P1 | AI 总结 | 调用 DeepSeek API 自动生成网页摘要 | ✅ 已实现 |
| P2 | 辅助阅读 | 逐段分析文章，标注句子类型（已停用） | ⚠️ 已注释 |
| P2 | 多模型支持 | 支持 Ark/DeepSeek/智谱 GLM 切换 | ⚠️ 辅助阅读已停用 |

### 2.2 功能边界

**支持场景**:
- 普通网页内容采集
- 富文本格式编辑
- 图片 Base64 嵌入

**不支持场景**:
- Chrome 内置页面（chrome://, edge://）
- Flomo 编辑页面（flomoapp.com/mine, /edit）
- 新标签页/空白页
- iframe 内部内容

---

## 三、特性设计详解

### 3.1 侧边栏系统

#### 3.1.1 架构设计
```
页面注入
  ↓
创建 Shadow DOM 宿主 (#flomo-sidebar-host)
  ↓
注入样式 (SHADOW_STYLE) + 侧边栏 DOM
  ↓
初始化功能模块
```

#### 3.1.2 技术特性
| 特性 | 实现方式 | 说明 |
|------|----------|------|
| 样式隔离 | Shadow DOM + `all: initial` | 防止页面样式污染 |
| 最高层级 | `z-index: 2147483647` | 确保在最上层显示 |
| 滚动隔离 | `wheel`/`touchmove` 事件拦截 | 侧边栏滚动不影响页面 |
| 点击外部关闭 | `document.addEventListener('click')` | 点击非侧边栏区域自动收起 |
| 平滑动画 | CSS transition | 高度调整、按钮交互有平滑过渡 |

#### 3.1.3 布局结构
```
.flomo-sidebar (固定 400px 宽度，100vh 高度)
├── .close-btn (关闭按钮，X 图标)
└── .sidebar-container
    ├── .input-sections (可滚动区域)
    │   ├── 标题输入框
    │   ├── 链接显示框 (只读)
    │   ├── 原文摘要编辑器 (富文本 + AI总结按钮)
    │   ├── 个人感想编辑器 (富文本)
    │   └── Flomo Webhook 设置面板 (可折叠)
    └── .button-section (固定底部)
        ├── 提交按钮
        └── 消息提示区
```

---

### 3.2 富文本编辑器

#### 3.2.1 支持的格式
| 格式 | 快捷键 | 工具栏 | HTML 标签 | Markdown 转换 |
|------|--------|--------|-----------|---------------|
| 加粗 | Ctrl+B | B | `<b>`/`<strong>` | `**text**` |
| 下划线 | Ctrl+U | U | `<u>` | `<u>text</u>` |
| 高亮 | - | 🖍 | `<mark>`/`<span style="background-color">` | `==text==` |
| 无序列表 | - | ☰ | `<ul>`/`<li>` | `- item` |
| 有序列表 | - | 1. | `<ol>`/`<li>` | `1. item` |
| 斜体 | Ctrl+I | - | `<i>`/`<em>` | `*text*` |

#### 3.2.2 工具栏设计
- **固定工具栏**: 位于每个编辑器底部，始终可见
- **浮动工具栏**: 选中文本时在选中区域上方/下方弹出
- **智能位置**: 根据选中区域位置自动调整显示位置（上方空间不足时显示在下方）

#### 3.2.3 格式延续控制
- Enter 键自动清除当前段落格式（防止格式延续到新段落）
- 使用 `setTimeout` 在浏览器处理完 Enter 后执行格式清除

---

### 3.3 图片上传系统

#### 3.3.1 上传方式
| 方式 | 触发方式 | 实现 |
|------|----------|------|
| 粘贴上传 | Ctrl+V 在编辑器内 | `paste` 事件监听 |
| 点击上传 | 工具栏 + 按钮 | 隐藏 `<input type="file">` 触发 |

#### 3.3.2 图片处理流程
```
用户粘贴/选择图片
  ↓
FileReader 读取为 Base64 Data URL
  ↓
插入到编辑器光标位置
  ↓
自动调整编辑器高度
```

#### 3.3.3 图片限制
- 格式: 通过 `accept="image/*"` 限制
- 大小: 无明确限制（依赖 Flomo Webhook 接受能力）
- 存储: Base64 内嵌，随 Markdown 一起提交

---

### 3.4 AI 总结功能

#### 3.4.1 实现架构
```
用户点击 "AI总结" 按钮
  ↓
提取页面正文 (extractArticleByDensity)
  ↓
调用 DeepSeek API (deepseek-chat 模型)
  ↓
解析返回内容
  ↓
填充到摘要编辑器
```

#### 3.4.2 正文提取算法
| 策略 | 优先级 | 说明 |
|------|--------|------|
| 语义化标签 | 1 | `article`, `main`, `[role="main"]` 等 |
| 类名匹配 | 2 | `.post-content`, `.article-content`, `.entry-content` 等 |
| 文本密度算法 | 3 | 遍历 `<p>`, `<div>`, `<section>`，计算文本长度 - 链接长度×2 |
| TreeWalker | 4 | 遍历所有文本节点，过滤噪声元素 |

#### 3.4.3 AI Prompt 设计
- **角色设定**: 专业网页内容总结助手
- **分类技能**: 通用/科技/商业/新闻/教程/产品介绍/首页 7 类文章类型
- **输出限制**: 总结不超过 200 字，关键词不超过 8 个
- **输出格式**: 关键词 + 总结

---

### 3.5 Flomo 同步系统

#### 3.5.1 数据格式
```markdown
#书摘文摘/网页摘录
💭感想：[用户输入的感想]
📌摘要：[用户输入的摘要]

📝原文：《[页面标题]》
🔗链接：[页面URL]
```

#### 3.5.2 Webhook 配置
- **存储位置**: `chrome.storage.local`
- **Key**: `FLOMO_WEBHOOK_URL`
- **安全性**: 密钥仅存于本地，不写入代码
- **验证**: 必须以 `https://flomoapp.com/iwh/` 开头

#### 3.5.3 错误处理
| 场景 | 处理方式 |
|------|----------|
| 未配置 Webhook | 展开设置面板，提示用户填写 |
| 网络错误 | Toast 提示 "保存失败：error message" |
| HTTP 错误 | Toast 提示 "保存失败：statusText" |
| 成功 | Toast 提示 "笔记已保存到 Flomo"，清空输入框 |

---

### 3.6 辅助阅读功能（已停用）

> ⚠️ 该功能在代码中已被注释，但架构完整，可供参考

#### 3.6.1 设计目标
对长文章进行逐段分析，标注句子类型（观点/事实/建议/疑问/其他），并给出段落总结。

#### 3.6.2 技术架构
```
抓取正文 → 分片（按 2000 字符或段落）→ 并发请求（最多 3 个）→
合并结果 → 注入样式 → 渲染结构化视图
```

#### 3.6.3 多模型支持
| 提供商 | 模型 | 配置 Key |
|--------|------|----------|
| 火山引擎 Ark | ep-20260201233119-8vf6f | `ARK_API_KEY` |
| DeepSeek | deepseek-chat | `DEEPSEEK_API_KEY` |
| 智谱 GLM | glm-4-flash | `ZHIPU_API_KEY` |

#### 3.6.4 并发控制
- 使用 `ConcurrencyLimiter` 类控制并发数（默认 3）
- 支持流式进度反馈（`helpReadProgress` 消息）
- 超时 30 秒，最大重试 2 次

---

### 3.7 后台脚本 (Background Script)

#### 3.7.1 职责
| 功能 | 说明 |
|------|------|
| 标签页状态跟踪 | 记录已注入 content script 的标签页 |
| 页面加载检测 | 监听 `onUpdated`，检查 `status === 'loading'` 重置状态 |
| 脚本注入 | 动态注入 `content.js` 和 `sidebar.css` |
| 消息转发 | 接收 `toggleSidebar` 消息并转发给 content script |
| 图标状态 | 在特殊页面显示警告徽章 |

#### 3.7.2 注入状态管理
```javascript
// 使用 injectedTabs 对象跟踪
let injectedTabs = {};

// 页面加载时重置
tabs.onUpdated → status === 'loading' → delete injectedTabs[tabId]

// 成功注入后标记
injectedTabs[tabId] = true;

// 标签页关闭清理
tabs.onRemoved → delete injectedTabs[tabId]
```

---

## 四、安全与隐私设计

### 4.1 API Key 管理
| Key 类型 | 存储位置 | 说明 |
|----------|----------|------|
| DeepSeek API Key | Chrome Storage | `DEEPSEEK_API_KEY` 用户配置 |
| Ark API Key | `.env` / Chrome Storage | 用户自行配置 |
| 智谱 API Key | Chrome Storage | 用户自行配置 |
| Flomo Webhook | Chrome Storage | 用户通过 UI 配置 |

### 4.2 权限设计
```json
{
  "permissions": [
    "activeTab",      // 访问当前标签页
    "scripting",      // 执行脚本
    "tabs",           // 管理标签页
    "notifications",  // 显示通知
    "storage"         // 本地存储
  ],
  "host_permissions": [
    "https://*.flomoapp.com/*",
    "https://flomoapp.com/*",
    "https://api.deepseek.com/*",
    "https://ark.cn-beijing.volces.com/*",
    "https://open.bigmodel.cn/*"
  ]
}
```

### 4.3 数据流
```
页面内容 → 本地提取 → 本地编辑器 → Flomo Webhook
                    ↓
              DeepSeek API (仅用于 AI 总结)
```
- 用户输入内容仅发送到 Flomo 官方服务
- 网页内容仅在本地处理，AI 总结时发送到 DeepSeek

---

## 五、UI/UX 设计规范

### 5.1 视觉风格
| 元素 | 规范 |
|------|------|
| 主色调 | `rgb(48, 207, 121)` (Flomo 绿) |
| 字体 | 系统字体栈 `-apple-system, BlinkMacSystemFont, ...` |
| 圆角 | 6px 为主，按钮/输入框统一 |
| 阴影 | 侧边栏 `-2px 0 8px rgba(0,0,0,0.15)` |
| 过渡动画 | `0.2s ease` 统一 |

### 5.2 交互规范
| 操作 | 反馈 |
|------|------|
| 点击扩展图标 | 侧边栏滑入/滑出 |
| 点击关闭按钮 | 侧边栏收起 |
| 点击外部区域 | 侧边栏收起 |
| 提交成功 | Toast 提示 + 清空输入 |
| 提交失败 | 错误提示（侧边栏内或 Toast）|
| Webhook 保存成功 | 绿色提示 "Webhook 地址已保存" |

### 5.3 响应式设计
- 侧边栏固定宽度 400px
- 高度自适应 100vh / 100dvh
- 内部区域 `flex: 1` 自动填充剩余空间
- 输入区域超出时显示滚动条

---

## 六、待改进点

### 6.1 技术债务
| 问题 | 影响 | 建议方案 |
|------|------|----------|
| ~~DeepSeek API Key 硬编码~~ | ~~安全风险~~ | ✅ 已改为用户配置存储在 Chrome Storage |
| 辅助阅读功能完全注释 | 代码臃肿 | 拆分为独立文件或彻底移除 |
| HTML 转 Markdown 逻辑复杂 | 维护困难 | 使用成熟库如 `turndown` |
| Shadow DOM 样式全部 `!important` | 难以覆盖 | 优化 CSS 架构 |

### 6.2 功能增强建议
| 功能 | 价值 | 优先级 |
|------|------|--------|
| 历史记录 | 防止误关闭丢失内容 | P1 |
| 模板系统 | 支持自定义输出格式 | P2 |
| 标签选择 | 支持 Flomo 标签 | P2 |
| 多账户切换 | 支持多个 Flomo 账户 | P3 |

---

## 七、文件结构

```
flomo_tool/
├── manifest.json          # 扩展配置
├── README.md              # 用户文档
├── FUNCTIONAL_DESIGN.md   # 本文档
├── .env                   # 环境变量（Git 忽略）
├── prompt_help_read.txt   # 辅助阅读 Prompt
├── test_ark_api.js        # Ark API 测试脚本
├── scripts/
│   ├── background.js      # Service Worker
│   └── content.js         # 内容脚本（主要逻辑）
├── styles/
│   └── sidebar.css        # 侧边栏样式（基础样式）
├── sidebar.html           # 侧边栏 HTML（备用，实际使用 Shadow DOM 动态创建）
└── images/
    ├── icon48.png
    └── icon128.png
```

---

## 八、关键代码模块索引

| 功能 | 文件 | 函数/位置 |
|------|------|-----------|
| 侧边栏创建 | content.js | `createSidebar()` (line ~418) |
| 富文本初始化 | content.js | `initializeRichEditors()` (line ~1262) |
| HTML 转 Markdown | content.js | `htmlToMarkdown()` (line ~1684) |
| 正文提取 | content.js | `extractArticleByDensity()` (line ~1032) |
| AI 总结调用 | content.js | `generateSummary()` (line ~1154) |
| Flomo 提交 | content.js | `submitBtn.addEventListener()` (line ~758) |
| 后台脚本注入 | background.js | `chrome.action.onClicked` (line ~40) |
| 辅助阅读（注释）| background.js | `processHelpReadAnalysis()` (line ~322) |

---

*文档生成时间: 2026-04-11*
*版本: 基于 Flomo Clipper 0.1.3*

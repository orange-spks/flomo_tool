# 项目简介

Flomo Clipper 是一个 Chrome 浏览器扩展（Manifest V3），帮助用户快速将网页内容同步到 Flomo 笔记。核心功能包括：一键唤起侧边栏、自动获取页面标题和链接、富文本编辑（加粗、高亮、列表等）、图片上传、AI 自动总结网页内容。

## 核心架构与技术特性

### 1. 扩展架构（Manifest V3）
- **Service Worker** (`background.js`): 标签页状态跟踪、脚本动态注入、消息转发
- **Content Script** (`content.js`): 侧边栏创建与管理、富文本编辑器、AI 调用、Flomo 同步
- **样式隔离**: Shadow DOM + `all: initial` 防止页面样式污染

### 2. 侧边栏系统
- **实现方式**: Shadow DOM 宿主 (`#flomo-sidebar-host`) 动态创建
- **样式隔离**: `z-index: 2147483647` 确保最高层级，400px 固定宽度
- **交互特性**: 点击外部关闭、滚动隔离（拦截 `wheel`/`touchmove`）、平滑动画过渡
- **布局结构**: 标题/链接显示区 + 原文摘要编辑器 + 个人感想编辑器 + Webhook 设置面板

### 3. 富文本编辑器
- **技术基础**: `contentEditable` + `document.execCommand`
- **支持格式**: 加粗(Ctrl+B)、下划线(Ctrl+U)、高亮、无序/有序列表、斜体(Ctrl+I)
- **图片上传**: 粘贴上传(Ctrl+V) + 点击上传，FileReader 转 Base64 内嵌
- **工具栏设计**: 固定工具栏（底部）+ 浮动工具栏（选中文本时弹出）
- **格式控制**: Enter 自动清除当前段落格式，防止格式延续

### 4. AI 总结功能
- **API 提供商**: 通用 OpenAI 兼容格式，支持 DeepSeek、硅基流动、Kimi、Qwen 等任意平台（用户配置 Base URL + 模型名 + API Key）
- **正文提取算法**: 语义化标签 → 类名匹配 → 文本密度算法 → TreeWalker 遍历
- **Prompt 设计**: 7 类文章类型分类，输出关键词（最多8个）+ 总结（不超过200字）

### 5. Flomo 同步系统
- **存储方式**: `chrome.storage.local` 存储 Webhook URL
- **提交格式**: Markdown 模板（书摘文摘/网页摘录标签 + 感想 + 摘要 + 原文链接）
- **HTML 转 Markdown**: 自定义转换逻辑（`<b>`→`**`, `<mark>`→`==`, `<ul>`→`-` 等）

### 6. 已知技术债务
- ✅ **安全风险**: ~~DeepSeek API Key 硬编码~~ → 已改为用户配置存储在 `chrome.storage.local`
- ✅ **代码臃肿**: ~~辅助阅读功能已注释停用，但代码仍保留在 background.js 中~~ → 已在 v0.1.3 中彻底清理
- ✅ **HTML 转 Markdown**: 已修复段落分隔逻辑（v0.1.3+），高亮/下划线 fallback 到标准 Markdown
- **维护困难**: HTML 转 Markdown 逻辑复杂，建议使用 `turndown` 等成熟库
- **多模型配置**: 已完成通用 OpenAI 格式改造（v0.1.3），支持用户自定义 Base URL 和模型
- **图片传递可靠性**: Flomo Webhook 暂不支持 Base64 图片，前端入口已隐藏，后端代码保留（v0.1.3）

### 7. 文件结构关键索引
| 功能 | 文件 | 位置 |
|------|------|------|
| 侧边栏创建 | `content.js` | `createSidebar()` (~418行) |
| 富文本初始化 | `content.js` | `initializeRichEditors()` (~1262行) |
| HTML 转 Markdown | `content.js` | `htmlToMarkdown()` (~1684行) |
| 正文提取 | `content.js` | `extractArticleByDensity()` (~1032行) |
| AI 总结调用 | `content.js` | `generateSummary()` (~1154行) |
| 后台脚本注入 | `background.js` | `chrome.action.onClicked` (~40行) |

# 人设

我是你的开发助手，专注于协助你完成 Flomo Clipper Chrome 扩展的开发工作。我熟悉项目的技术栈（Chrome Extension API、JavaScript、CSS3）和架构设计。

# 对话风格

1. **详细展开**：解释清楚来龙去脉，不跳过关键细节
2. **优先更新已有文档**：有重大改动时，优先在现有文档（README.md、FUNCTIONAL_DESIGN.md 等）上更新，而非新建文档
3. **代码与注释并重**：修改代码时提供清晰的中文注释说明关键逻辑
4. **上下文感知**：自动读取 MEMORY.md 和当天记忆，保持对话连续性
5. **主动确认**：对于破坏性操作（删除、覆盖等）会先征求同意

# 思考方式

1. **先理解需求**：确保准确理解意图后再动手
2. **探索优先**：修改前先阅读相关代码，了解现有实现
3. **一致性优先**：遵循项目现有代码风格和架构模式
4. **可维护性**：改动要考虑长期维护，避免临时方案
5. **文档同步**：技术决策和重大改动同步到文档

# 记忆协议

## 长期记忆（MEMORY.md）
- 存放稳定的核心信息：技术决策、个人偏好、关键结论
- 每次对话自动加载，始终在上下文中
- 超过 150 行时主动提议精简

## 每日记忆（memory/YYYY-MM-DD.md）
- 存放当天对话产生的要点：结论、洞察、待办、决策
- 对话结束前问一句"这次有值得记住的吗？"，确认后写入当天文件
- 需要回顾历史时，搜索 memory/ 目录检索

## 工作流
1. 对话开始 → 用 Read 工具读取本项目根目录下的 MEMORY.md，再用 Read 读取 memory/当天日期.md（如 memory/2026-04-12.md），了解今天已有的上下文
2. 涉及历史上下文 → 用 Grep 工具搜索本项目根目录下的 memory/ 目录
3. 对话结束 → 问是否要记录，确认后写入 memory/当天日期.md
4. 如果产出了值得长期记住的信息（如新功能设计、重要技术决策），同步更新 MEMORY.md
5. 注意：以上所有文件路径都是相对于本项目根目录，不是全局 ~/.claude/ 目录

## 补充规则
- 记忆以本项目根目录下的文件为准，忽略 ~/.claude/ 下的 auto-memory（内置记忆系统），不要读也不要写
- 对话开始时，除了读今天的记忆，也读昨天的（memory/昨天日期.md），保持跨天连续性
- 用户说"记住这个"、"这个记一下"时，立刻写入文件，不要只"记在心里"等结束再存
- 每日记忆积累超过 7 天时，主动提议做一次蒸馏：把仍然有价值的要点合并到 MEMORY.md，过时的标记或清理

---

## 会话记录 [2026-04-12 17:40]

### 概要
修复 Flomo Clipper 的两个问题：1) 提交笔记后侧边栏无法关闭；2) 传到 flomo 的内容格式渲染不完整。修改了 `scripts/content.js` 中的提交逻辑和 `htmlToMarkdown` 函数，并添加了调试日志排查关闭按钮无响应的问题。

### 关键决策及原因
- **提交成功后自动关闭侧边栏**：在提交成功回调中调用 `toggleSidebar()`，提升用户体验
- **添加 `content_type: "markdown"` 参数**：flomo API 支持此参数，确保 Markdown 格式能被正确解析
- **重写 `htmlToMarkdown` 使用递归处理**：列表项内部可能包含加粗、斜体等格式，递归处理可保留嵌套格式

### 陷阱与注意事项
- **Shadow DOM 中的元素获取**：必须使用 `shadow.querySelector` 而不是 `getShadowElement`，后者依赖全局变量可能在初始化时未设置
- **CSS `pointer-events: none` 的覆盖**：初始样式使用 `!important`，必须通过 `setProperty` 方法才能覆盖
- **关闭按钮事件绑定位置**：事件绑定代码必须在 `shadow.appendChild(sidebar)` 之后执行，确保 DOM 已创建

### 失败的尝试
- ~~通过点击 `#flomo-toggle-button` 元素关闭侧边栏~~ — 该元素不存在，应直接调用 `toggleSidebar()` 函数
- ~~使用 `host.style.pointerEvents` 设置样式~~ — 无法覆盖 `!important`，必须使用 `setProperty('pointer-events', 'auto', 'important')`

### 待办事项
- [ ] 验证关闭按钮点击事件是否正常触发（已添加调试日志）
- [ ] 验证插件图标点击是否正常唤起/收起侧边栏
- [ ] 验证 flomo 内容格式是否正确渲染（加粗、斜体、列表等）

---

## 会话记录 [2026-05-07]

### 概要
重构 Flomo Clipper v0.1.3：1) 彻底清理辅助阅读冗余代码；2) AI总结升级为通用OpenAI格式，支持多模型配置；3) 前端隐藏图片上传入口。

### 关键决策及原因
- **通用 OpenAI 格式替代硬编码 DeepSeek**：用户可配置任意 OpenAI 兼容平台（硅基流动、Kimi、Qwen 等），灵活性最高
- **旧配置自动迁移**：检测旧版 `DEEPSEEK_API_KEY` 并自动迁移到新结构，避免用户重新配置
- **前端隐藏而非删除图片代码**：Flomo Webhook 暂不支持 Base64 图片，但保留后端代码以便未来恢复
- **每个字段独立保存/清除**：用户可灵活配置，不需要三个字段同时填写

### 文件改动
- `scripts/background.js`: 删除 320 行辅助阅读代码
- `scripts/content.js`: 删除辅助阅读代码，升级 AI 调用逻辑，隐藏图片上传入口
- `manifest.json`: 更新 host_permissions 和版本号到 0.1.3
- `README.md`: 新建项目文档

---

## 会话记录 [2026-05-09]

### 概要
修复 `htmlToMarkdown` 在提交到 Flomo 时的格式渲染问题，并调研硅基流动 API 配置。

### 问题与修复
1. **段落分隔问题**：文本节点和块元素（div/p/ul/ol）之间缺少段间距，导致内容挤在一起。
   - 修复：移除 div/p/ul/ol 内部的尾部换行，在顶层遍历中根据块元素状态插入 `\n\n`

2. **高亮/下划线不渲染**：Flomo 不支持 `==高亮==`（非标准 Markdown）和 `<u>` 内联 HTML 标签。
   - 修复：高亮 fallback 到加粗 `**text**`，下划线 fallback 到斜体 `*text*`

### 调研结论
硅基流动完全兼容 OpenAI 格式，配置如下：
- Base URL: `https://api.siliconflow.cn/v1`
- 模型: `deepseek-ai/DeepSeek-V3`（必须带厂商前缀）
- 认证: `Authorization: Bearer <API_KEY>`

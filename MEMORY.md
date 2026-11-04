# 记忆

## 关于我
- 角色：开发者
- 日常工作：开发 Flomo Clipper Chrome 扩展

## 项目与上下文
- 项目：Flomo Clipper - Chrome 扩展（Manifest V3），用于快速同步网页内容到 Flomo
- 技术栈：Chrome Extension API、JavaScript、CSS3、Shadow DOM
- 主要功能：侧边栏（Shadow DOM 隔离）、富文本编辑（contentEditable）、AI 总结（DeepSeek API）、图片上传（Base64）
- 代码位置：核心逻辑在 `content.js`，后台服务在 `background.js`
- 设计文档：`FUNCTIONAL_DESIGN.md` 有完整的功能设计和技术架构说明

## 工作习惯与偏好
- 对话风格：详细展开，解释来龙去脉
- 文档习惯：重大改动优先在已有文档上更新，不随意新建文档
- 代码质量：修改时附带中文注释说明关键逻辑

## 重要决策
- 2026-04-12：初始化记忆系统
- 2026-04-12：DeepSeek API Key 从硬编码改为用户配置存储（`chrome.storage.local`）
- 2026-04-12：`htmlToMarkdown` 函数从正则表达式改为 DOM 解析方式（解决嵌套格式渲染问题）
- 2026-04-12：修复 Shadow DOM pointer-events 层级问题（关闭按钮无法点击）
- 2026-04-19：UI 优化（设置栏折叠箭头、右上角浮层提示、延迟 2s 关闭抽屉）
- 2026-04-19：图片上传增加 canvas 压缩（最大宽度 1200px，JPEG 质量 0.8）
- 2026-04-19：保存配置时支持清空输入框来删除 storage 中的旧值
- 2026-05-07：v0.1.3 重构完成——清理辅助阅读代码、AI 升级为通用 OpenAI 格式、隐藏图片上传入口
- 2026-05-09：`htmlToMarkdown` 修复段落分隔 + 高亮/下划线 fallback 到标准 Markdown
- 2026-11-04：删除页面级 `insertCSS`（裸选择器污染宿主页面，DeepSeek 输入框被染绿）
- 2026-11-04：所有跨域请求（AI 总结、Webhook）改由 Service Worker 中转（`proxyFetch`），解决 HTTPS 页面请求 HTTP 内网 API 的混合内容拦截
- 2026-11-04：防重复注入机制——content.js IIFE 包裹 + background flomoPing 检测（SW 休眠丢失注入状态导致重复注入 SyntaxError）

## 技术债务状态
- ✅ 已解决（详见 git 历史）：DeepSeek Key 硬编码、关闭按钮失效、Markdown 渲染、提示系统统一、配置删除、辅助阅读清理、段落分隔、高亮/下划线 fallback（已增强 span/font 识别，前端按钮已禁用）、页面样式污染、混合内容拦截、重复注入
- ⏳ **HTML 转 Markdown 维护**：建议未来引入 `turndown` 库（当前自定义实现已稳定）
- ⏳ **图片传递可靠性**：前端入口已隐藏，后端代码保留，待 Flomo 支持
- ⏳ **遗留文件待清理**：`styles/sidebar.css`、`sidebar.html`（运行时无人使用，仅互相引用）

## 血泪教训（不要再犯）

### 1. `!important` 样式必须用 `setProperty` 覆盖
**问题**：Shadow DOM 中的 `.flomo-sidebar` 设置了 `display: flex !important;`，结果 `toggleSidebar()` 里用 `sidebar.style.display = 'none'` 完全无效，导致提交后自动关闭抽屉失败。之前只修了关闭按钮的点击事件，没修通用函数。

**正确做法**：
```javascript
// ❌ 错误：无法覆盖 !important
sidebar.style.display = 'none';

// ✅ 正确：必须用 setProperty 并指定 'important'
sidebar.style.setProperty('display', 'none', 'important');
sidebar.style.setProperty('display', 'flex', 'important');
```

**检查清单**：以后任何通过 JS 修改样式的代码，如果对应 CSS 使用了 `!important`，一律用 `setProperty(..., 'important')`。

### 2. 保存按钮的空值校验要支持"删除配置"
**问题**：用户清空 Webhook/API Key 输入框后点击保存，旧逻辑只弹 `"请填写..."` 错误，不会清除 `chrome.storage.local` 中的旧值。用户以为删除了，提交时仍读取旧配置成功，造成困惑。

**正确做法**：
```javascript
if (!value.trim()) {
    chrome.storage.local.remove([KEY], () => {
        showMessage('配置已清除', 'success');
    });
    return;
}
```

### 3. Chrome 扩展无法读取 .env 文件
**问题**：用户误以为 `.env` 文件中的配置会被扩展自动加载。实际上 Content Script 运行在浏览器沙箱中，无法访问文件系统。

**正确做法**：在设置面板 UI 中明确提示 `"配置保存在浏览器本地，扩展不会自动读取项目目录下的 .env 文件"`，避免预期偏差。

### 4. Flomo 不支持 `==高亮==` 和 `<u>` 内联 HTML
**问题**：`htmlToMarkdown` 把高亮转成 `==text==`（Obsidian 语法）、下划线保留 `<u>` 标签，结果提交到 Flomo 后两者都不渲染。

**根因**：Flomo 的 Markdown 解析器不支持非标准语法和内联 HTML。

**正确做法**：
1. 在 htmlToMarkdown 中 fallback 到 Flomo 实际支持的语法，并覆盖 contentEditable 实际生成的多种 HTML：
   - 高亮 → `**text**`（加粗）
     - 支持 `<mark>`、`<span style="background-color: #ffeb3b">`、`<span style="background-color: rgb(255, 235, 59)">`、`<font>` 等
   - 下划线 → `**text**`（加粗）
     - Flomo 不支持 `*斜体*` 和 `__下划线__`，因此不能 fallback 到斜体
     - 支持 `<u>`、`<span style="text-decoration: underline">` 等
2. 由于高亮/下划线在 Flomo 端无法保留原始视觉样式（都变成加粗），前端工具栏的对应按钮已禁用，避免用户误以为格式能被同步。

**检查清单**：
1. htmlToMarkdown 遇到 `span`/`font` 标签时，必须同时检查 `backgroundColor` 和 `textDecoration` 属性，不能只看 tagName。
2. 任何 fallback 策略必须以 Flomo 实测支持的 Markdown 为准，不能假设标准 Markdown 全支持。
3. 如果某个格式最终无法被目标平台正确渲染，应禁用前端入口并明确提示用户，而不是保留一个无效的按钮。

### 5. 硅基流动配置要点
- Base URL: `https://api.siliconflow.cn/v1`（必须带 `/v1`）
- 模型 ID 必须带厂商前缀：`deepseek-ai/DeepSeek-V3`，不能简写
- 和 DeepSeek/Kimi/Qwen 一样使用 `Authorization: Bearer <key>`

### 6. API Key 绝不能硬编码，且删除代码不等于删除泄露
**问题**：v0.1.2/v0.1.3 期间把 `const DEEPSEEK_API_KEY = 'sk-...'` 直接写进 `scripts/content.js`，虽然后续版本改成 `chrome.storage.local` 用户配置，但 git 历史里一直留着这个 key。仓库设为 public 后 GitHub secret scanning 立刻告警。

**正确做法**：
1. 任何 API Key 都通过用户配置或环境变量传入，代码里只保留占位符或 storage key 名。
2. 公开仓库前先用工具自查历史：
   ```bash
   git log --all --full-history -p | grep -iE 'sk-[a-z0-9]{10,}'
   ```
   或安装 `git-secrets`、`truffleHog`。
3. 一旦泄露，立即执行：
   - 撤销/轮换受影响的 key（止损第一步）
   - 用 `git-filter-repo` 清理历史：`git filter-repo --replace-text <替换规则文件>`
   - 强制推送所有分支：`git push --force origin --all`
   - 在 GitHub Security 页面确认告警消除

**检查清单**：提交前永远不要用 `git add -A` 把含 `.env`、测试脚本、硬编码 key 的文件一起提交；公开仓库前必须做一次 secret 扫描。

### 7. 绝不向页面注入含裸选择器的 CSS
**问题**：`insertCSS` 把含 `textarea`、`.close-btn` 等裸选择器的 `sidebar.css` 注入页面，导致所有网站的输入框被染成 flomo 绿。

**正确做法**：扩展 UI 样式只走 Shadow DOM 或全内联；页面级注入的 CSS 里任何裸标签/通用类名都是定时炸弹。

### 8. 所有跨域请求走 Service Worker 中转
**问题**：content script 直连 HTTP 内网 API（`http://172.19.36.172:4000`），在 HTTPS 页面被混合内容拦截报 "Failed to fetch"，排查时一度误判为页面 CSP。

**正确做法**：content script 一律 `chrome.runtime.sendMessage` → Service Worker 代发 fetch（`proxyFetch`）。SW 不受页面 CSP、混合内容、页面 Service Worker 拦截影响。

### 9. MV3 Service Worker 休眠 = 内存状态不可信
**问题**：`injectedTabs` 存内存，SW 休眠丢失后重复注入 content.js，顶层 `const` 重复声明直接 SyntaxError，页面里一直是旧版代码在跑（表现为"改了代码不生效"）。

**正确做法**：
- content.js 用 IIFE 包裹 + `window.__flomoContentScriptLoaded` 标记，重复注入自动跳过
- background 注入前 `flomoPing` 检测页面实际状态，版本不符提示刷新，不盲目注入

### 10. 排查扩展问题先硬刷新标签页
注入的 content script 在页面生命周期内常驻，扩展重载/代码更新都不影响已注入的旧代码。验证任何修复前：`chrome://extensions` 重载 + 确认**实际加载的目录**（根目录 vs dist/staging）+ 标签页 Ctrl+Shift+R。

**探针法**：怀疑键盘/事件被拦截时，在目标元素挂 capture 监听打印事件和 `defaultPrevented`，一次区分"事件被拦截" vs "页面自身逻辑失效"。

## 关键技术方案（供参考）
- **Shadow DOM 事件处理**：宿主元素用 `setProperty('pointer-events', ..., 'important')` 控制交互；侧边栏和按钮显式 `pointer-events: auto !important`
- **HTML 转 Markdown**：DOM 递归解析（`processNode`），非正则——实现见 `content.js` 的 `htmlToMarkdown()`
- **跨域请求**：一律走 background 的 `proxyFetch` 中转，不在 content script 里直接 fetch
- **注入检测**：background 点击时 `flomoPing` 页面确认注入状态，content.js 有 IIFE 防重复注入

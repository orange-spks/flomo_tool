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

## 技术债务状态
- ✅ **DeepSeek API Key 硬编码**：已解决（用户本地配置）
- ✅ **关闭按钮/插件切换失效**：已解决（pointer-events 层级修复 + display 切换修复）
- ✅ **Markdown 格式渲染不完整**：已解决（DOM 解析替代正则）
- ✅ **提示系统**：已统一为右上角浮层（`showMessage` 替代 `showToast`）
- ✅ **配置删除**：已支持清空输入框即删除 storage 中的旧配置
- ✅ **辅助阅读功能**：已在 v0.1.3 彻底清理
- ✅ **HTML 转 Markdown 段落分隔**：已修复（v0.1.3+）
- ✅ **高亮/下划线 Flomo 渲染**：已 fallback 到标准 Markdown（v0.1.3+）
- ⏳ **HTML 转 Markdown 维护**：建议未来引入 `turndown` 库（当前自定义实现已稳定）
- ⏳ **图片传递可靠性**：前端入口已隐藏，后端代码保留，待 Flomo 支持

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

**正确做法**：在 htmlToMarkdown 中 fallback 到标准 Markdown：
- 高亮 → `**text**`（加粗）
- 下划线 → `*text*`（斜体）

### 5. 硅基流动配置要点
- Base URL: `https://api.siliconflow.cn/v1`（必须带 `/v1`）
- 模型 ID 必须带厂商前缀：`deepseek-ai/DeepSeek-V3`，不能简写
- 和 DeepSeek/Kimi/Qwen 一样使用 `Authorization: Bearer <key>`

## 关键技术方案（供参考）

### Shadow DOM 事件处理
```javascript
// 宿主元素控制整体交互
host.style.setProperty('pointer-events', isOpen ? 'auto' : 'none', 'important');

// 侧边栏和按钮必须显式启用事件
.sidebar { pointer-events: auto !important; }
.close-btn { pointer-events: auto !important; }
```

### HTML 转 Markdown（DOM 解析方案）
```javascript
function htmlToMarkdown(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (node.nodeType === Node.ELEMENT_NODE) {
            const childContent = Array.from(node.childNodes)
                .map(child => processNode(child)).join('');
            // 根据 tagName 返回对应 Markdown 格式
            switch(node.tagName.toLowerCase()) { ... }
        }
    }
    return processNode(tempDiv);
}
```

### Chrome Storage 配置存储
```javascript
// 读取
chrome.storage.local.get([KEY], (result) => { ... });

// 写入
chrome.storage.local.set({ [KEY]: value }, () => { ... });
```

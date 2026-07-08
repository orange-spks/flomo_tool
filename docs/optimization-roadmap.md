# Flomo Clipper 后续优化路线图

> 记录 2026-07-07 代码 review 中识别的非立即处理项，供后续迭代参考。

## 一、代码结构重构（高优先级）

### 1. 拆分 `scripts/content.js`
当前 `content.js` 约 2300 行，职责严重混杂。建议拆分为：
- `styles/sidebar.css`：把 `SHADOW_STYLE` 内联样式字符串彻底移出 JS
- `scripts/markdown.js`：HTML → Markdown 转换逻辑
- `scripts/ai.js`：AI 总结、配置读取、API 调用
- `scripts/editor.js`：富文本编辑器、工具栏、快捷键、粘贴处理
- `scripts/ui.js`：侧边栏创建/显示/隐藏、Pin 状态、设置面板

### 2. 治理全局变量
当前使用大量 `window.flomoXxx` 全局状态：
- `window.flomoSidebarHost`
- `window.flomoSidebarShadow`
- `window.flomoSidebarPinned`
- `window.flomoClickOutsideHandler`
- `window.toolbarTimeout`

建议改为模块级闭包变量或单一状态对象：
```js
const state = {
  host: null,
  shadow: null,
  pinned: false,
  clickOutsideHandler: null,
  toolbarTimeout: null
};
```

### 3. 统一事件绑定与清理
`createSidebar()` 中 Pin/关闭按钮的事件绑定采用 `_clickHandler` 模式挂在 DOM 元素上，不够干净。建议：
- 使用统一的 `setupEventListeners()` 函数
- 在 sidebar 关闭/销毁时统一移除监听器
- 关闭按钮统一调用 `toggleSidebar()`，避免关闭逻辑两份实现

## 二、安全与健壮性（高优先级）

### 4. AI 请求添加超时控制
当前 `generateSummary()` 中的 `fetch` 没有超时：
```js
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
const response = await fetch(url, { ..., signal: controller.signal });
clearTimeout(timeoutId);
```

### 5. 为 API Key 存储增加说明
`chrome.storage.local` 中的 Key 是明文存储。应在设置面板中明确提示用户：
> "API Key 保存在浏览器本地存储中，不会上传到服务器。"

### 6. 考虑按 tab 隔离状态
当前 `window.flomoSidebarPinned` 是全局状态，多标签页会互相影响。若未来需要 per-tab 行为，需重新设计状态管理。

## 三、UI/UX 改进（中优先级）

### 7. 浮动工具栏放入 Shadow DOM
当前浮动工具栏直接挂在 `document.body` 上，可能被页面 CSS 污染或 z-index 冲突。建议：
- 通过 `#flomo-sidebar-host` 的 Shadow DOM 渲染
- 或至少设置更唯一的类名和更严格的样式隔离

### 8. 提交成功后延迟关闭的体验优化
当前提交成功后 2 秒自动关闭侧边栏。若用户在 2 秒内继续编辑会被强制打断。建议：
- 改为显示成功提示，由用户手动关闭
- 或提供"提交并关闭"与"提交不关闭"两种选项

### 9. 优化 `autoResizeEditor` 性能
快速输入时频繁调整高度可能引发性能问题。建议添加 debounce 或 requestAnimationFrame 节流。

## 四、功能完善（中优先级）

### 10. 正文提取算法增强
当前 `extractArticleByDensity()` 基于简单文本密度分数，对 SPA、动态加载页面、评论区等噪声处理不足。建议：
- 引入 `@mozilla/readability` 或类似库
- 增加 fallback 策略和长度校验

### 11. HTML → Markdown 转换完善
当前 `htmlToMarkdown()` 存在以下边界问题：
- 嵌套列表（`ul > li > ul > li`）会丢失缩进层级
- 有序列表若含 `start` 属性或中断，序号会从 1 重新开始
- HTML 实体解码不完整（仅 8 个常见实体）
- 某些空格/格式场景可能丢失

建议：
- 短期：补充更多单元测试，覆盖嵌套列表、HTML 实体等
- 长期：改用成熟库 `turndown`

### 12. 清理已禁用的图片上传代码
当前 `ENABLE_IMAGE_UPLOAD = false`，但图片上传相关代码仍保留在 `content.js` 中约 150 行。由于 Flomo Webhook 暂不支持 Base64 图片，建议：
- 彻底删除图片上传、压缩、预览、缩略图相关代码
- 将来需要时从 git history 恢复即可

## 五、工程化（低优先级但值得做）

### 13. 统一脚本注入方式
当前 `manifest.json` 自动注入 `key-blocker.js`，而 `background.js` 动态注入 `content.js`，两条路径混用。建议：
- 把 `content.js` 也改为 `content_scripts` 自动注入
- 通过消息控制侧边栏显示/隐藏
- 处理 Service Worker 重启后 `injectedTabs` 状态丢失的问题

### 14. 引入正式测试框架
当前 `test_html_to_markdown.js` 是手写的 mock 测试。建议：
- 引入 Jest + jsdom
- 把 htmlToMarkdown 等纯函数抽到独立模块后编写单元测试
- 在 CI 中运行测试

### 15. 分支管理优化
本分支 `feature/pin-toolbar-title-space` 实际承载了 Pin、键盘隔离、Markdown 转换、多模型配置、设置面板等多个功能。未来建议：
- 每个独立功能一个分支
- 便于 review、回滚和发布管理

---

## 检查清单

- [ ] 拆分 `content.js`
- [ ] 治理 `window.flomoXxx` 全局变量
- [ ] AI 请求添加超时
- [ ] 浮动工具栏放入 Shadow DOM
- [ ] 正文提取引入 Readability
- [ ] htmlToMarkdown 改用 turndown 或补充测试
- [ ] 删除已禁用的图片上传代码
- [ ] 统一 content script 注入方式
- [ ] 引入 Jest 测试框架
- [ ] 优化分支粒度

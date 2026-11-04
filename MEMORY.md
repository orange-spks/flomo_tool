# 记忆

## 关于我
- 角色：开发者，独立维护 Flomo Clipper
- 项目：Chrome MV3 扩展，把网页内容摘录成 Markdown 同步到 flomo 笔记，可选 AI 总结
- 代码索引：`scripts/content.js`（侧边栏 / 富文本 / 正文提取 / 提交模板）、`scripts/background.js`（点击注入 + `proxyFetch` 中转）、`scripts/key-blocker.js`（键盘守卫）
- 文档：`README.md`（用法 + 打包）、`FUNCTIONAL_DESIGN.md`（设计）、`docs/store/`（上架材料，含 `chrome-submit.md`）

## 工作习惯与偏好
- 对话：详细展开，讲清来龙去脉，不跳过关键细节
- 文档：重大改动优先更新已有文档，不新建
- 代码：改动附中文注释说明关键逻辑；动手前先读现有实现，遵循现有风格
- 记忆：每日记忆超 7 天做一次蒸馏；只写本项目根目录，不碰 `~/.claude` 的 auto-memory

## 重要决策（时间线）
- 2026-04-12 初始化记忆系统；API Key 从硬编码改为 `chrome.storage.local` 用户配置
- 2026-04-12 `htmlToMarkdown` 从正则改 DOM 递归解析（正则处理嵌套标签会漏出 `$1` 占位符）
- 2026-04-19 提示统一为右上角 2s 浮层；提交成功延迟 2s 关抽屉；保存空值 = 删除配置
- 2026-05-09 段落分隔修复；高亮/下划线 fallback 到加粗（Flomo 不支持 `==高亮==`、`<u>`、`*斜体*`）
- 2026-07-01 Pin 固定侧边栏（关闭时重置状态）；标题/链接一键清空
- 2026-07-02~03 键盘守卫独立成 `key-blocker.js`（`document_start` + capture 阶段 + 白名单放行）；空字段一律省略字段名
- 2026-07-06 标签按内容来源切换：有标题或链接 → `#书摘文摘/网页摘录 #00-input`，都没有 → 仅 `#00-input`
- 2026-08-01 禁用下划线/高亮按钮（Flomo 端渲染不了，留着入口只会误导）
- 2026-11-04 删页面级 `insertCSS`；跨域请求统一走 `proxyFetch`；content.js 加防重复注入
- 2026-11-04 更名「flomo 随记」并提交 Chrome 审核——**商店标题只认 manifest 的 `name`**

## 血泪教训（别再犯）

### 1. `!important` 只能用 `setProperty(property, value, 'important')` 覆盖
普通赋值 `el.style.x = value` 会静默失败；更糟的是 `el.style.x = 'v !important'`——浏览器把 `!important` 当值的一部分直接丢弃。
这个坑踩过两次（关闭按钮、toast 动画），改任何动态样式前先确认目标 CSS 有没有 `!important`。

### 2. 保存按钮的空值校验 = 删除配置
用户清空输入框再保存，旧逻辑只弹「请填写」，storage 里的旧值仍在默默生效。正确做法是 `chrome.storage.local.remove(KEY)` + 提示「已清除」。

### 3. Chrome 扩展永远读不到 `.env`
Content Script 在浏览器沙箱里，没有文件系统。`.env` 只对 Node 测试脚本有效，扩展配置必须走 `chrome.storage.local`，并且要在 UI 上写清楚，避免用户以为改 `.env` 就生效。

### 4. Flomo webhook 的 Markdown 支持范围（2026-08-01 实测）
- ✅ `**加粗**`、列表、`#tag`、链接
- ❌ `*斜体*`、`__下划线__`、`==高亮==`、`<u>` 内联 HTML

所以高亮/下划线在 `htmlToMarkdown` 里 fallback 到加粗，前端对应按钮直接禁用。**任何 fallback 必须以目标平台实测为准，不能假设标准 Markdown 全支持**；格式保不住就禁用入口，而不是留个无效按钮。

### 5. 硅基流动配置要点
Base URL 必须带 `/v1`（`https://api.siliconflow.cn/v1`），模型 ID 必须带厂商前缀（`deepseek-ai/DeepSeek-V3`），认证都是 `Authorization: Bearer <key>`。

### 6. 泄露的 API Key：删代码没用，必须清历史
2026-07-26 仓库转 public 后 GitHub secret scanning 告警——key 还留在 git 历史里。标准流程：
1. **先撤销/轮换 key**（最有效的止损），再清理历史
2. `pip3 install git-filter-repo` → `echo 'sk-xxx==>REDACTED' > /tmp/r.txt` → `git filter-repo --force --replace-text /tmp/r.txt`
3. `git push --force origin --all`（历史重写后所有 commit hash 都变了）
4. 回 GitHub Security 确认告警消除

公开仓库前先自查：`git log --all --full-history -p | grep -iE 'sk-[a-z0-9]{10,}'`。提交前永远不要 `git add -A`。

### 7. 绝不向页面注入含裸选择器的 CSS
`insertCSS(styles/sidebar.css)` 里带 `textarea`、`.close-btn` 这类裸选择器，结果全网输入框被染成 flomo 绿（DeepSeek 输入框变绿就是这么来的）。扩展 UI 样式只走 Shadow DOM 或全内联。

### 8. 所有跨域请求走 Service Worker 中转
Content script 的 fetch 会受页面 CSP、页面 Service Worker、混合内容（HTTPS 页请求 HTTP 内网 API）三重干扰，表现为 `Failed to fetch`。一律 `chrome.runtime.sendMessage` → background 代发，SW 不受这些限制。

### 9. MV3 Service Worker 休眠 = 内存状态不可信
`injectedTabs` 存内存，SW 一睡就丢，导致重复注入 content.js，顶层 `const` 重复声明直接 SyntaxError，页面里一直跑旧代码（表现为「改了不生效」）。
对策：content.js 用 IIFE + `window.__flomoContentScriptLoaded` 标记；background 注入前 `flomoPing` 检测实际状态和版本号，版本不符提示刷新而不是硬注入。

### 10. 排查扩展问题先硬刷新，并认准实际加载的目录
注入的 content script 在页面生命周期内常驻，重载扩展不影响已注入的旧代码。验证前：`chrome://extensions` 重载 + 确认加载的是哪个目录（根目录 vs `dist/unpacked`）+ 标签页 Ctrl+Shift+R。
Console 报错行号对不上当前代码 = 页面在跑旧版本。
**探针法**：怀疑键盘/事件被拦截时，在目标元素挂 capture 监听打印事件与 `defaultPrevented`，一次区分「被拦截」vs「页面自身逻辑失效」。

### 11. 商店上架：标题只认 manifest，后台藏着必填陷阱
1. 商店标题**只读** `manifest.json` 的 `name`，后台没有输入框可覆盖 → 改名只能改 `_locales/*/messages.json` 的 `appName` 后重新打包
2. `Store icon` 是必填拖拽区，**不会**自动从包里带出；包内图标带 alpha 要先压平成 24-bit 无 alpha
3. `Localized screenshots` 与 `Global screenshots` 是**两个独立必填区**，同一组图要传两遍
4. `Remote code` 默认勾的是 `Yes`，要手动改选 `No`
5. Data usage 最下面**三条 certification 必须勾**，勾完还要 `Save draft`；不勾时只弹一句含糊的 "you must certify that your data usage complies..."
6. `Test instructions` 备注只有 **500 字符**上限，长版说明塞不下，要备短版
7. Privacy 页只有 5 个 justification 框，**没有** content script 的位置（Host permission 已覆盖 `content_scripts`）
8. 提交时弹的 `Publishing will be delayed`（Broad Host Permissions）是**正常提示**，不是错误
审核期间改任何字段都会重新排队。卡住时先点 `Why can't I submit?`，它比人眼准。

## 关键技术方案
- **Shadow DOM 隔离**：宿主 `#flomo-sidebar-host` 用 `setProperty('pointer-events', ...)` 控制交互，侧边栏内部元素显式 `pointer-events: auto !important`
- **键盘守卫**：YouTube 在 `document` **capture 阶段**早期注册 keydown，`stopPropagation` 拦不住，且 `stopImmediatePropagation` 只能干掉同元素上**后注册**的监听器 → 必须在 `document_start` 注入（`key-blocker.js`），且只在目标位于本扩展 Shadow DOM 内 + 可编辑元素时拦截，放行修饰键/平台组合键/功能键
- **HTML 转 Markdown**：DOM 递归（`processNode`），非正则；块级元素在顶层插 `\n\n`，块内不插尾换行
- **注入检测**：点击时 `flomoPing` 页面确认状态（见教训 9），不依赖内存

## 技术债
- ⏳ HTML 转 Markdown 维护成本高 → 方案已定：迁移 `turndown`（UMD 单文件 + `addRule` 实现 flomo 特有 fallback），见 `FUNCTIONAL_DESIGN.md` 6.1
- ⏳ `execCommand` 已废弃 → **决策不迁移**：所需命令是它最稳定的子集，所有调用已收敛到 `execFormat()`，真被移除只改一处
- ⏳ 图片 Base64 传递 → Flomo webhook 不支持，前端入口已隐藏，后端代码保留
- ⏳ 遗留文件 `styles/sidebar.css`、`sidebar.html` 待清理（运行时无人引用）
- ⏳ `manifest.json` 的 `host_permissions` 同时列了 `<all_urls>` 和 4 个 AI 域名，后者冗余，可清理

## 当前状态（2026-11-04）
- v1.0.0（更名 `flomo 随记` / `flomo Memo`）**已提交 Chrome Web Store 审核**，状态 `Pending review`，Item ID `caikfmblgokfolkofgeokpjfllcppj`，发行商 `orange-spks`（Non-trader）
- 审核预期 1–3 天，带 `<all_urls>` 可能 1–2 周；期间不改任何字段
- Edge 侧仍卡 Partner Center 账号验证（与包无关），验证后上传同一个 zip
- 未完成：5 分钟真机验收（`docs/store/submit-guide.md` 第 6 节）

# Flomo Clipper 重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 去除辅助阅读冗余代码，AI总结升级为通用OpenAI格式多模型配置，前端隐藏图片上传入口，同步更新文档。

**Architecture:** 保留现有 Shadow DOM 侧边栏架构，仅修改配置层和清理历史代码。AI调用从硬编码 DeepSeek 改为读取 `chrome.storage.local` 中的通用配置。图片上传后端代码保留，前端通过常量和HTML移除入口。

**Tech Stack:** Chrome Extension Manifest V3, vanilla JavaScript, Shadow DOM, fetch API (OpenAI compatible format)

---

### Task 1: 清理 background.js 辅助阅读代码

**Files:**
- Modify: `scripts/background.js:103-422`

**Context:** 第103-422行是一个完整的 `/* ... */` 块注释，包含辅助阅读的所有后端逻辑（分片、并发、流式、重试等）。这些代码已被注释停用，直接删除即可。

- [ ] **Step 1: 删除辅助阅读代码块**

删除 `scripts/background.js` 中第103行到文件末尾的所有内容。删除后 `background.js` 应仅剩第1-102行。

删除前请确认：该块以 `// ---------- 辅助阅读（已注释停用） ----------` 开头，以 `*/` 结尾。

- [ ] **Step 2: 验证文件完整性**

读取 `scripts/background.js`，确认文件以 `chrome.tabs.onRemoved.addListener(...)` 结束，且没有语法错误。文件应约102行。

- [ ] **Step 3: Commit**

```bash
git add scripts/background.js
git commit -m "refactor: 删除 background.js 中已停用的辅助阅读代码"
```

---

### Task 2: 清理 content.js 辅助阅读代码

**Files:**
- Modify: `scripts/content.js:1406-1468`

**Context:** 第1406-1468行是被注释的辅助阅读相关代码（helpReadState、extractArticleToTxt、进度显示等），直接删除。

- [ ] **Step 1: 删除辅助阅读代码块**

删除 `scripts/content.js` 第1406行到第1468行的全部内容。该块以 `// ---------- 辅助阅读（已注释停用） ----------` 开头。

- [ ] **Step 2: 验证行号偏移**

删除后，原第1470行 `// ========== 富文本编辑器功能 ==========` 应上移。请重新读取文件确认上下文正确，无残留注释。

- [ ] **Step 3: Commit**

```bash
git add scripts/content.js
git commit -m "refactor: 删除 content.js 中已停用的辅助阅读代码"
```

---

### Task 3: 更新 manifest.json

**Files:**
- Modify: `manifest.json`

**Context:** 需要移除 `web_accessible_resources` 中的 `prompt_help_read.txt`，更新 `host_permissions`，更新版本号。

- [ ] **Step 1: 修改 web_accessible_resources**

将 `web_accessible_resources` 中的 `resources` 数组：

```json
"resources": ["sidebar.html", "styles/*", "scripts/*", "images/*", "prompt_help_read.txt"]
```

改为：

```json
"resources": ["sidebar.html", "styles/*", "scripts/*", "images/*"]
```

- [ ] **Step 2: 更新 host_permissions**

将 `host_permissions`：

```json
"host_permissions": [
    "https://*.flomoapp.com/*",
    "https://flomoapp.com/*",
    "https://api.deepseek.com/*",
    "https://ark.cn-beijing.volces.com/*",
    "https://open.bigmodel.cn/*"
]
```

改为：

```json
"host_permissions": [
    "https://*.flomoapp.com/*",
    "https://flomoapp.com/*",
    "https://api.deepseek.com/*",
    "https://api.siliconflow.cn/*",
    "https://api.moonshot.cn/*",
    "https://dashscope.aliyuncs.com/*"
]
```

- [ ] **Step 3: 更新版本号**

将 `"version": "0.1.2"` 改为 `"version": "0.1.3"`。

- [ ] **Step 4: Commit**

```bash
git add manifest.json
git commit -m "chore(manifest): 移除辅助阅读资源引用，更新 host_permissions 和版本号"
```

---

### Task 4: 升级 AI 总结为通用 OpenAI 格式

**Files:**
- Modify: `scripts/content.js`（多处）

**Context:** 当前 AI 总结硬编码 DeepSeek。需改为通用配置，并支持旧配置自动迁移。

#### 4a. 替换常量定义

- [ ] **Step 1: 替换 AI 配置常量**

找到第1191行附近的常量定义：

```javascript
// AI总结相关常量
const DEEPSEEK_API_KEY_STORAGE_KEY = 'DEEPSEEK_API_KEY';
```

替换为：

```javascript
// AI 模型配置常量（通用 OpenAI 格式）
const AI_API_BASE_URL_STORAGE_KEY = 'AI_API_BASE_URL';
const AI_MODEL_STORAGE_KEY = 'AI_MODEL';
const AI_API_KEY_STORAGE_KEY = 'AI_API_KEY';
const LEGACY_DEEPSEEK_API_KEY_STORAGE_KEY = 'DEEPSEEK_API_KEY';
```

#### 4b. 添加配置迁移函数

- [ ] **Step 2: 添加 migrateLegacyConfig 函数**

在 `generateSummary` 函数之前（约第1356行之前），添加如下函数：

```javascript
// 自动迁移旧版 DeepSeek 配置到新版通用配置
async function migrateLegacyConfig() {
    const stored = await new Promise((resolve) => {
        chrome.storage.local.get([
            LEGACY_DEEPSEEK_API_KEY_STORAGE_KEY,
            AI_API_KEY_STORAGE_KEY,
            AI_API_BASE_URL_STORAGE_KEY,
            AI_MODEL_STORAGE_KEY
        ], resolve);
    });

    const legacyKey = stored[LEGACY_DEEPSEEK_API_KEY_STORAGE_KEY];
    const hasNewConfig = stored[AI_API_KEY_STORAGE_KEY];

    if (legacyKey && !hasNewConfig) {
        await new Promise((resolve) => {
            chrome.storage.local.set({
                [AI_API_BASE_URL_STORAGE_KEY]: 'https://api.deepseek.com',
                [AI_MODEL_STORAGE_KEY]: 'deepseek-v4',
                [AI_API_KEY_STORAGE_KEY]: legacyKey
            }, resolve);
        });
        await new Promise((resolve) => {
            chrome.storage.local.remove([LEGACY_DEEPSEEK_API_KEY_STORAGE_KEY], resolve);
        });
        console.log('[Flomo] 已自动迁移旧版 DeepSeek 配置到新版通用配置');
    }
}
```

#### 4c. 重写 generateSummary 函数

- [ ] **Step 3: 重写 generateSummary 为通用 OpenAI 格式**

将 `generateSummary` 函数（原第1356-1404行）替换为：

```javascript
// 调用通用 OpenAI 兼容 API
async function generateSummary() {
    // 先尝试迁移旧配置
    await migrateLegacyConfig();

    const content = getMainContent();

    // 从本地存储读取配置
    const config = await new Promise((resolve) => {
        chrome.storage.local.get([
            AI_API_BASE_URL_STORAGE_KEY,
            AI_MODEL_STORAGE_KEY,
            AI_API_KEY_STORAGE_KEY
        ], resolve);
    });

    const baseUrl = (config[AI_API_BASE_URL_STORAGE_KEY] || '').trim();
    const model = (config[AI_MODEL_STORAGE_KEY] || '').trim();
    const apiKey = (config[AI_API_KEY_STORAGE_KEY] || '').trim();

    if (!baseUrl || !model || !apiKey) {
        throw new Error('请先在设置中配置 AI 模型（API Base URL、模型名称、API Key）');
    }

    // 确保 baseUrl 不以斜杠结尾
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

    try {
        const response = await fetch(`${normalizedBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: content }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`API 调用失败 (${response.status}): ${errText || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI总结失败:', error);
        throw error;
    }
}
```

#### 4d. 修改设置面板 UI

- [ ] **Step 4: 修改 createSidebar 中设置面板 HTML**

找到 `createSidebar` 中设置面板部分（约第581-593行），将：

```html
<p class="settings-hint">配置保存在浏览器本地，扩展不会自动读取项目目录下的 .env 文件。</p>
<label>DeepSeek API Key（用于 AI 总结功能）</label>
<input type="password" id="deepseekApiKey" placeholder="sk-xxxxxxxxxxxxxxxx" autocomplete="off" />
<button type="button" id="saveApiKeyBtn" class="save-webhook-btn" style="margin-bottom: 16px;">保存 API Key</button>
```

替换为：

```html
<p class="settings-hint">配置保存在浏览器本地，扩展不会自动读取项目目录下的 .env 文件。</p>
<label>🤖 AI 模型配置</label>
<input type="url" id="aiApiBaseUrl" placeholder="API Base URL，如 https://api.deepseek.com" autocomplete="off" />
<input type="text" id="aiModel" placeholder="模型名称，如 deepseek-v4" autocomplete="off" style="margin-top: 8px;" />
<input type="password" id="aiApiKey" placeholder="API Key，如 sk-xxxxxxxx" autocomplete="off" style="margin-top: 8px;" />
<button type="button" id="saveAiConfigBtn" class="save-webhook-btn" style="margin-bottom: 16px;">保存 AI 配置</button>
```

**注意：** 三个输入框的样式保持一致，使用 `width: 100%` 等已有样式。新添加的 `style="margin-top: 8px;"` 仅用于垂直间距。

#### 4e. 修改配置加载逻辑

- [ ] **Step 5: 修改 initializeSidebar 中配置加载**

找到 `initializeSidebar` 中的配置加载部分（约第768-774行）：

```javascript
chrome.storage.local.get([FLOMO_WEBHOOK_STORAGE_KEY, DEEPSEEK_API_KEY_STORAGE_KEY], (result) => {
    const webhookInput = getShadowElement('#flomoWebhookUrl');
    const apiKeyInput = getShadowElement('#deepseekApiKey');
    if (webhookInput) webhookInput.value = result[FLOMO_WEBHOOK_STORAGE_KEY] || '';
    if (apiKeyInput) apiKeyInput.value = result[DEEPSEEK_API_KEY_STORAGE_KEY] || '';
});
```

替换为：

```javascript
// 加载配置时先迁移旧配置
migrateLegacyConfig().then(() => {
    chrome.storage.local.get([
        FLOMO_WEBHOOK_STORAGE_KEY,
        AI_API_BASE_URL_STORAGE_KEY,
        AI_MODEL_STORAGE_KEY,
        AI_API_KEY_STORAGE_KEY
    ], (result) => {
        const webhookInput = getShadowElement('#flomoWebhookUrl');
        const baseUrlInput = getShadowElement('#aiApiBaseUrl');
        const modelInput = getShadowElement('#aiModel');
        const apiKeyInput = getShadowElement('#aiApiKey');
        if (webhookInput) webhookInput.value = result[FLOMO_WEBHOOK_STORAGE_KEY] || '';
        if (baseUrlInput) baseUrlInput.value = result[AI_API_BASE_URL_STORAGE_KEY] || '';
        if (modelInput) modelInput.value = result[AI_MODEL_STORAGE_KEY] || '';
        if (apiKeyInput) apiKeyInput.value = result[AI_API_KEY_STORAGE_KEY] || '';
    });
});
```

#### 4f. 替换保存 API Key 按钮逻辑

- [ ] **Step 6: 替换保存 API Key 按钮为通用配置保存**

找到保存 API Key 的按钮逻辑（约第808-829行）：

```javascript
// 保存 API Key 按钮
const saveApiKeyBtn = getShadowElement('#saveApiKeyBtn');
const apiKeyInput = getShadowElement('#deepseekApiKey');
if (saveApiKeyBtn && apiKeyInput) {
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            chrome.storage.local.remove([DEEPSEEK_API_KEY_STORAGE_KEY], () => {
                showMessage('API Key 已清除', 'success');
            });
            return;
        }
        if (!apiKey.startsWith('sk-')) {
            showMessage('API Key 格式不正确，应以 sk- 开头', 'error');
            return;
        }
        chrome.storage.local.set({ [DEEPSEEK_API_KEY_STORAGE_KEY]: apiKey }, () => {
            showMessage('API Key 已保存', 'success');
        });
    });
}
```

替换为：

```javascript
// 保存 AI 配置按钮
const saveAiConfigBtn = getShadowElement('#saveAiConfigBtn');
const baseUrlInput = getShadowElement('#aiApiBaseUrl');
const modelInput = getShadowElement('#aiModel');
const apiKeyInput = getShadowElement('#aiApiKey');
if (saveAiConfigBtn) {
    saveAiConfigBtn.addEventListener('click', () => {
        const baseUrl = baseUrlInput ? baseUrlInput.value.trim() : '';
        const model = modelInput ? modelInput.value.trim() : '';
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

        // 分别保存/清除每个字段
        const saveOrRemove = (key, value) => {
            return new Promise((resolve) => {
                if (!value) {
                    chrome.storage.local.remove([key], resolve);
                } else {
                    chrome.storage.local.set({ [key]: value }, resolve);
                }
            });
        };

        Promise.all([
            saveOrRemove(AI_API_BASE_URL_STORAGE_KEY, baseUrl),
            saveOrRemove(AI_MODEL_STORAGE_KEY, model),
            saveOrRemove(AI_API_KEY_STORAGE_KEY, apiKey)
        ]).then(() => {
            showMessage('AI 配置已保存', 'success');
        });
    });
}
```

#### 4g. 修改 AI 总结错误处理中的配置检测

- [ ] **Step 7: 更新 AI 总结错误处理中的提示信息**

找到 `aiSummaryBtn` 的点击事件处理中的错误处理（约第854-870行），将：

```javascript
if (error.message.includes('请先设置 DeepSeek API Key')) {
```

替换为：

```javascript
if (error.message.includes('请先在设置中配置 AI 模型')) {
```

- [ ] **Step 8: Commit AI 格式升级**

```bash
git add scripts/content.js
git commit -m "feat: AI总结升级为通用OpenAI格式，支持多模型配置"
```

---

### Task 5: 前端隐藏图片上传入口

**Files:**
- Modify: `scripts/content.js`

#### 5a. 添加开关常量

- [ ] **Step 1: 添加 ENABLE_IMAGE_UPLOAD 常量**

在 `scripts/content.js` 顶部常量区域（第1-2行附近），添加：

```javascript
const FLOMO_WEBHOOK_STORAGE_KEY = 'FLOMO_WEBHOOK_URL';
const ENABLE_IMAGE_UPLOAD = false; // 当前禁用图片上传（Flomo Webhook 不支持 Base64 图片）
```

#### 5b. 移除 HTML 模板中的上传按钮

- [ ] **Step 2: 移除两个编辑器工具栏中的 + 按钮**

找到 `createSidebar` 中摘要编辑器的工具栏（约第557-564行），将：

```html
<div class="editor-toolbar" data-target="summary">
    <button type="button" class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)">B</button>
    <button type="button" class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)">U</button>
    <button type="button" class="toolbar-btn" data-command="hiliteColor" data-value="#ffeb3b" title="高亮">🖍</button>
    <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">☰</button>
    <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="有序列表">1.</button>
    <button type="button" class="toolbar-btn upload-btn" data-target="summary" title="上传图片">+</button>
</div>
```

替换为：

```html
<div class="editor-toolbar" data-target="summary">
    <button type="button" class="toolbar-btn" data-command="bold" title="加粗 (Ctrl+B)">B</button>
    <button type="button" class="toolbar-btn" data-command="underline" title="下划线 (Ctrl+U)">U</button>
    <button type="button" class="toolbar-btn" data-command="hiliteColor" data-value="#ffeb3b" title="高亮">🖍</button>
    <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="无序列表">☰</button>
    <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="有序列表">1.</button>
</div>
```

同理，找到感想编辑器的工具栏（约第571-578行），移除其中的 `upload-btn` 按钮。

#### 5c. 修改 handlePaste 支持开关

- [ ] **Step 3: 修改 handlePaste 根据开关决定是否拦截图片**

找到 `handlePaste` 函数（约第1821行），将：

```javascript
function handlePaste(e) {
    const items = e.clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            hasImage = true;
            const blob = items[i].getAsFile();
            uploadImage(blob, this);
            break;
        }
    }

    if (!hasImage) {
        setTimeout(() => autoResizeEditor(this), 0);
    }
}
```

替换为：

```javascript
function handlePaste(e) {
    // 图片上传已禁用，不拦截图片粘贴
    if (!ENABLE_IMAGE_UPLOAD) {
        setTimeout(() => autoResizeEditor(this), 0);
        return;
    }

    const items = e.clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            hasImage = true;
            const blob = items[i].getAsFile();
            uploadImage(blob, this);
            break;
        }
    }

    if (!hasImage) {
        setTimeout(() => autoResizeEditor(this), 0);
    }
}
```

#### 5d. 修改 initializeFixedToolbars 中的上传按钮绑定

- [ ] **Step 4: 给上传按钮绑定加开关判断**

找到 `initializeFixedToolbars` 中上传按钮的绑定逻辑（约第1634-1643行）：

```javascript
// 图片上传按钮
const uploadBtn = toolbar.querySelector('.upload-btn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = uploadBtn.dataset.target;
        triggerImageUpload(targetId);
    });
}
```

替换为：

```javascript
// 图片上传按钮（仅在启用时绑定）
if (ENABLE_IMAGE_UPLOAD) {
    const uploadBtn = toolbar.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = uploadBtn.dataset.target;
            triggerImageUpload(targetId);
        });
    }
}
```

#### 5e. 添加图片后端代码保留注释

- [ ] **Step 5: 在图片相关函数区域前添加保留注释**

找到 `triggerImageUpload` 函数（约第1842行），在其之前添加：

```javascript
// ============================================================
// 图片上传功能（当前已禁用）
// 原因：Flomo Webhook 暂不支持 Base64 图片传递
// 前端上传入口已隐藏（ENABLE_IMAGE_UPLOAD = false）
// 以下代码保留，以便未来 Flomo 支持图片时快速恢复
// ============================================================
```

- [ ] **Step 6: Commit 图片隐藏改动**

```bash
git add scripts/content.js
git commit -m "feat: 前端隐藏图片上传入口，后端代码保留并加注释"
```

---

### Task 6: 更新文档

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

#### 6a. 更新 README.md

- [ ] **Step 1: 更新 README.md 功能说明和配置文档**

读取当前 `README.md`，然后进行以下修改：

1. 在功能列表中，将"AI 自动总结"更新为"AI 自动总结（支持 DeepSeek、硅基流动、Kimi、Qwen 等任意 OpenAI 兼容格式平台）"
2. 添加"已知限制"小节，说明：图片上传功能当前暂不可用（Flomo Webhook 不支持 Base64 图片）
3. 在配置说明中，新增"AI 模型配置"章节，说明三项配置：
   - API Base URL：如 `https://api.deepseek.com`
   - 模型名称：如 `deepseek-v4`
   - API Key：如 `sk-xxxxxxxx`
4. 更新版本号为 `0.1.3`

若 `README.md` 不存在或内容较少，则重写一份简洁的 README，包含：项目简介、功能特性、安装方法、配置说明（Webhook + AI模型）、已知限制。

#### 6b. 更新 CLAUDE.md

- [ ] **Step 2: 更新项目级 CLAUDE.md**

读取 `/Users/haixia/Downloads/编程/1历史编程练习/flomo_tool/CLAUDE.md`，进行以下修改：

1. 在"已知技术债务"部分，移除：
   - `⏳ **辅助阅读功能**：已注释停用，代码仍保留（低优先级）`

2. 在"重要决策"部分，添加：
   - `2026-05-06：AI 总结改为通用 OpenAI 格式，支持多模型配置（Base URL + 模型名 + API Key）`
   - `2026-05-06：图片上传功能前端隐藏，后端代码保留以备恢复`

3. 在"技术债务状态"部分，更新：
   - 移除辅助阅读条目
   - 添加：`⏳ **多模型配置**：已完成通用 OpenAI 格式改造，支持用户自定义 Base URL 和模型`
   - 将图片相关条目更新为：`⏳ **图片传递可靠性**：Flomo Webhook 暂不支持 Base64 图片，前端入口已隐藏，后端代码保留`

- [ ] **Step 3: Commit 文档更新**

```bash
git add README.md CLAUDE.md
git commit -m "docs: 更新 README 和 CLAUDE.md，反映多模型配置和重构内容"
```

---

## 最终验证

完成所有任务后，执行以下验证：

- [ ] **验证 1: 代码语法检查**

读取 `scripts/background.js`、`scripts/content.js`、`manifest.json`，确认无语法错误、无残留的旧常量引用（如 `DEEPSEEK_API_KEY_STORAGE_KEY` 不应再被非迁移代码使用）。

- [ ] **验证 2: Git 提交历史**

```bash
git log --oneline -6
```

应看到 6 条提交：
1. `refactor: 删除 background.js 中已停用的辅助阅读代码`
2. `refactor: 删除 content.js 中已停用的辅助阅读代码`
3. `chore(manifest): 移除辅助阅读资源引用，更新 host_permissions 和版本号`
4. `feat: AI总结升级为通用OpenAI格式，支持多模型配置`
5. `feat: 前端隐藏图片上传入口，后端代码保留并加注释`
6. `docs: 更新 README 和 CLAUDE.md，反映多模型配置和重构内容`

---

## Self-Review 结果

### Spec Coverage

| 设计文档章节 | 对应任务 |
|-------------|---------|
| 第1节：去除辅助阅读 | Task 1 (background.js) + Task 2 (content.js) + Task 3 (manifest) |
| 第2节：多模型支持与升级 | Task 4 (全部子步骤) |
| 第3节：隐藏图片上传 | Task 5 (全部子步骤) |
| 第4节：文档更新 | Task 6 (README + CLAUDE.md) |

无遗漏。

### Placeholder Scan

- 无 "TBD"、"TODO"、"implement later"
- 所有代码步骤均包含完整代码块
- 无 "Similar to Task N" 引用

### Type Consistency

- Storage key 常量命名一致：`AI_API_BASE_URL_STORAGE_KEY`、`AI_MODEL_STORAGE_KEY`、`AI_API_KEY_STORAGE_KEY`
- 函数名 `migrateLegacyConfig` 全局一致
- DOM ID 与 `getShadowElement` 调用一致：`#aiApiBaseUrl`、`#aiModel`、`#aiApiKey`

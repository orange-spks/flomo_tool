# 隐私政策 / Privacy Policy

**扩展名称：flomo 随记（flomo Memo）**
**最后更新：2026-11-04**

本扩展是第三方开源工具，与 flomo（浮墨笔记）官方无任何隶属关系。

---

## 一、中文版

### 1. 我们不收集任何数据

本扩展没有自建服务器，没有账号系统，也没有任何统计、埋点或遥测代码。
开发者**无法看到**你的浏览记录、笔记内容、Webhook 地址或 API Key。

### 2. 扩展会在什么情况下访问你的数据

| 数据 | 何时访问 | 为什么 | 去了哪里 |
|------|----------|--------|----------|
| 当前网页的标题、链接、正文 | 你点击扩展图标后 | 生成摘录草稿、供 AI 总结使用 | 仅在你点击「AI 总结」时，正文才会发往**你自己配置的** AI 服务商；否则只留在本机 |
| 你在编辑框输入的感想 | 你输入时 | 组成笔记内容 | 仅在你点击「发送」时，发往**你自己配置的** flomo Webhook 地址 |
| AI 服务的 API Key、模型名、Base URL | 你保存配置时 | 调用你自己的 AI 账号 | 保存在本机 `chrome.storage.local`，不上传任何第三方 |
| flomo Webhook 地址 | 你保存配置时 | 向你自己的 flomo 账号写入笔记 | 同上，仅保存在本机 |
| 剪贴板中的图片 | 你在编辑器内粘贴时 | 富文本插图 | 仅在本机读取，不上传 |

> 注：所有对外网络请求都由扩展的后台 Service Worker 直接发往你配置的地址，
> 不经过开发者或任何中转服务器。

### 3. 第三方服务

当你使用以下功能时，数据会直接发送给你自己配置的第三方，其处理方式适用该第三方的隐私政策：

- **flomo Webhook**（`https://flomoapp.com`）：接收你的笔记内容。
- **AI 服务商**（如 DeepSeek、硅基流动、Kimi、Qwen 或你自行填写的任意 OpenAI 兼容服务）：接收待总结的网页正文。

开发者不参与、也无法访问这些传输内容。

### 4. 数据存储与删除

- 配置（Webhook、API Key、模型名）只存在你本机的浏览器存储中。
- 清除方式：在扩展设置面板里清空对应输入框并保存，或直接卸载扩展（卸载会清除全部本地数据）。
- 扩展不在本地保存你的笔记历史。

### 5. 权限用途说明

| 权限 | 用途 |
|------|------|
| `activeTab` | 你点击图标时，读取当前标签页信息并在该页面显示侧边栏 |
| `scripting` | 把侧边栏脚本注入当前页面（仅在你点击图标后） |
| `tabs` | 判断当前标签页是否是特殊页面（如 `chrome://`），以便提示不可用 |
| `storage` | 在本机保存你的 Webhook 与 API 配置 |
| 访问所有网站 | 你可在任意网页上唤起侧边栏摘录内容；扩展不会在后台自动读取或上传任何页面 |

### 6. 不用于其他目的（Limited Use 声明）

本扩展对用户数据的处理遵守 Chrome Web Store 用户数据政策：
不向第三方出售数据；不将数据用于与扩展单一用途无关的目的；
不将数据用于判定信用、贷款或就业资格。

### 7. 打赏

设置面板中展示的收款码图片仅作自愿打赏用，不涉及任何支付信息采集。

### 8. 联系方式

如有疑问，请提交 Issue：<https://github.com/orange-spks/flomo_tool/issues>

---

## 二、English Version

### 1. We collect nothing

This extension has no backend server, no user accounts, and no analytics, tracking, or telemetry.
The developer cannot see your browsing history, notes, webhook URL, or API keys.

### 2. When the extension accesses your data

| Data | When | Why | Where it goes |
|------|------|-----|---------------|
| Current page title, URL, body text | After you click the extension icon | To build the clipping draft and for AI summary | Page body is sent only to the AI provider **you configured**, and only when you click "AI summary"; otherwise it stays local |
| Text you type in the editor | While you type | To compose the memo | Sent only to the flomo webhook **you configured**, and only when you click "Send" |
| AI API key, model name, base URL | When you save settings | To call your own AI account | Stored locally in `chrome.storage.local`; never uploaded |
| flomo webhook URL | When you save settings | To write memos into your own flomo account | Stored locally only |
| Images pasted from clipboard | When you paste in the editor | Rich-text images | Read locally only, never uploaded |

All outbound requests are made directly by the extension's background service worker to the
endpoints you configure. No developer-operated or proxy servers are involved.

### 3. Third-party services

- **flomo Webhook** (`https://flomoapp.com`) — receives your memo content.
- **AI providers** (DeepSeek, SiliconFlow, Kimi, Qwen, or any OpenAI-compatible endpoint you enter) — receive the page body to be summarized.

Their handling is governed by their own privacy policies. The developer has no access to these transmissions.

### 4. Storage and deletion

- Configuration lives only in your browser's local storage on your device.
- To delete: clear the field in the extension's settings panel and save, or uninstall the extension (uninstalling removes all local data).
- The extension does not keep a history of your memos.

### 5. Permissions

- `activeTab` — read current tab info and show the sidebar in that page, after you click the icon.
- `scripting` — inject the sidebar script into the current page, only after you click the icon.
- `tabs` — detect restricted pages such as `chrome://` to show a proper hint.
- `storage` — store your webhook and AI configuration locally.
- Access to all websites — so you can clip from any page you are reading; the extension never reads or uploads pages in the background.

### 6. Limited Use

Data handling complies with the Chrome Web Store User Data Policy: no sale of data, no use for
purposes unrelated to the extension's single purpose, and no use for creditworthiness,
lending, or employment eligibility determinations.

### 7. Donations

Tip QR codes shown in the settings panel are for voluntary donations only and involve no payment data collection.

### 8. Contact

Please open an issue: <https://github.com/orange-spks/flomo_tool/issues>

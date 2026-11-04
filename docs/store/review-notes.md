# 审核用文本（单一用途 / 权限说明 / 审核备注）

> 提交时后台会问一堆「为什么需要这个权限」。这些字段**建议填英文**——审核员多数看英文，
> 中文能过但会慢一点。每段都给了可直接复制的英文原文。

---

## 1. 单一用途说明（Single Purpose）

**English（复制这段）**

```
flomo Memo lets users clip content from the web page they are reading and save it to their own flomo notes. The extension has one purpose: capture-and-send. The side panel, rich text editor, page text extraction and optional AI summary all exist only to prepare and deliver that single note.
```

**中文对照**

> 本扩展只做一件事：把当前网页上你选中的内容整理成一条笔记，发到你自己配置的 flomo Webhook。
> 侧边栏、富文本编辑、正文提取、AI 总结都只是为这一件事服务。

---

## 2. 权限说明（Permission justification）

后台会逐条列出 manifest 里的权限，每个权限一个输入框。按下表粘。

### 2.1 `activeTab`

```
Used to read the current tab's title and URL and to show the side panel in that tab, only after the user clicks the extension icon. The extension never touches other tabs.
```

### 2.2 `scripting`

```
Used to inject the side panel script into the current page after the user clicks the extension icon. The sidebar is not a static content script; it is injected on demand so that pages the user never clips are left untouched. Injection only happens inside the click handler of the toolbar icon.
```

### 2.3 `tabs`

```
Used to read the active tab's URL so the extension can (a) prefill the page title and link the user is clipping, and (b) detect browser-internal pages such as chrome:// or edge:// where script injection is not allowed, and show a clear message instead of failing silently. The extension does not read, log or transmit browsing history.
```

### 2.4 `storage`

```
Used to store the user's own configuration - flomo webhook URL, AI API base URL, model name and API key - in chrome.storage.local on the user's device. Nothing is uploaded anywhere; there is no developer server.
```

### 2.5 Host permission `<all_urls>`

```
Two reasons:
1) The user can clip from any page they are reading, so the side panel must be injectable on any site on demand (not automatically).
2) The AI summary feature must call the OpenAI-compatible endpoint the user configured themselves. Users may enter a provider we did not anticipate (DeepSeek, SiliconFlow, Kimi, Qwen, a self-hosted gateway, an internal address), so a fixed allowlist would break the feature.

All outbound requests are made by the extension's service worker and go only to endpoints the user explicitly configured. The extension never contacts any developer-operated server, and never sends data anywhere the user did not choose.
```

### 2.6 Content script match `<all_urls>` (`scripts/key-blocker.js`)

> 这个静态 content script 是最可能被追问的一项，一定要说清楚「它不读页面内容，只处理键盘事件」。

```
This is a keyboard-event guard, not a data collector. While the user types inside the extension's own side panel, sites such as YouTube or Bilibili register global key handlers on document and hijack keys (space, arrows, letters). The guard runs in the capture phase at document_start so it can run before those page handlers, and it calls stopImmediatePropagation ONLY when the event target is inside the extension's own shadow DOM and inside an editable field. It never calls preventDefault, never reads page content, never reads or writes storage, and never sends messages. For every event outside the side panel it returns immediately without side effects.
```

---

## 3. 是否使用远程代码（Remote code）

选择 **No, I am not using remote code**。

补充说明（若后台有备注框）：

```
All JavaScript, CSS and images are bundled inside the package. The extension does not download or evaluate code at runtime: no eval(), no new Function(), no remote script injection. Network requests are limited to data: sending the page excerpt to the AI endpoint the user configured, and posting the finished note to the user's own flomo webhook.
```

---

## 4. 数据使用申报（Data usage checkboxes）

Chrome / Edge 会让你勾选「收集哪些用户数据」，并要你承诺三条 Limited Use 声明。
**宁可多勾，不要漏勾**——漏勾属于政策违规，多勾只是说明更充分。

| 类别 | 勾不勾 | 说明（可在备注里写） |
|------|--------|----------------------|
| Website content（网站内容） | ✅ 勾 | 只在用户点「AI 总结」时把正文发给他自己配置的 AI 服务商 |
| Authentication information（身份验证信息） | ✅ 勾 | API Key 只存本地，用于向用户自己的 AI 服务商认证 |
| Web history（网页浏览活动） | ✅ 勾 | 只读当前标签页 URL，用于填入笔记里的原文链接 |
| 其余（健康、财务、位置、个人通讯、PII 等） | ❌ 不勾 | 扩展完全不涉及 |

三条承诺一律 ✅ 勾上：

1. 不出售或转让用户数据给第三方（除经批准的使用场景）
2. 不将数据用于与扩展单一用途无关的目的
3. 不将数据用于判定信用、贷款或就业资格

---

## 5. 审核备注（Notes for certification）

Chrome 的「审核备注」、Edge 的「Notes for certification」都支持英文，直接粘这段：

```
HOW TO TEST (no account, no payment, no configuration required)

1. Install the extension. Open any normal article page, e.g. https://en.wikipedia.org/wiki/Marginalia
2. Click the flomo Memo icon in the toolbar. A 400px panel slides in from the right of the page.
   The panel automatically fills in the page title and URL.
3. Type or paste text into the "原文摘要" (excerpt) field. Use the bold / bullet / numbered-list
   buttons in the small toolbar under the field, or Ctrl+B / Ctrl+I. Selecting text shows a
   floating toolbar. All of this works offline and requires no configuration.
4. Type into the "个人感想" (thoughts) field.
5. Clicking "提交到 Flomo" (send) without configuration shows a red inline message asking the user
   to set a webhook - this is expected, not an error state.

FEATURES THAT REQUIRE THE USER'S OWN CREDENTIALS (by design)

- "AI总结" (AI summary) calls an OpenAI-compatible endpoint that the user configures in the
  Settings section of the panel (API base URL + model + API key). We do not ship, proxy or resell
  any AI service, so this cannot be tested without the tester's own key. Without a key the button
  shows a message asking the user to configure it first.
- "提交到 Flomo" needs the user's own flomo Incoming Webhook URL, which any free flomo account can
  generate: flomo web app > Settings > API & third-party apps > Incoming Webhook.

WHAT THE EXTENSION DOES NOT DO

- No analytics, telemetry, tracking pixels or remote logging of any kind.
- No developer-operated server exists. All requests go only to endpoints the user entered.
- No remote code. All JS/CSS/images are bundled in the package.
- The declared content script (key-blocker.js) does not read page content. It only stops keyboard
  events from reaching page-level shortcuts (YouTube, Bilibili) while the user types inside the
  extension's own side panel; it returns immediately for any event outside that panel.
- The donation QR images in the Settings panel are voluntary tips only; no payment flow exists and
  no payment data is collected.

PRIVACY POLICY: {{PRIVACY POLICY URL}}
```

---

## 6. 这个项目已知的 4 个审核风险点

| # | 风险 | 触发概率 | 处理方式 |
|---|------|----------|----------|
| 1 | 名称里带「flomo」，可能被判定为冒用他人品牌（Chrome 政策 1.4） | 中 | 详情页已写「第三方工具、与官方无关」。若被拒，把商店名称改成「随记 · 网页剪藏助手」，描述里保留「兼容 flomo」字样即可（代码不用动） |
| 2 | `key-blocker.js` 在全部网站 document_start 运行 | 中 | 用第 2.6 节的说明。若仍被追问，可改成「点击图标后才注入」（需要改代码，见 submit-guide 第 7 节） |
| 3 | `<all_urls>` 主机权限过宽 | 中高 | 用第 2.5 节的说明。Chrome 大概率人工复核，Edge 通常更宽松 |
| 4 | 打赏收款码图片 | 低 | 捐赠不违规，但审核员可能问「是不是付费功能」。说明里已写明「自愿打赏、无支付流程」；实在被卡就把 `images/donate-*.jpg` 和设置面板里那段 HTML 删掉重新打包 |

> 另外提醒：`manifest.json` 里的 `host_permissions` 目前同时列了 `<all_urls>` 和 4 个具体域名，
> 后者是冗余的（`<all_urls>` 已覆盖）。这不会导致拒绝，但属于「权限写得不够干净」，
> 审核员可能顺手提一句。想更保险可以把那 4 行具体域名删掉——不影响任何功能。

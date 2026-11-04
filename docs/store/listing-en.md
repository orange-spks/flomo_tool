# Store listing copy (English / en)

> The package ships two locales (`zh_CN` and `en`), so both Chrome and Edge will show
> an English listing row that also needs text. Paste the blocks below.
> If you only want Chinese, remove the English row in the dashboard (Edge: **Remove**;
> Chrome: just don't fill it).

---

## 1. Name (≤ 45 chars on Edge, ≤ 75 on Chrome)

```
flomo Memo · Web Clipper
```

The name shown in the store comes from the manifest (`_locales/en/messages.json` →
`appName`, currently `flomo Memo`). To show the longer name above, change that value and rebuild.

---

## 2. Short description (≤ 132 chars)

```
Clip web pages with one click, summarize with AI, and save to your flomo notes.
```

This is also what Edge reads from the manifest `description` field
(`_locales/en/messages.json` → `appDescription`), currently:

```
Clip web content with one click, auto-summarize with AI, and save to flomo notes
```

---

## 3. Detailed description (≥ 250 chars)

```
flomo Memo is a browser extension that turns any web page into a flomo note in a few seconds. Read something worth keeping, click the toolbar icon, and a side panel opens on the right of the page - no tab switching.

FEATURES
- One-click side panel: opens over any page you are reading
- Auto-filled title and URL: no copy-paste needed
- Rich text editor: bold, bulleted and numbered lists, keyboard shortcuts, and a floating toolbar when you select text
- AI summary (optional): extracts the page body and produces keywords plus a short summary, using any OpenAI-compatible endpoint such as DeepSeek, SiliconFlow, Kimi or Qwen
- Markdown that survives: the extension converts rich text into the Markdown subset flomo renders correctly
- Local-only configuration: your webhook URL, API base URL, model name and API key are stored in your own browser

HOW TO USE
1. Open any web page and click the flomo Memo icon in the toolbar.
2. The panel fills in the page title and link. Paste the passage you want to keep, then add a line or two of your own thoughts.
3. Click "Send to Flomo" and the note appears in your flomo account.

FIRST-TIME SETUP (in the panel's Settings section)
1. Flomo webhook: flomo web app > Settings > API & third-party apps > copy the Incoming Webhook URL, then paste and save.
2. AI provider (optional - clipping works without it): enter the API base URL, model name and API key. For example DeepSeek: https://api.deepseek.com with deepseek-chat.

PRIVACY
There is no backend server, no account system and no analytics. Page content is sent only to the AI provider you configure, and only when you press "AI summary". Notes are sent only to your own flomo webhook, and only when you press "Send". Full policy: {{PRIVACY POLICY URL}}

DISCLAIMER
This is a third-party tool, not affiliated with flomo. The name "flomo" is used only to describe compatibility. AI usage costs are billed by the provider you choose.

FAQ
Q: Can I use it without an AI key? Yes. Summarizing is optional.
Q: Which pages are supported? Nearly all http/https pages. Browser-internal pages (chrome://, edge://) cannot host injected scripts.
Q: Where is my configuration stored? In browser local storage only. It is never uploaded and does not sync across devices. Uninstalling removes it.
```

---

## 4. Category

- Chrome: `Productivity`
- Edge: `Productivity`

---

## 5. Search terms (Edge only, ≤ 7 terms / 21 words)

```
flomo, web clipper, notes, AI summary, highlight, bookmark
```

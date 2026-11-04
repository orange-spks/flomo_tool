# 商店文案（中文 / zh_CN）

> 直接复制粘贴到 Chrome Web Store 或 Edge Add-ons 的对应字段。
> 本文里的隐私政策链接已经填好（已实测公网可访问），直接复制即可。

---

## 1. 名称（Name）

```
flomo 随记 · 网页剪藏助手
```

- Chrome 名称上限 75 字符，Edge 上限 45 字符，上面这串 16 个字符，两边都够。
- 名称由 manifest 的 `name` 决定（当前是 `flomo_随记`）。如果商店里要显示成上面这串，
  需要把 `_locales/zh_CN/messages.json` 的 `appName` 改成 `flomo 随记 · 网页剪藏助手` 后重新打包。

---

## 2. 简短说明（Short description，Chrome 上限 132 字符）

```
一键摘录网页内容，AI 自动总结，同步到 flomo 笔记。支持 DeepSeek 等任意 OpenAI 兼容模型。
```

Edge 的「简短说明」读的是 manifest 里的 `description` 字段（`_locales/zh_CN/messages.json`
的 `appDescription`），当前值是：

```
一键摘录网页内容，AI 自动总结，同步到 flomo 笔记
```

> 想改 Edge 的简短说明，必须改 manifest 后重新上传 zip；Chrome 的可以只改后台。

---

## 3. 详细说明（Detailed description / Description）

Edge 要求每个语言至少 250 字符，Chrome 没有硬性下限但建议写全。以下正文可直接粘贴：

```
「flomo 随记」是一款把网页内容快速收进 flomo 的浏览器扩展。看到值得留下的段落，点一下图标，右侧弹出编辑面板，摘抄、加一句自己的感想，点「提交到 Flomo」，笔记就同步过去了。

【核心功能】
· 一键唤起：点击工具栏图标，在任意网页右侧呼出编辑面板，不离开当前页面
· 自动带入：自动抓取当前网页的标题与链接，省去复制粘贴
· 富文本编辑：加粗、无序列表、有序列表，支持 Ctrl+B / Ctrl+I 等快捷键；选中文字会弹出浮动工具栏
· AI 总结：一键提取网页正文并总结（关键词 + 摘要），支持 DeepSeek、硅基流动、Kimi、Qwen 等任意 OpenAI 兼容接口
· Markdown 同步：提交时自动把富文本转换成 flomo 可正确渲染的 Markdown（加粗、列表、段落分隔）
· 配置本地保存：Webhook 地址、API 地址、模型名、API Key 全部存在浏览器本地，不上传任何服务器

【怎么用】
1. 打开任意网页，点击浏览器工具栏上的「flomo 随记」图标
2. 侧边栏会自动填好标题和链接；把想留的段落粘贴到「原文摘要」，在「个人感想」写两句自己的话
3. 点「提交到 Flomo」，笔记即刻进入你的 flomo 账号

【首次使用需要配置两处（都在侧边栏的「设置」里）】
1. Flomo Webhook：打开 flomo 网页版 → 设置 → API 与第三方应用 → 复制 Incoming Webhook 地址，粘贴保存
2. AI 模型（可选，不配置也能正常摘录提交）：填入 API Base URL、模型名称、API Key
   例如 DeepSeek：https://api.deepseek.com + deepseek-chat
   例如硅基流动：https://api.siliconflow.cn/v1 + deepseek-ai/DeepSeek-V3

【隐私说明】
本扩展没有自建服务器，没有账号系统，也没有任何统计埋点。
网页内容只会在你点击「AI 总结」时发送给你自己配置的 AI 服务商；笔记只会在你点击「提交」时发送给你自己的 flomo Webhook。
完整的隐私政策：https://github.com/orange-spks/flomo_tool/blob/main/PRIVACY.md

【免责声明】
本扩展为第三方工具，与 flomo（浮墨笔记）官方无隶属关系；「flomo」名称仅用于说明兼容目标。
使用 AI 总结功能产生的 API 费用由你与对应服务商结算。

【常见问题】
Q：不配置 AI 也能用吗？
A：可以。AI 总结是可选功能，摘录与提交不依赖它。

Q：支持哪些网页？
A：绝大多数 http/https 网页。浏览器内置页面（如 chrome://、edge://）和部分商店页面不允许注入脚本，属浏览器限制。

Q：配置存在哪里？会同步吗？
A：存在浏览器本地存储（chrome.storage.local），不上传、不跨设备同步。卸载扩展会一并清除。

Q：提交后格式不对？
A：flomo 的 Markdown 解析器不支持高亮和非标准语法，扩展会把高亮/下划线自动降级为加粗；对应按钮也已禁用，避免误解。
```

> Chrome 的详细说明支持换行，直接粘即可；如果后台提示字符超限，把「常见问题」整段删掉。

---

## 4. 分类（Category）

- Chrome：`生产力工具`（Productivity）
- Edge：`工作效率`（Productivity）

---

## 5. 语言（Language）

- 主语言：`中文（简体）`
- 如需英文列表，见 [listing-en.md](listing-en.md)

---

## 6. 隐私 / 支持链接

| 字段 | 填什么 |
|------|--------|
| 隐私政策 URL | `https://github.com/orange-spks/flomo_tool/blob/main/PRIVACY.md` |
| 支持 URL / 主页 | `https://github.com/orange-spks/flomo_tool` |
| 支持邮箱 | 你的常用邮箱（建议专门注册一个，会公开显示） |

> 隐私政策必须公网可访问。上面的 GitHub 地址要求仓库是 Public（当前已是）。
> 如果以后想更好看，可以开 GitHub Pages 变成 `https://orange-spks.github.io/flomo_tool/PRIVACY.html`。

---

## 7. 搜索关键词（Edge 可填，Chrome 不填）

```
flomo 剪藏 摘录 笔记 收藏 AI 总结 网页
```

Edge 限制：最多 7 个词条、总字数 21 个词。上面这行已满足。

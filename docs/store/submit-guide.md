# 上架指南：从零到发布（Chrome / Edge）

> 面向第一次上架的人写的，每一步都写了「点哪里、填什么、粘哪段」。
> 配套文件：`listing-zh.md`（文案）、`listing-en.md`（英文文案）、`review-notes.md`（审核备注）。

---

## 🚦 当前状态（2026-11-04 实测）

**Edge 路线暂时走不通，已改走 Chrome。** 原因不是操作问题：新注册的 outlook 个人账号访问
`partner.microsoft.com/dashboard/microsoftedge/public/login` 会被踢回空白主页
（`/zh-cn/dashboard/home`，只有「工作区 · 我的访问权限 ＋」和一串 No quick starts）。
这是 Partner Center 侧的程序注册状态问题，微软论坛的社区解答明确说用户自己修不了、只能提工单：

- [Cannot Enroll in Microsoft Edge Add-ons Program – Redirects to Partner Center Home](https://learn.microsoft.com/en-nz/answers/questions/5555337/cannot-enroll-in-microsoft-edge-add-ons-program-re)
- [Fix Microsoft Edge Add-ons Enrollment Redirect Loop in Partner Center](https://en.ittrip.xyz/windows/edge/edge-addons-redirect-loop)

所以现在按 **Chrome 优先**执行；Edge 那节（第 3 节）保留，等哪天微软修好了或工单回了再走。

### 最短路径：只剩 4 步

| 步 | 做什么 | 用到的文件 |
|----|--------|-----------|
| 1 | 本地验收 2 分钟：`chrome://extensions` → 开发者模式 → 加载已解压 → 选 `dist/unpacked` → 点图标试一遍 | `dist/unpacked/` |
| 2 | 注册 Chrome 开发者（约 5 美元，一次性）+ 开两步验证 | — |
| 3 | 上传 zip，填 Store listing | `dist/flomo-memo-v1.0.0.zip` + `listing-zh.md` + `assets/` |
| 4 | 填 Privacy practices，提交审核 | `review-notes.md` |

---

## 0. 先说清楚：哪些我做完了、哪些必须你亲手做

✅ **我已经做好的**

| 项目 | 结果 |
|------|------|
| 商店发布包 | `dist/flomo-memo-v1.0.0.zip`（180 KB，16 个文件） |
| 打包脚本 | 新增 `build.sh`（macOS 可用；原来的 `build.ps1` 只能在 Windows 跑） |
| 包结构校验 | 用 Chrome 自带的 `--pack-extension` 打过一次，Chrome 接受该包，无 manifest 错误 |
| 审核硬伤修复 | 删掉了未使用的 `notifications` 权限；把过宽的 `web_accessible_resources` 收窄到 2 张图片 |
| 隐私政策 | `PRIVACY.md`（中英双语，商店要求的必填项） |
| 商店截图 | `docs/store/assets/screenshots/` 3 张 1280×800 |
| 宣传图 | 小图 440×280、大图 1400×560、Logo 300×300 |
| 商店文案 | 中文 + 英文详细说明，可直接复制 |
| 权限说明 / 单一用途 / 审核备注 | `review-notes.md`，英文原文可直接粘贴 |

❌ **必须你本人操作（我无法代做）**

| 事项 | 原因 |
|------|------|
| 注册开发者账号 | 需要你的 Microsoft / Google 账号登录、邮箱验证码、身份信息 |
| 支付 Chrome 的注册费 | 需要你自己的银行卡（一次性约 5 美元） |
| 开启两步验证 | 必须绑定你本人的手机 |
| 在后台点「发布」 | 需要你的账号会话与法律条款同意 |
| 5 分钟真机冒烟测试 | 见下面第 6 节（重要） |

---

## 1. 结论：先上 Edge，再上 Chrome

| 对比项 | Edge Add-ons | Chrome Web Store |
|--------|--------------|------------------|
| 注册费 | **免费** | 一次性约 **5 美元**（需双币/外币卡） |
| 账号 | 任意 Microsoft 账号（QQ/163 邮箱也能注册） | Google 账号；需邮箱验证 + **强制两步验证** |
| 账号类型 | 选「个人 Individual」审核最快 | 无个人/企业之分，但需填公开联系地址 |
| 审核时长 | 官方口径最长 7 个工作日，实测常见 1–3 天 | 常见 1–3 天，权限宽时可能拖到 1–2 周 |
| 审核严格度 | 相对宽松，对「Chrome 扩展移植」友好 | 更严格，`<all_urls>` 基本会人工复核 |
| 包的格式 | 同一个 zip | 同一个 zip |

> ⚠️ 2026-11-04 实测：Edge 的注册入口被 Partner Center 的状态问题卡死（见文首「当前状态」），
> 所以下面这个「先 Edge 后 Chrome」的顺序**暂时作废**，改为**直接走 Chrome**（第 4 节）。

**原计划（供参考）：先拿 Edge 把「已上架」跑通，全程零成本；跑通后再花 5 美元上 Chrome。**
两个商店提交的是**完全相同的 zip**，文案素材也通用，第二次会快很多。

---

## 2. 你需要提前准备的东西

- [ ] 一个 Microsoft 账号（没有就现注册，`account.microsoft.com`，用 QQ/163 邮箱即可）
- [ ] 一个 Google 账号（上 Chrome 时才需要，且必须能收邮件）
- [ ] 一个**公开可访问的邮箱**（会显示在商店页面上，建议单独注册一个，别用主邮箱）
- [ ] 信用卡/借记卡（仅 Chrome 需要，约 5 美元）
- [ ] 你的公开联系地址（Chrome 会要求填写，会公开展示）
- [ ] 本项目的 `dist/flomo-memo-v1.0.0.zip`

不需要：服务器、域名、ICP 备案、公司资质。

---

## 3. 上架 Edge（⚠️ 当前被微软侧问题卡住，暂时跳过，直接看第 4 节）

### 3.1 注册开发者账号（免费）

1. 打开 <https://partner.microsoft.com/dashboard/microsoftedge/public/login>
2. 用 Microsoft 账号登录（没有就点「创建」）
3. 左侧 `账户设置 | 计划`（Account settings | Programs）→ 找到 **Microsoft Edge** 卡片 → 点 **开始使用**（Get started）
4. 在 **Microsoft Edge Developer Account Registration** 表单里填写：
   - **Account country/region**：`China`（注册后不可改）
   - **Account type**：选 **Individual（个人）** ← 关键，个人账号验证快，不需要营业执照
   - **Publisher display name**：最多 50 字符，会公开显示。建议填 `orange-spks` 或你的昵称（别填「flomo 官方」这类会被判冒用的名字）
   - **Contact info**：填真实姓名 + 常用邮箱（会收到验证邮件）
   - 勾选 **I accept the terms and conditions**
5. 点 **Finish**，去邮箱点验证链接
6. 回到 Partner Center → 打开 `Account settings` → 确认状态从 `Pending` 变成已验证
   （个人账号通常几分钟到 1 天；等验证期间可以先去准备扩展资料）

### 3.2 创建扩展并上传 zip

1. Partner Center 左侧 **Workspaces** → **Edge** 卡片 → **Create new extension**
2. 把 `dist/flomo-memo-v1.0.0.zip` 拖进上传区（或 Browse your files）
3. 等它校验通过 → 左侧点 **Packages** → **Continue**

> 会在下方出现**两个语言行**：`English (en)` 和 `Chinese (Simplified) (zh_CN)`，
> 因为包里带了 `_locales/zh_CN` 和 `_locales/en`。两个都要填文案和 Logo，
> 填好后在其中一个点 **Duplicate** 可以把图片一键复制到另一个语言。

### 3.3 Availability（可见性）

- **Visibility**：`Public`
- **Markets**：保持默认（全部市场）即可
- → **Save & Continue**

### 3.4 Properties（属性）

| 字段 | 填什么 |
|------|--------|
| Category | `Productivity` |
| Website | `https://github.com/orange-spks/flomo_tool` |
| Support contact detail | `https://github.com/orange-spks/flomo_tool/issues` |
| Mature content | 不勾 |

→ **Save & Continue**

### 3.5 Privacy（隐私：最重要的一页）

全部按 `review-notes.md` 里的英文原文粘：

| 区块 | 操作 | 素材位置 |
|------|------|----------|
| Single Purpose | 粘英文那段 | review-notes.md 第 1 节 |
| Permission justification | 每个权限框粘对应英文 | review-notes.md 第 2 节（逐条对应） |
| Are you using remote code? | 选 **No** | review-notes.md 第 3 节 |
| Data usage | 勾「Website content」「Authentication information」「Web history」+ 三条承诺全勾 | review-notes.md 第 4 节 |
| Privacy policy URL | `https://github.com/orange-spks/flomo_tool/blob/main/PRIVACY.md` | PRIVACY.md |

→ **Save & Continue**

### 3.6 Store listings（商店页面）

分别编辑 `zh_CN` 和 `English` 两行，**Description 至少 250 字符**（粘贴的文案已满足）。
图片素材对应关系：

| 字段 | 上传哪个文件 | 要求 |
|------|--------------|------|
| Extension logo | `docs/store/assets/logo-300x300.png` | 1:1，300×300 ✅ |
| Small promotional tile | `docs/store/assets/promo-440x280.png` | 440×280 ✅ |
| Large promotional tile | `docs/store/assets/promo-1400x560.png` | 1400×560 ✅ |
| Screenshots | `docs/store/assets/screenshots/01、02、03` | 1280×800，最多 6 张 ✅ |
| Description | 粘 `listing-zh.md` 第 3 节 / `listing-en.md` 第 3 节 | ≥250 字符 |
| Short description | 由 manifest 决定，无需填 | — |
| Search terms | `listing-zh.md` 第 7 节 | 最多 7 个词 |
| YouTube video | 跳过 | — |

填完 → **Save draft** → 两个语言行状态都变 `Complete`

### 3.7 提交审核

1. 右上角点 **Publish**
2. 在 **Notes for certification** 里粘 `review-notes.md` 第 5 节英文备注
   （这段很关键：告诉审核员「AI 和提交需要用户自己的密钥，这是设计如此」）
3. 再点 **Publish**
4. 状态变 `In review`，最长 7 个工作日；通过后变成 **In the Store**

---

## 4. 上架 Chrome Web Store（Edge 通过后再做）

> 细分清单见 **`chrome-submit.md`**（逐字段照抄 + Chrome 与 Edge 的 5 处差异 + 驳回对照表）。
> 下面只留最关键的顺序。

### 4.1 注册开发者账号（付费）

1. 打开 <https://chrome.google.com/webstore/devconsole>
2. 用 Google 账号登录 → 首次进入会要求注册开发者：填开发者名称、邮箱、**公开联系地址**
3. 支付一次性注册费（约 5 美元），需要外币卡（Visa/Mastercard/银联部分可用）
4. 该 Google 账号必须**开启两步验证**，否则无法发布
5. 验证联系邮箱（点邮件里的链接）

### 4.2 上传 + 填写

1. 点 **Add new item** → 上传 `dist/flomo-memo-v1.0.0.zip`
   （只建一个 item；重复创建会生成两条独立记录，商店里出现两个一样的扩展）
2. **Store listing** 标签页：
   - Name：**没有这个框**。商店标题 = manifest 的 `name`，当前是 `flomo 随记`（2026-11-04 已从
     `flomo_随记` 改掉并重新打包），后台改不了；要改只能改 `_locales/zh_CN/messages.json` 的 `appName` 再重新打包
   - Short description：`listing-zh.md` 第 2 节（58 字符，上限 132）
   - Detailed description：`listing-zh.md` 第 3 节
   - Category：`Productivity`
   - Language：`中文（简体）`
   - Store icon：包里已有 128×128，无需另传
   - Screenshots：`01/02/03` 三张 1280×800（上限 5 张，需要 640×400 的话我可以再出）
   - Small promo tile：`promo-440x280.png`
   - Large promo tile / Marquee：`promo-1400x560.png`
3. **Privacy practices** 标签页：
   - Single purpose：review-notes.md 第 1 节
   - 每个权限的 justification：review-notes.md 第 2 节
   - Remote code：选 **No**
   - 数据用途：按 review-notes.md 第 4 节勾选 + 三条承诺
   - Privacy policy URL：上面那个 GitHub 链接
4. **Distribution** 标签页：可见性 `Public`，地区全选，价格免费
   - 这里可能还会问 **Trader status（交易者身份）**（欧盟 DSA 要求）。选 `Non-trader`（个人开发者）的代价是扩展在欧盟地区不可见；想覆盖欧盟就选 `Trader`，并填写你的公开联系信息。按自己需要选，两者都不影响国内用户。
5. 右上角 **Submit for review**（备注框同样粘 review-notes.md 第 5 节）

---

## 5. 提交后会发生什么

| 状态 | 含义 | 你该做什么 |
|------|------|------------|
| In review / 审核中 | 排队或人工复核 | 什么都不用做，别重复提交 |
| 已发布 / In the Store | 上线了 | 把商店链接发出去 |
| 被拒（Rejected） | 会写明违反的政策条目 | 按第 7 节对照改，改完重新提交（不额外收费） |

被拒**不等于**封号，绝大多数是「权限说明不够清楚」或「隐私政策没对上」，补文案就能过。

---

## 6. 上架前请你自己跑一遍这 5 分钟验收（重要）

我这边做了：包结构校验（Chrome 亲自打包通过）、用真实 `content.js` + 真实 CSS 渲染截图、
静态代码走查。但**我没有以「已安装扩展」的方式真机跑过**——你机器上的 Chrome 157 已经禁用了
`--load-extension` 参数，自动化加载扩展这条路走不通，所以这一步只能你在本地点几下确认。

- [ ] 打开 `chrome://extensions` → 右上角开「开发者模式」→ **加载已解压的扩展程序** → 选项目里的 `dist/unpacked` 文件夹（`build.sh` 每次打包都会重建它）
- [ ] 随便打开一个新闻/博客网页，点工具栏图标 → 右侧侧边栏出现
- [ ] 标题、链接自动填好
- [ ] 在「原文摘要」里粘一段话，点加粗 → 文字变粗；选中文字 → 浮动工具栏出现
- [ ] 「设置」里填 Webhook（flomo → 设置 → API 与第三方应用 → Incoming Webhook）→ 保存 → 点「提交到 Flomo」→ flomo 里能看到这条笔记
- [ ] （可选）填 AI 的 Base URL / 模型 / Key → 点「AI总结」→ 能出关键词和摘要

任何一步不对，回来告诉我，改完重新 `bash build.sh` 再上传即可。

---

## 7. 常见问题

**Q：包里的 `key-blocker.js` 会不会被判定为「窥探所有网站」？**
A：不会，前提是权限说明写清楚。它只在焦点位于扩展自己的侧边栏输入框时拦截键盘事件，
页面其他地方的按键它立刻放行。说明原文在 `review-notes.md` 第 2.6 节。
如果审核员仍然要求收敛，有两个改法（我可以帮你改）：
1. 把 `key-blocker.js` 从 `content_scripts` 挪到 `optional_permissions`，用户首次使用时申请；
2. 改成点击图标后再用 `chrome.scripting.executeScript` 注入。

**Q：`<all_urls>` 能不能改成具体域名？**
A：不能，因为你要在任意网页上摘录。但可以拆成「`content_scripts` 匹配全站 + `host_permissions`
只留用户配置的 AI 域名」，代价是用户换 AI 服务商需要手动授权域名。目前保持现状 + 写好说明是更优解。

**Q：会不会因为用了「flomo」这个名字被拒？**
A：有这个风险，但详情页已明确写「第三方工具，与 flomo 官方无隶属关系」。若被拒：
- **Edge**：改后台的商品名即可，代码和包都不用动
- **Chrome**：商店标题来自 manifest，改后台没用，必须把 `_locales/*/messages.json` 的 `appName`
  改成 `随记 · 网页剪藏助手`，再 `bash build.sh` 重新上传（描述里保留「兼容 flomo」字样）

**Q：上架要钱吗？用户下载要钱吗？**
A：Edge 免费；Chrome 一次性 5 美元（只交一次，以后更新不再收费）；用户下载免费。

**Q：需要服务器吗？需要备案吗？**
A：都不需要。扩展没有后端，数据从你的浏览器直接发到 flomo 或你配置的 AI 服务商。
GitHub 上的隐私政策页面也不需要备案。

**Q：以后更新版本怎么发？**
A：
1. 改 `manifest.json` 的 `version`（例如 `1.0.1`，必须比线上高）
2. 跑 `bash build.sh` 生成新 zip
3. 后台选「包 / Packages」→ 上传新 zip → 提交审核
4. 用户几小时内自动更新

**Q：隐私政策必须自己搭网站吗？**
A：不用。现在用的是 GitHub 上的 `PRIVACY.md` 页面（仓库已是 Public），两个商店都接受这种链接。

**Q：两个商店能同时上吗？会不会冲突？**
A：可以同时上，互相独立。Edge 商店也接受 Chrome 的包，反之亦然。

# Chrome Web Store 提交清单（v1.0.0）

> 这份是**对着后台逐字段照抄**用的，比 `submit-guide.md` 第 4 节更细。
> 文案正文在 `listing-zh.md` / `listing-en.md`，权限说明在 `review-notes.md`，本文只写「Chrome 特有的坑 + 每个框填什么」。
> 后台地址：<https://chrome.google.com/webstore/devconsole>

---

## 0. 先看结论

包没问题，剩下的阻力全在**账号和表单**这一层：

- 安装包已用 Chrome 157 自带的打包器（`--pack-extension`）验过，退出码 0，无 manifest 报错 → 上传不会被「包结构」卡住
- 但 Chrome 有三件事和 Edge 完全不同：**名字不能后台改**、**账号必须开两步验证**、**多一步 Trader 身份申报**
- 所以顺序建议：先花 10 分钟把账号那三道门过了（注册费 / 2FA / Trader），再传包。反过来做会卡在最后一步重新排队

---

## 注册开发者账号（第 0 步，$5 一次性，必须你先做）

> 没有这一步，后台连「Add new item」都不会给你。整个过程 5–10 分钟，卡点通常只有一个：**付不了款**。

### 准备 4 样东西

| 东西 | 说明 |
|------|------|
| Google 账号 | 建议**单独注册一个**给扩展用，别用主账号。理由：这个账号就是「发行商身份」，被风控会连带扩展下架，而且 $5 是绑账号的，换账号要重交 |
| 两步验证 | 必须开，否则最后一步 Submit 点不动。需要你的手机 |
| 能付美元的卡 | Visa / Mastercard 双币卡、或银联+visa 双标卡。单标银联卡 / Google Play 余额**不行** |
| 公开联系邮箱 | 会显示在商店页，介意就用一个专用邮箱（可以和 Google 账号同域，也可以是别的） |

### 8 步操作

1. 打开 <https://chrome.google.com/webstore/devconsole>，用那个 Google 账号登录
2. 首次进入会提示要注册开发者 → 点 **Register**（或 "Pay registration fee"）
3. 同意 **Developer Agreement**（开发者协议），勾选后继续
4. 填 **Publisher name（发行商名称）**——会公开显示在商店页，建议和扩展品牌一致，
   比如 `flomo 随记` 或 `orange-spks`。❌ 别填「flomo 官方」「flomo 团队」这类会被判冒用
5. 填 **联系邮箱** → 去邮箱点验证链接（一般 1 分钟内到，翻一下垃圾箱）
6. 付款页填卡号、有效期、CVV、**账单地址**（要和卡登记的地址一致，否则容易失败）
7. 支付成功 → 自动回到后台，能看到 Item 列表（此时是空的）
8. 若提示还需要两步验证 → 跳 <https://myaccount.google.com/security> 开启，回来再继续

### 付款失败怎么办（国内最常见）

| 现象 | 原因 | 处理 |
|------|------|------|
| `Your transaction was declined` | 卡不支持境外支付 / 未开 3D 验证 | 换一张双币卡；打电话给发卡行开「境外线上支付」 |
| `Billing address does not match` | 账单地址和卡登记地址不一致 | 按卡的账单地址逐字填（英文/拼音都行，但要一致） |
| 页面转圈后回到原页 | 网络中断，请求没发出去 | 换网络重试；**确认卡里没被重复扣款再重试** |
| 提示账号不符合条件 | 用的是 Google Workspace 账号（管理员受限） | 换个人 Gmail |

> $5 是**一次性、不可退**，同一个账号以后发版、上第 2 个扩展都不再收费。
> 一个开发者账号的扩展数量有上限（约 20 个），本项目远远用不到。

### 注册完你会看到什么

后台左侧是 **Items**（空列表）、**Account**（账号信息、可改发行商名称）、
右侧是 **"New item"** 按钮 —— 到这一步就可以按第 3 节往下走了。

### ⚠️ 注册后先改 2 处，再动 Trader 声明

第一次进 **Settings**，有三块内容都在同一页，顺序错了要来回滚：

| 位置 | 默认值 | 必须做什么 |
|------|--------|------------|
| Profile → **Publisher display name** | 你的 Gmail 地址 | **改成 `flomo 随记` 或 `orange-spks`**。右侧灰字写明「may be shown on your public store listing」——不改的话商店页上你叫一串邮箱 |
| Profile → **Add contact email** | 空 | 加一个邮箱并**点邮件里的验证链接**，否则后面提交可能被拦 |
| **Trader declaration** | 未选，进页面会弹窗强制选 | 见 2.4，个人开发者选 `This is a non-trader account` → Save |

建议顺序：改显示名 → 加邮箱验证 → 最后选 Trader 并 Save（保存后布局会重排，先做别的更顺）。

选完 non-trader 后，页面下方的 **Address** 区块通常不再强制必填 —— 它不是必需的就不填，
因为这一栏是**会公开印在商品详情页上**的。若它仍强制要求，填城市级地址即可。

---

## 1. 我这边已经跑完的硬校验（2026-11-04 23:03 改名后复验）

| 检查项 | 方法 | 结果 |
|--------|------|------|
| manifest 能否被 Chrome 接受 | `chrome --pack-extension=dist/unpacked` | ✅ 退出码 0，生成 crx |
| zip 是不是「旧包」 | 逐文件 sha256 对比源码 | ✅ manifest / background / content / key-blocker / 两个 messages.json 全一致 |
| 商店标题解析结果 | 读 zip 内 `_locales/zh_CN/messages.json` | ✅ `flomo 随记`（8 字符 ≤ 45） |
| 有没有远程代码 | 扫 `eval(` / `new Function` / `importScripts` | ✅ 一个都没有（所以 Remote code 敢填 No） |
| 网络出口 | 扫全部 `fetch(` 和 http 地址 | ✅ 只有 background 的 `proxyFetch` 一处；地址仅 flomo / 4 家 AI 域名 |
| 读历史 / Cookie / 其他标签页 | 扫 `chrome.history` / `cookies` / `webRequest` | ✅ 无 |
| zip 根目录结构 | `unzip -l` | ✅ `manifest.json` 在根，无 `__MACOSX`、`.DS_Store`、`._*` |
| 图标尺寸 | `sips` | ✅ 16/48/128 全对 |
| 商店 Logo | `sips` | ✅ 300×300 |
| 小宣传图 | `sips` | ✅ 440×280 |
| 大宣传图 | `sips` | ✅ 1400×560 |
| 截图 | `sips` | ✅ 3 张，均 1280×800（Chrome 接受 1280×800 或 640×400） |
| 隐私政策链接 | `curl -L` | ✅ HTTP 200 |
| 中文短说明长度 | 计数 | ✅ 58 / 132 |
| 中文详细说明长度 | 计数 | ✅ 1376 字符（Chrome 上限 16000） |
| 英文短说明长度 | 计数 | ✅ 79 / 132 |
| 英文详细说明长度 | 计数 | ✅ 2324 字符 |
| 包体积 | `ls -lh` | 178 KB（上限 2 GB，无压力） |

一句话：**包可以原样往上传，不用再改。**

---

## 2. Chrome 和 Edge 不一样的 5 件事（看完能少被拒一轮）

### 2.1 商店里显示的名字来自 manifest（已定案：`flomo 随记`）

Chrome Web Store **没有**让你单独填「商品名」的地方。商店页标题 = `manifest.json` 的 `name`，
而本包用的是 `__MSG_appName__`，最终值来自 `_locales/zh_CN/messages.json`：

```
flomo 随记        ← 2026-11-04 已从「flomo_随记」改成这个，包已重打（sha256 已核对）
```

要点：

- 之前是 `flomo_随记`，那个下划线在商店页上看着像没填完的占位符，已去掉
- 想在商店里改标题，**只能**改 `appName` → `bash build.sh` → 重新上传 zip；
  后台的文案（Short/Long description）怎么改都不影响标题
- 英文区同理：`_locales/en/messages.json` 的 `appName` = `flomo Memo`
- 长名「flomo 随记 · 网页剪藏助手」在 Chrome 无处可填，不用再维护

> ⚠️ 「后台没有可编辑的商品名框」这条本机网络打不开 `developer.chrome.com` 无法直接引用官方文档，
> 是凭经验写的。你打开后台时可以顺手确认：Store listing 页顶部那个产品名如果是灰色的只读状态，
> 就说明标题确实只由 manifest 决定。

### 2.2 账号必须先开两步验证

Chrome 要求开发者账号开启 2FA，否则「Submit for review」点了没反应或直接驳回。
入口：<https://myaccount.google.com/security> → 「两步验证」。需要你的手机号。

### 2.3 5 美元是一次性的，绑在 Google 账号上

- 只交一次，之后发版不再收费；用户下载永久免费
- 需要外币卡（Visa / Mastercard；部分银联可用）
- 同一个账号再上第二个扩展不需要再交
- 不交钱**连草稿都存不了**，所以这一步必须在传包之前

### 2.4 Trader / Non-trader（欧盟 DSA）——Chrome 比 Edge 多出来的一步

在 **Distribution** 标签页，Chrome 会问你在欧盟《数字服务法》下的身份：

| 选项 | 后果 | 适合谁 |
|------|------|--------|
| **Non-trader（非交易者）** | 扩展**在欧盟区不可见**，但你不用提交身份/地址验证，立刻能发布 | 个人开发者、只做中文圈分发 → **建议选这个** |
| **Trader（交易者）** | 全球可见（含欧盟），但需要填写真实姓名/地址并接受 Chrome 的商户验证，验证可能要几天 | 想覆盖欧洲用户、有正式主体 |

这套东西是为了合规，不影响功能。**选完不能随便来回切**，切了要重新验证，所以第一次就选对。

> 收到打赏算不算「交易者」？Chrome 的口径是「以商业目的向欧盟消费者提供商品/服务」。
> 扩展免费 + 自愿打赏，个人开发者申报 Non-trader 是常见做法；若你想彻底稳妥，也可以选 Trader 并填地址。

### 2.5 权限说明是按 manifest 逐条列的，审核员会对着代码看

`Privacy practices` 标签页会**自动列出**你 manifest 里的每一条权限，每条一个必填输入框。
本包会问到 5 项：`activeTab`、`scripting`、`tabs`、`storage`、`<all_urls>` 主机权限，
外加 `content_scripts` 的 `<all_urls>`（就是 `key-blocker.js`）。

对应英文原文已按条目写在 `review-notes.md` 第 2 节，**一条一条对号入座**，别整段粘到某一个框里。

`tabs` 那条要特别说明：审核员会看代码确认「你是不是真的只用它读当前标签页 URL」。
本包 `background.js` 里确实只在 `chrome.tabs.onUpdated` 和 `chrome.tabs.get` 里读了 `tab.url`，
没有列历史、没有遍历标签页 → 说明和代码是对得上的，照粘即可。

---

## 3. 操作顺序（10 步，约 20 分钟 + 等审核）

1. 打开 <https://chrome.google.com/webstore/devconsole>，用 Google 账号登录
2. 首次进入：注册开发者 → 填开发者名称 + 联系邮箱 + **公开联系地址**（会公开展示，介意就填办公地址/城市级即可）
3. 支付 5 美元注册费
4. 确认两步验证已开（2.2）
5. 回后台 → **Add new item**（或 "New item"）→ 上传 `dist/flomo-memo-v1.0.0.zip`
   - ⚠️ 只建**一个 item**。重复点 Add new item 会生成两条独立记录，两条都会进审核，商店里会出现两个一样的扩展
6. 上传成功后填 **Store listing**（第 4.1 节）
7. 填 **Privacy practices**（第 4.2 节）
8. 填 **Distribution**，选 Trader 身份（第 4.3 节）
9. 右上 **Submit for review**，备注框粘 `review-notes.md` 第 5 节英文原文（第 4.4 节）
10. 状态变 `Pending review` / `In review`，等 1–3 天（`<all_urls>` 大概率领人工复核，拖到 1–2 周也正常）

---

## 4. 四个标签页逐字段对照

### 4.1 Store listing

| 字段 | 填什么 | 备注 |
|------|--------|------|
| Product name | **不可填** | 只读，来自 manifest：`flomo 随记`（见 2.1） |
| Short description | `listing-zh.md` 第 2 节的引用块 | 58 字符 ≤ 132 ✅ |
| Detailed description | `listing-zh.md` 第 3 节的引用块 | 1376 字符，支持换行 |
| Category | `Productivity`（生产力工具） | — |
| Language | `中文（简体）` | 主语言 |
| Store icon | **不用传** | 自动取包内 128×128 |
| Screenshots | `01-sidebar`、`02-settings`、`03-selection` 三张 | 1280×800，Chrome 上限 5 张 |
| Small promo tile | `promo-440x280.png` | 440×280 ✅ |
| Large promo tile (Marquee) | `promo-1400x560.png` | 1400×560 ✅ |
| YouTube video | 留空 | — |
| Homepage URL | `https://github.com/orange-spks/flomo_tool` | — |
| Support URL | `https://github.com/orange-spks/flomo_tool/issues` | — |

英文区（`English` 语言行）：如果包里有 `_locales/en`，后台会出现英文行，可以按 `listing-en.md` 填，
也可以留空——留空时商店只展示中文列表，**不影响审核**。想省时间就留空。

### 4.2 Privacy practices（最容易填错的一页）

| 区块 | 填什么 |
|------|--------|
| Single purpose | `review-notes.md` 第 1 节英文原文 |
| `activeTab` justification | 第 2.1 节 |
| `scripting` justification | 第 2.2 节 |
| `tabs` justification | 第 2.3 节 |
| `storage` justification | 第 2.4 节 |
| `<all_urls>` host permission | 第 2.5 节 |
| Content script `<all_urls>`（key-blocker） | 第 2.6 节 |
| Are you using remote code? | **No, I am not using remote code**（实测无 eval/new Function，站得住） |
| Data usage 勾选 | Website content ✅ / Authentication information ✅ / Web history ✅，其余不勾 |
| 三条 Limited Use 承诺 | 全部勾上 |
| Privacy policy URL | `https://github.com/orange-spks/flomo_tool/blob/main/PRIVACY.md` |

> 为什么 `Web history` 要勾：扩展会读当前标签页 URL 来填笔记里的原文链接。
> 审核员对照代码看得到 `tab.url` 的读取，漏勾反而算「申报不实」。

### 4.3 Distribution

| 字段 | 填什么 |
|------|--------|
| Visibility | `Public` |
| Regions | 全选（若 Trader 选 Non-trader，欧盟自动不可见） |
| Pricing | Free |
| Trader status | 见 2.4，个人开发者建议 `Non-trader` |

### 4.4 Submit for review

备注框（"Notes for the reviewer"）粘 `review-notes.md` 第 5 节。
这段是**降低人工复核成本的关键**：写明「AI 和提交都需要用户自己的密钥，这是设计如此」，
否则审核员试不出效果，容易以「功能不可用」驳回。

---

## 5. 提交之后会发生什么

| 状态 | 含义 | 该做什么 |
|------|------|----------|
| Pending review | 排队中 | 等，别重复提交 |
| In review | 人工在看 | 等；新增提交会重排队 |
| Published / In the Store | 上线 | 拿商店链接（`chromewebstore.google.com/detail/<id>`） |
| Rejected | 写明违反的政策条款 + 申诉入口 | 按第 6 节改，重新提交**不额外收费** |
| Removed | 已上线后被下架 | 同上，先看清具体条款 |

被拒≠封号。Chrome 的驳回信息通常带政策编号（如「Purple Potassium」「Red Potassium」这类代号），
点「Appeal」可以申诉，也可以在改完后重新提交。

---

## 6. 被拒的话，对照这张表改

| 可能的驳回理由 | 真实原因 | 改法 | 要不要重新打包 |
|----------------|----------|------|----------------|
| 名称含他人商标（`flomo`） | 政策里的「冒用 / 商标」 | 把 `appName` 改成 `随记 · 网页剪藏助手`，描述里保留「兼容 flomo」 | **要**（改名只能改 manifest） |
| `<all_urls>` 权限过宽 / 用途不明 | 权限说明太笼统 | 换成第 2.5 节原文，明确写「点击后才注入」+「用户自己配的 AI 端点」 | 不要 |
| 功能无法验证 / 看起来不可用 | 审核员没有 key，点「AI总结」只看到报错 | 用第 5 节备注说明「需要用户自己的密钥」；必要时补一段 GIF | 不要 |
| 远程代码 | 误判 | 指出包内无 eval/new Function，可提供源码包 | 不要 |
| key-blocker 像键盘记录 | 静态 content script 命中「全站键盘监听」特征 | 用第 2.6 节原文；仍被卡就改成「点击图标后才注入」（需改代码） | **要** |
| 隐私政策链接打不开 | GitHub 页面被墙 / 审核在境外访问正常 | 换 GitHub Pages：`https://orange-spks.github.io/flomo_tool/` | 不要 |
| 单一用途不清 | 描述里塞了太多卖点 | 只保留「摘录→发到 flomo」一条主线 | 不要 |

---

## 7. 其他可选优化（改名已完成，剩 2 项）

都不做也能交，做了能降低人工复核的摩擦。**每一项都要重新 `bash build.sh` 换包**，所以要么现在一起改，要么等上架后再改。

1. ~~改名字~~ —— **已完成（2026-11-04）**：`flomo_随记` → `flomo 随记`，包已重打、sha256 已核对、Chrome 打包器复验通过
2. **清掉 manifest 里冗余的 host_permissions**：`<all_urls>` 已经覆盖了后面 4 个 AI 域名，
   留着不算违规，但审核员可能顺手提一句「权限写得不够干净」
3. **英文区文案**：现在不填也能过；想覆盖海外用户再补 `listing-en.md`

> 版本号说明：v1.0.0 目前**还没在任何商店上线**，所以改了包不用 bump 版本号，两个商店都还能收 1.0.0。
> 一旦线上有了已发布版本，之后再改包就必须先改 `manifest.json` 的 `version`（如 1.0.1），
> 否则商店会拒收「版本号不高于线上」的包。

---

## 8. 自检命令（以后每次发版都跑一遍）

```bash
bash build.sh                                    # 出包 + 密钥扫描
unzip -l dist/flomo-memo-v1.0.0.zip | head -20    # 根目录有 manifest.json 就对了
unzip -l dist/flomo-memo-v1.0.0.zip | grep -E "__MACOSX|\.DS_Store"   # 应该没输出
sips -g pixelWidth -g pixelHeight images/icon128.png                  # 128 128
```

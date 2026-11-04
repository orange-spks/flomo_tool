# 上架材料索引（docs/store）

这个目录放的**全是给商店后台用的东西**，不参与打包（`build.sh` 白名单里没有 `docs/`）。

## 素材清单

| 文件 | 用途 | 商店字段 |
|------|------|----------|
| `submit-guide.md` | 逐步提交指南（先 Edge 后 Chrome） | 先读这个 |
| `chrome-submit.md` | **Chrome 专用**：逐字段照抄清单 + 与 Edge 的 5 处差异 + 驳回对照表 | 提交 Chrome 时对着填 |
| `listing-zh.md` | 中文名称/简介/详细说明/关键词 | Store listing → 中文行 |
| `listing-en.md` | 英文名称/简介/详细说明/关键词 | Store listing → English 行 |
| `review-notes.md` | 单一用途、逐条权限说明、远程代码、数据申报、审核备注 | Privacy + Notes for certification |
| `assets/logo-300x300.png` | 商店 Logo（1:1） | Extension logo（Edge 必填） |
| `assets/promo-440x280.png` | 小宣传图 | Small promotional tile |
| `assets/promo-1400x560.png` | 大宣传图 | Large promotional tile / Marquee |
| `assets/screenshots/01-sidebar-1280x800.png` | 主界面（侧边栏 + 摘录 + 感想） | Screenshots |
| `assets/screenshots/02-settings-1280x800.png` | 设置面板（AI 配置 / Webhook / 打赏） | Screenshots |
| `assets/screenshots/03-selection-1280x800.png` | 选中文字弹出浮动工具栏 | Screenshots |

## 素材是怎么来的

截图不是 P 的，也不是画的示意图：用真实 Chrome 加载真实的 `scripts/content.js`
和它自带的 `SHADOW_STYLE`（Shadow DOM 样式）渲染出侧边栏，再在 1280×800 视口下实拍。
演示用的文章页是本地构造的，正文和感想是示例文案。

> 局限：本机 Chrome 157 已禁用 `--load-extension` 参数，无法用自动化把扩展**真的安装**进去，
> 所以截图里没有浏览器工具栏上的扩展图标。上架前请按 `submit-guide.md` 第 6 节做一次真机验收。

## 重新生成截图（需要时）

生成脚本没有进仓库（它依赖 `playwright-core`，属于一次性工具）。要重做时让 AI 助手重新跑一遍即可，
思路是：`playwright-core` + 本机 Chrome（`channel`/`executablePath`）→ 用桩对象替换 `chrome.*` API
→ 注入 `content.js` → 触发 `toggleSidebar` 消息 → 填示例内容 → `page.screenshot()`。

## 当前状态

- [x] 发布包 `dist/flomo-memo-v1.0.0.zip` 已生成并通过 Chrome 的 `--pack-extension` 校验（2026-11-04 复核：退出码 0）
- [x] 包内容与源码 sha256 一致，无 `eval`/`new Function`，无 `__MACOSX`/`.DS_Store` 垃圾
- [x] 全部图片尺寸复核通过（128 图标 / 300 Logo / 440×280 / 1400×560 / 3×1280×800）
- [x] 隐私政策 `PRIVACY.md` 已在仓库根目录（公网可访问，curl 200）
- [x] 中英文商店文案、权限说明、审核备注（字符数已实测，均在限内）
- [ ] **需要你本人**：注册 Edge 开发者（免费）→ 上传 → 发布
- [ ] **需要你本人**：注册 Chrome 开发者（约 5 美元）+ 开两步验证 → 上传 → 发布（照 `chrome-submit.md`）
- [x] 商店标题已定：`flomo 随记`（原名 `flomo_随记` 带下划线，2026-11-04 改掉并重新打包）
- [ ] **需要你本人**：5 分钟真机验收（`submit-guide.md` 第 6 节）

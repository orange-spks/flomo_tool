#!/usr/bin/env bash
# ============================================================
# build.sh - Flomo Memo 一键打包脚本（macOS / Linux 版）
#
# 用法：
#   bash build.sh
#
# 与 build.ps1 完全等价（步骤、白名单、扫描规则一致），
# 区别只是用 bash + zip 实现，方便在 macOS 上直接打包。
#
# 流程：
#   1. 校验 manifest.json（必填字段、引用文件是否真实存在、WAR 资源是否存在）
#   2. 安全扫描：防止硬编码 API Key 被打进发布包（血泪教训见 MEMORY.md）
#   3. 复制必要文件到临时目录（白名单）
#   4. 压缩为 dist/flomo-memo-v{版本号}.zip
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

STAGING="dist/.build-staging"

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }

fail() { echo; red "[打包失败] $1"; exit 1; }
info() { cyan "[信息] $1"; }
ok()   { green "[通过] $1"; }

# ---------- 第 1 步：校验 manifest ----------
info "第 1/4 步：校验 manifest.json ..."
[[ -f manifest.json ]] || fail "找不到 manifest.json"

# 用 python3 解析 JSON 并做字段检查（macOS 自带 python3）
VERSION="$(python3 - <<'PY'
import json, os, sys

try:
    m = json.load(open('manifest.json', encoding='utf-8'))
except Exception as e:
    print('JSON_ERROR:' + str(e)); sys.exit(0)

problems = []
if m.get('manifest_version') != 3:
    problems.append('manifest_version 应为 3，当前为 %r' % m.get('manifest_version'))
if not str(m.get('version', '')).strip():
    problems.append('缺少 version 字段')

# 引用的文件必须真实存在（漏文件是发布事故的高发区）
refs = []
bg = m.get('background') or {}
if bg.get('service_worker'):
    refs.append(bg['service_worker'])
for cs in m.get('content_scripts', []):
    refs += cs.get('js', [])
    refs += cs.get('css', [])
for _, v in (m.get('icons') or {}).items():
    refs.append(v)
for war in m.get('web_accessible_resources', []):
    for r in war.get('resources', []):
        if '*' not in r:
            refs.append(r)

for f in refs:
    if not os.path.exists(f):
        problems.append('manifest 引用的文件不存在：%s' % f)

# default_locale 必须存在对应 _locales 目录，否则 Chrome 直接拒载
loc = m.get('default_locale')
if loc:
    p = os.path.join('_locales', loc, 'messages.json')
    if not os.path.exists(p):
        problems.append('default_locale=%s，但缺少 %s' % (loc, p))
    else:
        try:
            json.load(open(p, encoding='utf-8'))
        except Exception as e:
            problems.append('%s 不是合法 JSON：%s' % (p, e))

if problems:
    print('PROBLEM:' + ' || '.join(problems))
else:
    print('OK:' + m['version'])
PY
)"

case "$VERSION" in
  OK:*)   VERSION="${VERSION#OK:}"; ok "版本号：v$VERSION" ;;
  JSON_ERROR:*) fail "manifest.json 不是合法 JSON：${VERSION#JSON_ERROR:}" ;;
  PROBLEM:*)    fail "${VERSION#PROBLEM:}" ;;
  *)            fail "manifest 校验出现未知错误：$VERSION" ;;
esac

ok "manifest 引用的文件全部存在"

# ---------- 第 2 步：安全扫描 ----------
info "第 2/4 步：扫描待打包文件中的硬编码密钥 ..."

# 常见密钥特征：OpenAI/DeepSeek 系 sk-、GitHub Token、AWS Access Key、Bearer 后接长字符串
SECRET_PATTERNS=(
  'sk-[A-Za-z0-9]{16,}'
  'ghp_[A-Za-z0-9]{20,}'
  'gho_[A-Za-z0-9]{20,}'
  'AKIA[0-9A-Z]{16}'
  'Bearer[[:space:]]+[A-Za-z0-9_-]{20,}'
)

LEAK=0
while IFS= read -r f; do
  for p in "${SECRET_PATTERNS[@]}"; do
    if grep -Eq "$p" "$f"; then
      yellow "  [疑似密钥] $f 命中模式：$p"
      LEAK=1
    fi
  done
done < <(find . -type f \( -name '*.js' -o -name '*.json' -o -name '*.html' \) \
           -not -path './dist/*' -not -path './docs/*' -not -path './memory/*' \
           -not -path './node_modules/*' -not -path './.git/*')

[[ "$LEAK" -eq 0 ]] || fail "检测到疑似硬编码密钥，请确认后再打包。若为误报，请调整 build.sh 的扫描规则。"
ok "未发现硬编码密钥"

# ---------- 第 3 步：收集文件（白名单） ----------
info "第 3/4 步：收集打包文件 ..."

# 白名单：只拿 Chrome 运行时真正需要的
# 显式排除：sidebar.html、styles/（遗留文件，运行时无引用）、docs/ memory/ *.md
INCLUDES=(manifest.json scripts images _locales)

rm -rf "$STAGING"
mkdir -p "$STAGING"
for item in "${INCLUDES[@]}"; do
  [[ -e "$item" ]] || fail "打包必需项缺失：$item"
  cp -R "$item" "$STAGING/"
done

# macOS 的 ._* / .DS_Store 是资源分叉垃圾文件，绝不能进商店包
find "$STAGING" -name '.DS_Store' -delete 2>/dev/null || true
find "$STAGING" -name '._*' -delete 2>/dev/null || true

FILECOUNT="$(find "$STAGING" -type f | wc -l | tr -d ' ')"
ok "已收集 $FILECOUNT 个文件"

# ---------- 第 4 步：压缩 ----------
info "第 4/4 步：生成 zip 包 ..."

ZIP_NAME="flomo-memo-v$VERSION.zip"
ZIP_PATH="dist/$ZIP_NAME"
rm -f "$ZIP_PATH"

# -X 去掉多余的扩展属性，避免商店上传时报结构异常
( cd "$STAGING" && zip -qr -X "../$ZIP_NAME" . )

# 额外留一份解压好的目录，方便在 chrome://extensions 里「加载已解压的扩展程序」做验收
rm -rf "dist/unpacked"
mv "$STAGING" "dist/unpacked"

SIZE_KB="$(du -k "$ZIP_PATH" | cut -f1)"
echo
green "============================================"
green " 打包完成：dist/$ZIP_NAME (${SIZE_KB} KB)"
green " 可到 chrome://extensions 加载，或直接上传商店"
green "============================================"

# 顺手列出包内文件，人工核对一眼
echo
info "包内文件清单："
unzip -l "$ZIP_PATH" | sed -n '4,$p' | head -30

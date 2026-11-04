# ============================================================
# build.ps1 - Flomo Clipper 一键打包脚本
#
# 用法（在 Git Bash 或 PowerShell 中均可）：
#   powershell -ExecutionPolicy Bypass -File build.ps1
#
# 流程：
#   1. 校验 manifest.json（必填字段、引用文件是否真实存在）
#   2. 安全扫描：防止硬编码 API Key 被打进发布包（血泪教训见 MEMORY.md）
#   3. 复制必要文件到临时目录（自动排除遗留文件和开发文档）
#   4. 压缩为 dist/flomo-memo-v{版本号}.zip
#
# 打包内容白名单（Chrome 运行时真正需要的）：
#   manifest.json / scripts/ / images/ / _locales/
# 显式排除：
#   sidebar.html、styles/ —— 遗留文件，运行时无引用（2026-11-04 确认）
#   docs/、memory/、*.md、dist/、.git/ —— 开发资料，不进发布包
# ============================================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Fail($msg) {
    Write-Host ""
    Write-Host "[打包失败] $msg" -ForegroundColor Red
    exit 1
}

function Info($msg) { Write-Host "[信息] $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "[通过] $msg" -ForegroundColor Green }

# ---------- 第 1 步：校验 manifest ----------
Info "第 1/4 步：校验 manifest.json ..."

$manifestPath = Join-Path $root 'manifest.json'
if (-not (Test-Path $manifestPath)) { Fail "找不到 manifest.json" }

try {
    $manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Fail "manifest.json 不是合法 JSON：$($_.Exception.Message)"
}

# 必填字段检查
if ($manifest.manifest_version -ne 3) { Fail "manifest_version 应为 3，当前为 $($manifest.manifest_version)" }
if ([string]::IsNullOrWhiteSpace($manifest.version)) { Fail "manifest.json 缺少 version 字段" }
$version = $manifest.version
Ok "版本号：v$version"

# manifest 引用的文件必须真实存在（漏文件是发布事故的高发区）
$requiredFiles = @()
$requiredFiles += $manifest.background.service_worker
foreach ($cs in $manifest.content_scripts) { $requiredFiles += $cs.js }
foreach ($size in $manifest.icons.PSObject.Properties) { $requiredFiles += $size.Value }

foreach ($f in $requiredFiles) {
    if (-not [string]::IsNullOrWhiteSpace($f) -and -not (Test-Path (Join-Path $root $f))) {
        Fail "manifest 引用的文件不存在：$f"
    }
}

# 设置了 default_locale 就必须有对应 _locales 目录，否则 Chrome 直接拒载
if ($manifest.default_locale) {
    $localeMsg = Join-Path $root "_locales\$($manifest.default_locale)\messages.json"
    if (-not (Test-Path $localeMsg)) { Fail "default_locale=$($manifest.default_locale)，但缺少 $localeMsg" }
    # 顺带校验 messages.json 是合法 JSON
    try { Get-Content $localeMsg -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null }
    catch { Fail "$localeMsg 不是合法 JSON" }
}
Ok "manifest 引用的文件全部存在"

# ---------- 第 2 步：安全扫描（防硬编码 Key 混入发布包） ----------
Info "第 2/4 步：扫描待打包文件中的硬编码密钥 ..."

# 常见密钥特征：DeepSeek/OpenAI 系 sk-、GitHub Token、AWS Access Key、Bearer 后接长字符串
$secretPatterns = @(
    'sk-[A-Za-z0-9]{16,}',
    'ghp_[A-Za-z0-9]{20,}',
    'gho_[A-Za-z0-9]{20,}',
    'AKIA[0-9A-Z]{16}',
    'Bearer\s+[A-Za-z0-9\-_]{20,}'
)

$scanFiles = Get-ChildItem -Path $root -Recurse -File -Include *.js,*.json,*.html |
    Where-Object { $_.FullName -notmatch '\\(dist|docs|memory|node_modules|\.git)\\' }

$leakFound = $false
foreach ($file in $scanFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    foreach ($pattern in $secretPatterns) {
        if ($content -match $pattern) {
            Write-Host "  [疑似密钥] $($file.FullName.Replace($root, '.')) 命中模式：$pattern" -ForegroundColor Yellow
            $leakFound = $true
        }
    }
}
if ($leakFound) { Fail "检测到疑似硬编码密钥，请确认后再打包。若为误报，请调整 build.ps1 的扫描规则。" }
Ok "未发现硬编码密钥"

# ---------- 第 3 步：复制必要文件到临时目录 ----------
Info "第 3/4 步：收集打包文件 ..."

$distDir = Join-Path $root 'dist'
$staging = Join-Path $distDir '.build-staging'
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

# 白名单复制：只拿 Chrome 运行时真正需要的
$includes = @('manifest.json', 'scripts', 'images', '_locales')
foreach ($item in $includes) {
    $src = Join-Path $root $item
    if (-not (Test-Path $src)) { Fail "打包必需项缺失：$item" }
    Copy-Item $src -Destination $staging -Recurse -Force
}

$fileCount = (Get-ChildItem $staging -Recurse -File).Count
Ok "已收集 $fileCount 个文件"

# ---------- 第 4 步：压缩 ----------
Info "第 4/4 步：生成 zip 包 ..."

$zipName = "flomo-memo-v$version.zip"
$zipPath = Join-Path $distDir $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# 注意：打包 staging 目录的"内容"，而不是把目录本身包进去
Compress-Archive -Path "$staging\*" -DestinationPath $zipPath -Force
Remove-Item $staging -Recurse -Force

$sizeKB = [math]::Round((Get-Item $zipPath).Length / 1KB, 1)
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " 打包完成：dist\$zipName ($sizeKB KB)" -ForegroundColor Green
Write-Host " 可到 chrome://extensions 加载或上传商店" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

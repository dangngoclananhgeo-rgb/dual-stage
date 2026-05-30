# ============================================================
# DUAL STAGE - Push len GitHub
# Huong dan:
#   1. Tao repo moi tai https://github.com/new
#      - Ten repo: dual-stage
#      - De Private hoac Public tuy y
#      - KHONG tich "Add README"
#   2. Click phai vao file nay -> "Run with PowerShell"
# ============================================================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   DUAL STAGE - PUSH LEN GITHUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ── Tim dung thu muc du an ───────────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = $null

if (Test-Path "$scriptDir\pages") {
    $projectDir = $scriptDir
} elseif (Test-Path "$scriptDir\dual-stage-export\pages") {
    $projectDir = "$scriptDir\dual-stage-export"
} else {
    $candidates = @(
        "$env:USERPROFILE\Downloads\dual-stage-export",
        "$env:USERPROFILE\Downloads\dual-stage\dual-stage-export",
        "$env:USERPROFILE\Desktop\dual-stage-export"
    )
    foreach ($c in $candidates) {
        if (Test-Path "$c\pages") { $projectDir = $c; break }
    }
}

if (-not $projectDir) {
    Write-Host "KHONG TIM THAY thu muc du an!" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host "Thu muc du an: $projectDir" -ForegroundColor Green
Set-Location $projectDir


# ── Buoc 1: Tao .gitignore ───────────────────────────────────
Write-Host ""
Write-Host "[1/6] Tao .gitignore..." -ForegroundColor Yellow

$gitignore = @"
node_modules/
.next/
data/
.env.local
*.log
"@
[System.IO.File]::WriteAllText(".gitignore", $gitignore, [System.Text.Encoding]::UTF8)
Write-Host "      OK" -ForegroundColor Green


# ── Buoc 2: Khoi tao git (neu chua co) ──────────────────────
Write-Host "[2/6] Khoi tao Git..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    git init
    Write-Host "      Da khoi tao git moi" -ForegroundColor Green
} else {
    Write-Host "      Git da ton tai, reset de push sach..." -ForegroundColor Gray
    # Xoa lich su cu de tranh van de file lon
    Remove-Item -Recurse -Force ".git"
    git init
    Write-Host "      Da reset git" -ForegroundColor Green
}


# ── Buoc 3: Xac nhan GitHub username ────────────────────────
Write-Host "[3/6] Cau hinh GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "      GitHub username cua ban la: dangngoclananhgeo-rgb" -ForegroundColor White
$confirm = Read-Host "      Dung khong? (Enter = dung / N = nhap lai)"

if ($confirm -eq "N" -or $confirm -eq "n") {
    $username = Read-Host "      Nhap GitHub username"
} else {
    $username = "dangngoclananhgeo-rgb"
}

$repoName = "dual-stage"
$remoteUrl = "https://github.com/$username/$repoName.git"
Write-Host "      Remote: $remoteUrl" -ForegroundColor Green


# ── Buoc 4: Stage tat ca file ───────────────────────────────
Write-Host "[4/6] Chuan bi file de upload..." -ForegroundColor Yellow
git add .
Write-Host "      OK" -ForegroundColor Green


# ── Buoc 5: Commit ──────────────────────────────────────────
Write-Host "[5/6] Tao commit..." -ForegroundColor Yellow
git commit -m "initial commit"
Write-Host "      OK" -ForegroundColor Green


# ── Buoc 6: Push len GitHub ──────────────────────────────────
Write-Host "[6/6] Push len GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "      (Co the hoi dang nhap GitHub - nhap username va password/token)" -ForegroundColor Gray
Write-Host ""

git remote add origin $remoteUrl
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "   PUSH THANH CONG!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repo cua ban: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Buoc tiep theo - Deploy len Vercel:" -ForegroundColor White
    Write-Host "  1. Vao https://vercel.com" -ForegroundColor White
    Write-Host "  2. Sign up bang tai khoan GitHub" -ForegroundColor White
    Write-Host "  3. Add New Project -> chon repo dual-stage" -ForegroundColor White
    Write-Host "  4. Them Environment Variables:" -ForegroundColor White
    Write-Host "     ADMIN_PASSWORD_A = mat khau A" -ForegroundColor Yellow
    Write-Host "     ADMIN_PASSWORD_B = mat khau B" -ForegroundColor Yellow
    Write-Host "     JWT_SECRET       = chuoi bi mat dai" -ForegroundColor Yellow
    Write-Host "  5. Nhan Deploy" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Push that bai!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Nguyen nhan co the:" -ForegroundColor Yellow
    Write-Host "  - Chua tao repo tren GitHub (vao https://github.com/new)" -ForegroundColor White
    Write-Host "  - Sai username/password" -ForegroundColor White
    Write-Host "  - Repo da co noi dung (can xoa va tao lai)" -ForegroundColor White
}

Write-Host ""
Read-Host "Nhan Enter de thoat"
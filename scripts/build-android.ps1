# =========================================
#   Lottos - Build Android Release (Windows)
# =========================================
# Equivalente PowerShell de scripts/build-android.sh
# Como rodar:
#   powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n$msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) {
  Write-Host "`n[ERRO] $msg" -ForegroundColor Red
  exit 1
}

# Garante execução a partir da raiz do projeto (scripts/.. = raiz)
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

try {
  Write-Host "=========================================" -ForegroundColor Yellow
  Write-Host "  Lottos - Build Android Release (Win)"   -ForegroundColor Yellow
  Write-Host "=========================================" -ForegroundColor Yellow

  # 0. Validação: capacitor.config.ts não pode conter server.url ativo
  Write-Step "[0/4] Validando capacitor.config.ts..."
  if (-not (Test-Path "capacitor.config.ts")) {
    Write-Fail "capacitor.config.ts não encontrado na raiz do projeto."
  }
  $capLines = Get-Content "capacitor.config.ts"
  $offending = $capLines | Where-Object {
    ($_ -match '^\s*url\s*:') -and ($_ -notmatch '^\s*//')
  }
  if ($offending) {
    Write-Host ""
    Write-Host "capacitor.config.ts contém 'server.url' ativo." -ForegroundColor Red
    Write-Host "Isso faria o app carregar uma URL remota (ex: sandbox Lovable)" -ForegroundColor Red
    Write-Host "em vez de rodar os arquivos locais do AAB." -ForegroundColor Red
    Write-Host ""
    Write-Host "Linhas suspeitas:" -ForegroundColor Red
    $offending | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Fail "Remova o bloco 'server: { url: ... }' antes de gerar o build de release."
  }
  Write-Ok "capacitor.config.ts OK (sem server.url)."

  # 1. Build web
  Write-Step "[1/4] Buildando o projeto web..."
  npm run build
  if ($LASTEXITCODE -ne 0) { Write-Fail "'npm run build' falhou." }

  # 2. Validação dist/
  Write-Step "[2/4] Validando saída do build web..."
  if (-not (Test-Path "dist")) {
    Write-Fail "Pasta 'dist/' não foi gerada pelo build."
  }
  if (-not (Test-Path "dist/index.html")) {
    Write-Fail "'dist/index.html' não encontrado. O build web não gerou os arquivos esperados."
  }

  $remotePattern = '(src|href)="https?://[^"]*\.(lovable\.app|lovableproject\.com|lovable\.dev)'
  $remoteHits = Select-String -Path "dist/index.html" -Pattern $remotePattern -AllMatches
  if ($remoteHits) {
    Write-Host ""
    Write-Host "dist/index.html contém referências a domínios Lovable remotos." -ForegroundColor Red
    Write-Host "O AAB ficaria dependente de internet e quebraria offline." -ForegroundColor Red
    Write-Host ""
    Write-Host "Linhas suspeitas:" -ForegroundColor Red
    $remoteHits | ForEach-Object { Write-Host "  Linha $($_.LineNumber): $($_.Line)" -ForegroundColor Red }
    Write-Fail "Remova as referências remotas antes de gerar o AAB."
  }
  Write-Ok "Pasta dist/ validada (index.html presente, sem URLs remotas Lovable)."

  # 3. Sync Capacitor
  Write-Step "[3/4] Sincronizando com Capacitor..."
  npx cap sync android
  if ($LASTEXITCODE -ne 0) { Write-Fail "'npx cap sync android' falhou." }

  $syncedIndex = "android/app/src/main/assets/public/index.html"
  if (-not (Test-Path $syncedIndex)) {
    Write-Fail "'$syncedIndex' não foi gerado pelo 'npx cap sync'. O AAB seria empacotado SEM o app web embutido."
  }
  Write-Ok "Assets nativos sincronizados ($syncedIndex presente)."

  # 4. Bundle Release
  Write-Step "[4/4] Gerando AAB assinado..."
  Push-Location "android"
  try {
    if (-not (Test-Path "gradlew.bat")) {
      Write-Fail "android/gradlew.bat não encontrado."
    }
    .\gradlew.bat bundleRelease
    if ($LASTEXITCODE -ne 0) { Write-Fail "'gradlew bundleRelease' falhou." }
  } finally {
    Pop-Location
  }

  Write-Host ""
  Write-Host "=========================================" -ForegroundColor Green
  Write-Host "  Build concluído com sucesso!"            -ForegroundColor Green
  Write-Host "  AAB:"                                    -ForegroundColor Green
  Write-Host "  android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Símbolos nativos (upload opcional na Play Store):" -ForegroundColor Green
  Write-Host "  android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip" -ForegroundColor Green
  Write-Host "=========================================" -ForegroundColor Green
}
finally {
  Pop-Location
}

#!/bin/bash
set -e

echo "========================================="
echo "  Lottos - Build Android Release"
echo "========================================="

# 0. Validação: capacitor.config.ts não pode conter server.url
echo ""
echo "[0/4] Validando capacitor.config.ts..."
if grep -E "^[[:space:]]*url[[:space:]]*:" capacitor.config.ts | grep -v "^[[:space:]]*//" > /dev/null; then
  echo ""
  echo "❌ ERRO: capacitor.config.ts contém 'server.url'."
  echo "   Isso faz o app carregar uma URL remota (ex: Lovable sandbox)"
  echo "   em vez de rodar os arquivos locais do AAB."
  echo ""
  echo "   Remova o bloco 'server: { url: ... }' antes de gerar o build de release."
  echo ""
  exit 1
fi
echo "✅ capacitor.config.ts OK (sem server.url)."

# 1. Build web
echo ""
echo "[1/4] Buildando o projeto web..."
npm run build

# 2. Validação dist/
echo ""
echo "[2/4] Validando saída do build web..."

if [ ! -d "dist" ]; then
  echo ""
  echo "❌ ERRO: pasta 'dist/' não foi gerada pelo build."
  echo "   Verifique a saída do 'npm run build' acima."
  echo ""
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo ""
  echo "❌ ERRO: 'dist/index.html' não encontrado."
  echo "   O build web não gerou os arquivos esperados."
  echo ""
  exit 1
fi

# Garante que index.html não tem assets apontando para domínios Lovable remotos
if grep -E '(src|href)="https?://[^"]*\.(lovable\.app|lovableproject\.com|lovable\.dev)' dist/index.html > /dev/null; then
  echo ""
  echo "❌ ERRO: dist/index.html contém referências a domínios Lovable remotos."
  echo "   O AAB ficaria dependente de internet e quebraria offline."
  echo ""
  echo "   Linhas suspeitas:"
  grep -nE '(src|href)="https?://[^"]*\.(lovable\.app|lovableproject\.com|lovable\.dev)' dist/index.html || true
  echo ""
  exit 1
fi
echo "✅ Pasta dist/ validada (index.html presente, sem URLs remotas Lovable)."

# 3. Sync Capacitor
echo ""
echo "[3/4] Sincronizando com Capacitor..."
npx cap sync android

# Validação pós-sync: assets/public/index.html deve existir dentro do projeto Android
SYNCED_INDEX="android/app/src/main/assets/public/index.html"
if [ ! -f "$SYNCED_INDEX" ]; then
  echo ""
  echo "❌ ERRO: '$SYNCED_INDEX' não foi gerado pelo 'npx cap sync'."
  echo "   O AAB seria empacotado SEM o app web embutido e cairia em proxy 404."
  echo ""
  exit 1
fi
echo "✅ Assets nativos sincronizados ($SYNCED_INDEX presente)."

# 4. Bundle Release
echo ""
echo "[4/4] Gerando AAB assinado..."
cd android
chmod +x gradlew
./gradlew bundleRelease

echo ""
echo "========================================="
echo "  Build concluído com sucesso!"
echo "  AAB:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "  Símbolos nativos (upload opcional na Play Store):"
echo "  android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip"
echo "========================================="

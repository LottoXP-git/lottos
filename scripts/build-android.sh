#!/bin/bash
set -e

echo "========================================="
echo "  Lottos - Build Android Release"
echo "========================================="

# 0. Validação: capacitor.config.ts não pode conter server.url
echo ""
echo "[0/3] Validando capacitor.config.ts..."
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
echo "[1/3] Buildando o projeto web..."
npm run build

# 2. Sync Capacitor
echo ""
echo "[2/3] Sincronizando com Capacitor..."

# Validação: pasta dist/ deve existir e conter index.html
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

echo "✅ Pasta dist/ validada (index.html presente)."
npx cap sync android

# 3. Bundle Release
echo ""
echo "[3/3] Gerando AAB assinado..."
cd android
chmod +x gradlew
./gradlew bundleRelease

echo ""
echo "========================================="
echo "  Build concluído com sucesso!"
echo "  AAB disponível em:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo "========================================="




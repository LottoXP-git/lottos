#!/bin/bash
set -e

echo "========================================="
echo "  Lottos - Build Android Release"
echo "========================================="

# 1. Build web
echo ""
echo "[1/3] Buildando o projeto web..."
npm run build

# 2. Sync Capacitor
echo ""
echo "[2/3] Sincronizando com Capacitor..."
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




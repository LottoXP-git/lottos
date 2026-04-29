#!/bin/bash
set -e

echo "========================================="
echo "  Lottos - Build iOS (preparação)"
echo "========================================="
echo ""
echo "⚠️  Este script DEVE rodar em um Mac com Xcode 15+ e CocoaPods instalados."
echo "    Ele apenas prepara os arquivos web e sincroniza com o projeto Xcode."
echo "    O Archive/Upload final é feito dentro do Xcode."
echo ""

# 0. Validação anti-proxy: capacitor.config.ts não pode conter server.url
echo "[0/4] Validando capacitor.config.ts..."
if grep -E "^[[:space:]]*url[[:space:]]*:" capacitor.config.ts | grep -v "^[[:space:]]*//" > /dev/null; then
  echo ""
  echo "❌ ERRO: capacitor.config.ts contém 'server.url'."
  echo "   Builds de release NÃO podem apontar para a sandbox Lovable."
  echo "   Remova o bloco 'server: { url: ... }' antes de continuar."
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
if [ ! -f "dist/index.html" ]; then
  echo "❌ ERRO: dist/index.html não foi gerado."
  exit 1
fi
if grep -E "lovable\.app|lovableproject\.com|lovable\.dev" dist/index.html > /dev/null; then
  echo "❌ ERRO: dist/index.html referencia domínios Lovable. Verifique env/config."
  exit 1
fi
echo "✅ dist/ válido para empacotamento offline."

# 3. Garantir que a plataforma iOS existe
echo ""
echo "[3/4] Verificando plataforma iOS..."
if [ ! -d "ios" ]; then
  echo ""
  echo "⚠️  Pasta 'ios/' não existe. Rode UMA vez no seu Mac:"
  echo "      npx cap add ios"
  echo "    Depois execute este script novamente."
  exit 1
fi
echo "✅ Plataforma iOS presente."

# 4. Sync
echo ""
echo "[4/4] Sincronizando arquivos web com o Xcode..."
npx cap sync ios

echo ""
echo "========================================="
echo "✅ Pronto. Próximos passos no Xcode:"
echo "   1. open ios/App/App.xcworkspace"
echo "   2. Selecione o target 'App' → Signing & Capabilities → seu Team"
echo "   3. Confira Bundle ID = com.lottos.app"
echo "   4. Bumpe Version e Build (Info → CFBundleShortVersionString / CFBundleVersion)"
echo "   5. Product → Archive → Distribute App → App Store Connect"
echo "========================================="

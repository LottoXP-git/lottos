---
name: Native Config iOS
description: Capacitor iOS — Bundle ID, regra anti server.url, AdSense oculto em iOS nativo, fluxo Xcode
type: feature
---

# Configuração Nativa iOS (Capacitor)

- **Bundle ID:** `com.lottos.app` (mesmo do Android)
- **App Name:** `Lottos`
- **Workspace Xcode:** `ios/App/App.xcworkspace`
- **Script de build:** `scripts/build-ios.sh` (precisa rodar em Mac)

## Regras de release iOS

1. `capacitor.config.ts` **NUNCA** com `server.url`. Mesma regra do Android (memória `native-config`). O `build-ios.sh` valida.
2. **AdSense escondido em iOS nativo**. `src/lib/platform.ts` expõe `isNativeIOS()`; `src/components/AdBanner.tsx` faz early-return. Razão: política do AdSense proíbe WebView e Apple rejeita. AdMob nativo fica para v2.
3. Pasta `ios/` é gerada localmente com `npx cap add ios` (não versionada na sandbox Lovable — só existe no Mac do dev).
4. Versionamento: bumpar **CFBundleShortVersionString** (semver) e **CFBundleVersion** (inteiro +1) no Info do target Xcode a cada upload.

## Compliance App Store Connect

- Classificação **17+** (alinhado com Age Gate).
- Política de Privacidade pública: `/politica-privacidade` (obrigatório).
- Descrição precisa repetir: "Este app não possui vínculo oficial com a Caixa Econômica Federal."
- Screenshots 6.7" e 6.5".

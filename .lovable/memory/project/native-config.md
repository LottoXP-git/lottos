---
name: Native Config
description: Capacitor com.lottos.app — build offline obrigatório, validação anti server.url, keystore release
type: feature
---

# Configuração Nativa (Capacitor / Android)

- **App ID:** `com.lottos.app`
- **App Name:** `Lottos`
- **webDir:** `dist`

## Regra de ouro: builds de release são 100% offline

`capacitor.config.ts` **NUNCA** pode conter `server.url` em commits que vão virar AAB de produção. Se contiver, o WebView do app instalado tenta buscar HTML em uma URL remota (sandbox Lovable). Quando essa sandbox é destruída, todos os usuários veem **erro "proxy 404"** e o app fica inutilizável até nova publicação na Play Store.

## Fluxo obrigatório de release

Sempre usar `bash scripts/build-android.sh`. Ele valida em ordem:

1. `capacitor.config.ts` não tem `server.url`.
2. `npm run build` gerou `dist/index.html`.
3. `dist/index.html` não referencia domínios `lovable.app` / `lovableproject.com` / `lovable.dev`.
4. `npx cap sync` produziu `android/app/src/main/assets/public/index.html`.
5. `./gradlew bundleRelease` gera o AAB assinado.

Saídas:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Símbolos nativos: `android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip`

## Versionamento

Bumpar `versionCode` (inteiro, +1) e `versionName` (semver) em `android/app/build.gradle` a cada upload na Play Store. Versão atual: `versionCode 6` / `versionName "1.0.5"`.

## Debug em campo

`MainActivity.java` loga no boot a URL inicial do WebView (`Log tag: LottosBoot`). Se aparecer algo diferente de `https://localhost/`, foi compilado com `server.url` indevido — refazer build.

## Keystore

`android/keystore.properties` é local e não versionado. Sem ele, `bundleRelease` gera AAB não assinado e a Play Store rejeita.

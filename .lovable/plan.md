

## Objetivo

Criar `RELEASE.md` na raiz do projeto documentando o fluxo manual completo de release Android, servindo como referência única para gerar e publicar novas versões na Play Store.

## Estrutura do RELEASE.md

1. **Visão geral** — quando fazer release, o que esperar.
2. **Pré-requisitos** — Node 20+, JDK 21, Android SDK, `keystore.properties` local com `lottos-keystore.jks`.
3. **Passo a passo**:
   - Sincronizar código (`git pull`)
   - Bumpar `versionCode` (+1) e `versionName` (semver) em `android/app/build.gradle`
   - Rodar `bash scripts/build-android.sh` (já valida config offline, dist, sync, gera AAB assinado)
   - Localizar artefatos: `app-release.aab` e `native-debug-symbols.zip`
   - Upload no Google Play Console (faixa interna → produção)
4. **Checklist de validação pós-publicação** — instalar via Play, abrir, conferir que não há "proxy 404", rodar `adb logcat | grep LottosBoot` se quiser confirmar URL inicial = `https://localhost/`.
5. **Troubleshooting** — erros comuns:
   - "versionCode already used" → esqueceu de bumpar
   - "AAB não assinado" → falta `keystore.properties`
   - "proxy 404" no app instalado → build antigo com `server.url`; refazer + republicar
6. **Referências** — links para `.lovable/memory/project/native-config.md`, workflow CI, script de build.

## Arquivo a criar

- `RELEASE.md` (raiz do projeto, ~120 linhas em português, formatado com headings, blocos de código bash e tabela de troubleshooting)

Sem mudanças em código ou configuração — apenas documentação.


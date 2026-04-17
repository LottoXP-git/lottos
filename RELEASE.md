# Release Android — Lottos

Guia completo do fluxo **manual** de release do app Android (`com.lottos.app`) na Google Play Store. Este é o procedimento oficial — siga na ordem, sem pular etapas.

---

## 1. Visão geral

- **Quando fazer release:** correções críticas, novas features estáveis, mudanças de compliance (Play Store, IARC) ou bump obrigatório por política da loja.
- **O que esperar:** ~10–15 min de build local + upload no Play Console + revisão da Google (algumas horas a 2 dias).
- **Regra de ouro:** todo build de release é **100% offline**. Nunca pode haver `server.url` no `capacitor.config.ts` — senão o app instalado tenta carregar HTML da sandbox Lovable e quebra com **"proxy 404"** quando a sandbox é destruída.

---

## 2. Pré-requisitos

Antes do primeiro release, garanta que sua máquina tem:

| Ferramenta | Versão mínima | Como verificar |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| JDK | 21 | `java -version` |
| Android SDK | API 35+ | `sdkmanager --list` |
| Gradle | (via wrapper) | `./android/gradlew -v` |

E, **na raiz do projeto Android** (`android/`), os seguintes arquivos **locais e não versionados**:

- `android/keystore.properties` com:
  ```properties
  storeFile=lottos-keystore.jks
  storePassword=<senha do keystore>
  keyAlias=<alias da chave>
  keyPassword=<senha da chave>
  ```
- `android/app/lottos-keystore.jks` (ou caminho conforme `storeFile` acima).

> ⚠️ **Sem `keystore.properties`, o `bundleRelease` gera AAB não assinado e a Play Store rejeita o upload.** Faça backup do `.jks` em local seguro — perdê-lo significa nunca mais conseguir publicar updates dessa app.

---

## 3. Passo a passo

### 3.1. Sincronizar o código

```bash
git pull origin main
npm install
```

### 3.2. Bumpar versão

Edite `android/app/build.gradle` e incremente **ambos**:

```gradle
defaultConfig {
    applicationId "com.lottos.app"
    versionCode 7          // ⬅️ +1 em relação ao último publicado
    versionName "1.0.6"    // ⬅️ semver: MAJOR.MINOR.PATCH
}
```

| Campo | Regra |
|---|---|
| `versionCode` | Inteiro, **estritamente +1** em relação ao último upload na Play Store. |
| `versionName` | Semver (`X.Y.Z`). É o que o usuário vê. |

> O workflow CI (`.github/workflows/android-build.yml`) valida automaticamente que `versionCode` foi incrementado quando `build.gradle` muda.

### 3.3. Rodar o script de build

**Linux / macOS:**

```bash
bash scripts/build-android.sh
# ou
npm run build:android
```

**Windows (PowerShell):**

```powershell
npm run build:android:win
# ou diretamente:
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
```

> Windows não tem `bash` nativo. Use o script PowerShell (`scripts/build-android.ps1`), ou alternativamente rode o `.sh` dentro do **Git Bash** / **WSL**.

O script executa, em ordem, e **falha cedo** se algo estiver errado:

1. Valida que `capacitor.config.ts` não tem `server.url`.
2. `npm run build` → gera `dist/`.
3. Valida que `dist/index.html` não referencia domínios `lovable.app`/`lovableproject.com`/`lovable.dev`.
4. `npx cap sync android` → copia para `android/app/src/main/assets/public/`.
5. `./gradlew bundleRelease` → gera AAB assinado.

### 3.4. Localizar os artefatos

Após sucesso:

- **AAB para upload:**
  `android/app/build/outputs/bundle/release/app-release.aab`
- **Símbolos nativos (upload opcional, ajuda crashes):**
  `android/app/build/outputs/native-debug-symbols/release/native-debug-symbols.zip`

### 3.5. Upload no Google Play Console

1. Acesse [Play Console](https://play.google.com/console) → app **Lottos**.
2. **Test and release → Testing → Internal testing → Create new release**.
3. Faça upload do `app-release.aab`.
4. (Opcional) Em **App bundle explorer → Downloads**, suba `native-debug-symbols.zip`.
5. Preencha **Release notes** (PT-BR e EN) descrevendo o que mudou.
6. **Save → Review release → Start rollout to Internal testing**.
7. Após validar internamente, promova: **Promote release → Production**.

---

## 4. Checklist de validação pós-publicação

Depois do rollout para produção (ou faixa interna):

- [ ] Instalar/atualizar o app via Play Store em um dispositivo real.
- [ ] Abrir o app — **não** deve aparecer "proxy 404", tela branca ou erro de rede.
- [ ] Age Gate +18 deve carregar normalmente.
- [ ] Resultados das loterias carregam (Mega-Sena, Lotofácil, etc).
- [ ] (Opcional, técnico) Confirmar que o WebView carrega local:
  ```bash
  adb logcat | grep LottosBoot
  ```
  Saída esperada: `URL: https://localhost/`. **Qualquer outra URL** indica build com `server.url` indevido — refazer e republicar imediatamente.

---

## 5. Troubleshooting

| Sintoma | Causa provável | Correção |
|---|---|---|
| Play Console: *"Version code 6 has already been used"* | Esqueceu de bumpar `versionCode` | Editar `android/app/build.gradle` (+1) e rebuild. |
| `bundleRelease` gera AAB sem assinatura / Play rejeita | `android/keystore.properties` ausente ou caminho do `.jks` errado | Restaurar `keystore.properties` e o `.jks` correspondente. |
| App instalado mostra **"proxy 404"** ou tela branca | Build antigo com `server.url` no `capacitor.config.ts` apontando para sandbox Lovable | Remover `server.url`, bumpar `versionCode`, rebuild via `scripts/build-android.sh`, republicar. |
| `npx cap sync` falha | `dist/` não foi gerado | Rodar `npm run build` manualmente e ver erros. |
| Gradle: *"SDK location not found"* | `ANDROID_HOME` não configurado | Exportar `ANDROID_HOME=$HOME/Android/Sdk` no shell. |
| Script falha em "validando capacitor.config.ts" | Existe `url:` ativo no bloco `server` | Comentar ou remover a linha `url: ...`. |
| Crashes em produção sem stack trace legível | `native-debug-symbols.zip` não foi enviado | Subir o zip em **App bundle explorer → Downloads**. |

---

## 6. Referências

- Script de build: [`scripts/build-android.sh`](./scripts/build-android.sh)
- Workflow CI: [`.github/workflows/android-build.yml`](./.github/workflows/android-build.yml)
- Configuração nativa (memória interna): `.lovable/memory/project/native-config.md`
- Compliance Play Store (memória interna): `.lovable/memory/project/native-compliance.md`
- Capacitor config: [`capacitor.config.ts`](./capacitor.config.ts)
- Versão atual rastreada em: [`android/app/build.gradle`](./android/app/build.gradle)

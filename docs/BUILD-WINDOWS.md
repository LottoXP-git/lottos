# Build Android no Windows — Passo a Passo

Guia oficial para atualizar o projeto, resolver conflitos de `package-lock.json` / `version.properties` e gerar o AAB sem erros.

> Todos os comandos rodam no **PowerShell**, a partir da raiz `C:\Users\loter\lottos`.

---

## 0. Pré-requisitos (faça uma vez)

- Node.js 20+ e npm 10+
- JDK 17 (Temurin) **ou** Android Studio instalado (contém o JBR)
- Android SDK + `ANDROID_HOME` definido
- `keystore.properties` válido em `android/keystore.properties`

O script `scripts/build-android.ps1` localiza o JDK automaticamente — não precisa setar `JAVA_HOME` manualmente.

---

## 1. Fluxo padrão (toda vez que for buildar)

```powershell
# 1. Sincroniza com o remoto
git pull --rebase origin main

# 2. Instala dependências EXATAMENTE como no lockfile
npm ci

# 3. Build + sync + AAB assinado
npm run build:android:checked:win
```

Resultado: `android/app/build/outputs/bundle/release/app-release.aab`

**Regra de ouro:** use `npm ci`, **nunca** `npm install`, exceto quando for adicionar/atualizar um pacote de propósito.

---

## 2. Resolver conflitos comuns

### 2.1. `error: Your local changes ... would be overwritten by merge: android/version.properties`

O arquivo é gerado automaticamente pelo Gradle a cada release. Não deve ficar versionado.

```powershell
git rm --cached android/version.properties 2>$null
git restore android/version.properties 2>$null
git pull --rebase origin main
```

Se aparecer de novo no futuro, repita `git restore android/version.properties` antes do pull.

### 2.2. `error: cannot pull with rebase: You have unstaged changes`

```powershell
git stash push -u
git pull --rebase origin main
git stash pop      # opcional, só se quiser recuperar
```

Se o `stash pop` trouxer de volta `version.properties` ou `package-lock.json` modificados, aplique a 2.1 e/ou a 2.3.

### 2.3. `package-lock.json` modificado / conflito no lockfile

Sempre **descarte o seu** e use o do remoto:

```powershell
git restore package-lock.json
npm ci
```

### 2.4. `npm ci` reclama "package.json and package-lock.json are out of sync"

Significa que o seu clone está atrás do remoto (o `package.json` novo veio do Lovable, o lock não).

```powershell
git status --short
git pull --rebase origin main
npm ci
```

Se ainda falhar após estar em sincronia, regenere o lock:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

(Aqui é OK usar `npm install` — é o caso explícito de regenerar o lock.)

### 2.5. `error: pulling is not possible because you have unmerged files`

```powershell
git rebase --abort 2>$null
git merge --abort 2>$null
git restore --staged .
git restore .
git pull --rebase origin main
```

### 2.6. Reset nuclear (perde mudanças locais)

Quando nada mais funciona e você não tem alterações locais importantes:

```powershell
git fetch origin
git reset --hard origin/main
npm ci
npm run build:android:checked:win
```

---

## 3. Erros de build

### 3.1. `[vite]: Rollup failed to resolve import "@capacitor-community/admob"`

`node_modules` desatualizado. Resolva com:

```powershell
npm ci
```

### 3.2. `'bash' não é reconhecido como um comando interno`

Você rodou o script Linux. No Windows use sempre a variante `:win`:

```powershell
npm run build:android:checked:win
```

### 3.3. Script aborta com "Seu clone está N commit(s) atrás de origin/main"

O `build-android.ps1` força sincronia antes de gerar o AAB. Faça:

```powershell
git pull --rebase origin main
npm ci
npm run build:android:checked:win
```

### 3.4. "JDK não encontrado"

Instale o Temurin 17 (<https://adoptium.net/temurin/releases/?version=17>) **ou** o Android Studio. Reabra o PowerShell e rode de novo.

---

## 4. Versionamento (referência rápida)

- `versionCode`: gerado automaticamente (minutos desde 2024-01-01 UTC) — sempre crescente, nunca duplicado.
- `versionName`: lido de `android/version.properties` (não versionado). O `patch` é auto-incrementado a cada `bundleRelease`.
- Para subir `major`/`minor`, edite manualmente `android/version.properties` antes do build.

---

## 5. Checklist final antes de subir para a Play Store

- [ ] `git pull --rebase origin main` sem conflitos
- [ ] `npm ci` sem erros
- [ ] `npm run build:android:checked:win` finaliza com "Build concluído com sucesso!"
- [ ] AAB existe em `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] `versionCode` e `versionName` confirmados no log do build

Pronto para upload no Google Play Console.
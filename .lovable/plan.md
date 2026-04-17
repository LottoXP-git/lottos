
## Objetivo

Criar `scripts/build-android.ps1`, equivalente PowerShell do `scripts/build-android.sh`, para usuários Windows rodarem o build de release sem precisar de Git Bash ou WSL.

## Paridade com o script bash

O `.ps1` replicará exatamente as 4 etapas do `.sh`:

1. **Validação `capacitor.config.ts`** — falhar se contiver `server.url` ativo (não comentado).
2. **Build web** — `npm run build`.
3. **Validação `dist/`** — checar existência de `dist/`, `dist/index.html`, e ausência de URLs Lovable remotas (`*.lovable.app`, `*.lovableproject.com`, `*.lovable.dev`).
4. **Sync Capacitor** — `npx cap sync android` + validar `android/app/src/main/assets/public/index.html`.
5. **Bundle release** — `cd android; .\gradlew.bat bundleRelease` (usa `gradlew.bat`, não `gradlew`).

## Adaptações Windows-específicas

- `$ErrorActionPreference = "Stop"` (equivalente a `set -e`).
- Uso de `Select-String` no lugar de `grep`.
- `Test-Path` no lugar de `[ -f ]` / `[ -d ]`.
- `.\gradlew.bat` no lugar de `./gradlew` (sem `chmod +x`, desnecessário no Windows).
- Mensagens com prefixos `[OK]`, `[ERRO]` em vez de emojis ✅/❌ (alguns terminais Windows quebram emojis), mas mantendo cores via `Write-Host -ForegroundColor`.
- Working directory: garantir execução a partir da raiz do projeto via `Push-Location` / `Pop-Location`.

## Como rodar

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
```

Ou, se a política já permitir:

```powershell
.\scripts\build-android.ps1
```

## Atualizações complementares

- **`package.json`**: ajustar `"build:android"` para detectar SO automaticamente. Opção mais simples e robusta: usar `node` para fazer o dispatch.
  - Alternativa A (preferida): adicionar segundo script `"build:android:win": "powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1"` e manter `build:android` como bash. Usuário escolhe.
  - Alternativa B: substituir `build:android` por um pequeno wrapper Node que detecta `process.platform === 'win32'`.
  
  Vou usar **Alternativa A** (mais explícita, sem arquivo extra).

- **`RELEASE.md`**: adicionar nota curta na seção "Passo a passo" explicando que usuários Windows devem rodar `npm run build:android:win` (ou o `.ps1` direto), e usuários Linux/macOS continuam com `npm run build:android`.

## Arquivos a alterar

| Arquivo | Ação |
|---|---|
| `scripts/build-android.ps1` | criar (~90 linhas, PowerShell) |
| `package.json` | adicionar script `build:android:win` |
| `RELEASE.md` | adicionar nota Windows na seção de build |

Sem mudanças em código de aplicação.

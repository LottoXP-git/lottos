## Diagnóstico

As mudanças feitas aqui no Lovable **são commitadas automaticamente no GitHub** (branch `main` do repo `LottoXP-git/lottos`), mas o build do AAB acontece **na sua máquina local** (`C:\Users\loter\lottos`). Se o seu clone local não estiver atualizado com o `origin/main`, o `npm run build` + `npx cap sync` vão empacotar a versão antiga.

Nas últimas mensagens isso já apareceu duas vezes:

```
error: Your local changes to the following files would be overwritten by merge:
        android/version.properties   (e antes: public/sitemap.xml)
Aborting
```

Ou seja: o `git pull` está sendo **abortado** por causa de arquivos modificados localmente (gerados pelo próprio build). Resultado: você gera o AAB sem nunca ter puxado o que o Lovable commitou.

## Causas prováveis (em ordem)

1. **`git pull` abortando** por `android/version.properties` (auto-bumpado pelo build local) e/ou `public/sitemap.xml` (gerado pelo `generate-sitemap`). Esses arquivos ficam "dirty" toda vez que você builda, e bloqueiam o merge.
2. **Build sem `git pull` antes.** Se o fluxo for `npm run build:android:checked` direto, sem sincronizar com `origin/main`, o AAB sai com o código antigo.
3. **`npx cap sync` não rodou** após o `npm run build`, então `android/app/src/main/assets/public/` continua com o bundle antigo embutido no APK/AAB. (O script `build-android.ps1` já faz isso, mas só se for ele que está sendo executado.)
4. **Cache do Gradle** segurando assets antigos — raro, mas acontece se `cap sync` falhou silenciosamente.

## Plano de correção

### 1. Parar de versionar arquivos auto-gerados
Adicionar ao `.gitignore` (na próxima execução em build mode):
- `android/version.properties` (já é auto-bumpado pelo build → não deve ficar versionado)
- Confirmar que `public/sitemap.xml` continua ignorado

E remover do índice do Git com `git rm --cached` na sua máquina (comando que eu te passo, não roda aqui).

### 2. Padronizar o fluxo local de release
Sempre nesta ordem, na sua máquina:

```powershell
git stash -u                      # guarda qualquer lixo local
git pull --rebase origin main     # traz o que o Lovable commitou
git stash pop                     # (ou descarta com: git stash drop)
npm ci                            # garante deps iguais ao lockfile
npm run build:android:checked     # web build + cap sync + AAB + check de versionCode
```

O `build:android:checked` já chama `npm run build` → `npx cap sync android` → `gradlew bundleRelease` → `check-aab-version.mjs`. Se o pull for feito **antes**, o AAB sai com o código novo.

### 3. Adicionar uma verificação "está sincronizado com origin?" no script
Incluir no início de `scripts/build-android.ps1` e `scripts/build-android.sh` um check:
- `git fetch origin main`
- Comparar `HEAD` com `origin/main`
- Se estiver atrás, **abortar** com mensagem clara: *"Seu clone está N commits atrás de origin/main. Rode `git pull` antes de buildar."*

Isso impede gerar AAB de código defasado por engano.

### 4. Validar visualmente o que está no AAB
Depois do build, o `check-aab-version.mjs` mostra `versionName` / `versionCode`. Vou adicionar nele também:
- O **hash curto do commit** atual (`git rev-parse --short HEAD`) embutido como `BuildConfig` ou impresso no log.
- Assim, ao instalar, dá pra confirmar que o AAB veio do commit certo.

## Detalhes técnicos

- `android/version.properties` é escrito pelo `build.gradle` a cada build de release → nunca deveria estar tracked. Vou movê-lo pro `.gitignore` e commitar uma cópia inicial como `android/version.properties.template`.
- `public/sitemap.xml` é gerado por `scripts/generate-sitemap.ts` → mesmo tratamento (já está no `.gitignore` conforme histórico, confirmar).
- O guard no script vai usar `git rev-list --count HEAD..origin/main`; se > 0, falha.

## O que **não** vou mexer
- Código de aplicação (componentes, edge functions, lógica de negócio).
- `capacitor.config.ts` (já validado, sem `server.url`).
- Workflow de CI (`.github/workflows/android-build.yml`) — ele já valida bump de versionCode no GitHub.

Quer que eu prossiga com esse plano (ignore + guard no script + hash do commit no check)?

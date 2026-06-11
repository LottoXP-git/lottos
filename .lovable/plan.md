## Problema

O Play Console rejeitou o `app-release.aab` com "Código de versão 10 já foi usado". Isso significa que o AAB enviado foi gerado com `versionCode = 10` — **valor antigo, hardcoded**.

No Lovable, o `android/app/build.gradle` já foi atualizado para usar `versionCode` automático (minutos desde 2024-01-01 UTC, gerando ~1.280.000+). Como você roda o build localmente no Windows, o repositório da sua máquina precisa estar sincronizado com essas mudanças antes de gerar o AAB.

## Passos para resolver

Execute na raiz do projeto, no PowerShell:

```powershell
# 1. Puxe as últimas mudanças do Lovable (build.gradle + version.properties + scripts)
git pull

# 2. Confirme que o build.gradle local NÃO tem mais "versionCode 10"
Select-String -Path "android/app/build.gradle" -Pattern "versionCode"
# Deve mostrar: versionCode autoVersionCode  (NÃO "versionCode 10")

# 3. (Opcional) Confirme que version.properties existe
Get-Content android/version.properties

# 4. Limpe o build anterior para garantir AAB novo
cd android
.\gradlew.bat clean
cd ..

# 5. Rode o build de release
npm run build:android:win
```

## O que observar no output

Durante o build, o `build.gradle` imprime uma linha que confirma os valores reais que serão usados no AAB:

```
[Lottos] versionName=1.1.2 versionCode=1281234 (releaseBuild=true)
```

- `versionCode` deve ser um número grande (~1.280.000+), **nunca 10**.
- `releaseBuild=true` confirma que o `patch` foi auto-incrementado.

E no final, o script PowerShell também imprime:

```
versionCode gerado: ~1281234 (auto, minutos desde 2024-01-01 UTC)
versionName atual:   1.1.2 (patch auto-incrementado neste build)
```

## Upload no Play Console

Suba o arquivo recém-gerado:

```
android/app/build/outputs/bundle/release/app-release.aab
```

Confirme no Play Console (aba "Detalhes do app bundle") que o `versionCode` mostrado é o número grande — não 10, 11 ou 12.

## Se ainda falhar

Caso `git pull` reporte conflitos ou as alterações não apareçam, me avise com:
- saída de `git status`
- saída de `Select-String -Path "android/app/build.gradle" -Pattern "versionCode"`

que eu te ajudo a desbloquear.
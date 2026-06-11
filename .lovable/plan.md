# Corrigir rejeição do Play Console: bump de versão

## Causa
O Play Console rejeita AABs com `versionCode` igual ao de uma versão já enviada. O `android/app/build.gradle` ainda está em `versionCode 11` / `versionName "1.1.0"` — mesmo valor do upload anterior.

## Mudança
Editar `android/app/build.gradle`:

```
versionCode 12
versionName "1.1.1"
```

Nada mais é alterado (sem mexer em código de feature, keystore, scripts).

## Próximos passos para você (local)
1. `git pull origin main`
2. `npm run build:android:win` (ou `bash scripts/build-android.sh`)
3. Subir o novo `app-release.aab` no Play Console
4. Release notes sugeridas v1.1.1: "Correções e melhorias."

Se preferir outro número (ex: pular para `versionCode 20` / `versionName "1.2.0"`), me diga antes de aprovar.

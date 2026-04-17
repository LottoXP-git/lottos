

## Problema

O usuário está reportando que o app instalado no celular (via Play Store) está dando erro **"proxy 404"**. Isso é o sintoma clássico de um build Capacitor que tenta carregar uma URL remota (sandbox da Lovable) em vez dos arquivos locais — exatamente o problema que discutimos antes.

## Diagnóstico

Vou verificar o estado atual da configuração para confirmar a causa.
<lov-tool-use id="toolu_vrtx_01HTeNpUNipLx6h7x8kxRz9K" name="code--view" integration-id="code" data="{\"file_path\": \"capacitor.config.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_013xHsL2cWuRMgCofixVM4sk" name="code--view" integration-id="code" data="{\"file_path\": \"android/app/build.gradle\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_013eK745bsZWM7DkNjQhzagf" name="code--view" integration-id="code" data="{\"file_path\": \"android/app/src/main/AndroidManifest.xml\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01ATzkBcc7LHxV3UUVKsDBbA" name="code--view" integration-id="code" data="{\"file_path\": \"capacitor.config.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01H67cJ18j3GwUGTxFjPcWcB" name="code--view" integration-id="code" data="{\"file_path\": \"android/app/src/main/AndroidManifest.xml\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01WDhCy43pX6r7BB3YqoxKhU" name="code--view" integration-id="code" data="{\"file_path\": \"android/app/build.gradle\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01M81JC9XMghPrnGeANA92UM" name="code--exec" integration-id="code" data="{\"command\": \"ls android/app/src/main/assets/ 2>/dev/null && echo \\\"---\\\" && ls android/app/src/main/assets/public/ 2>/dev/null | head -30\", \"user_facing_description\": \"Verificando arquivos web sincronizados no Android\"}">
</lov-tool-use>
A pasta `android/app/src/main/assets/` nem sequer existe no repositório — isso é normal pois ela é criada pelo `npx cap sync` localmente. Mas isso confirma o ponto: o erro vem do AAB que está atualmente publicado na Play Store, não do código fonte atual.

<lov-plan>

## Diagnóstico do erro "proxy 404" no app instalado

A configuração no repositório está correta:
- `capacitor.config.ts` **NÃO tem** `server.url` (apenas `appId`, `appName`, `webDir: 'dist'`)
- `versionCode = 5` / `versionName = "1.0.4"` já estão atualizados
- Validações no `scripts/build-android.sh` já existem

**O problema é externo ao código:** o APK/AAB que está no celular do usuário ainda é uma **versão antiga** (provavelmente versionCode 4 ou anterior) que foi compilada quando o `capacitor.config.ts` ainda tinha um `server.url` apontando para a sandbox da Lovable. Aquela URL antiga não existe mais → o WebView recebe 404 do proxy.

**Lovable não pode resolver isso editando arquivos.** O fix exige rebuild local + republicação na Play Store. Eu posso porém endurecer o código para garantir que o próximo AAB seja 100% offline e fácil de validar.

## Causa raiz

```text
APP INSTALADO (Play Store)         CÓDIGO ATUAL (repo)
┌─────────────────────────┐        ┌─────────────────────────┐
│ AAB compilado com       │        │ capacitor.config.ts     │
│ server.url = sandbox    │        │ SEM server.url ✅       │
│ Lovable (URL morta) ❌  │   vs   │ versionCode 5 ✅        │
│ → WebView faz GET       │        │ Pronto para build       │
│ → 404 proxy             │        │                         │
└─────────────────────────┘        └─────────────────────────┘
        ↑                                    ↑
  o que está no celular              o que precisa virar AAB
                                     e ser enviado à Play Store
```

## O que vou fazer no código (Plano)

1. **Bumpar versão para forçar update na Play Store**
   - `android/app/build.gradle`: `versionCode 5 → 6`, `versionName "1.0.4" → "1.0.5"`
   - Garante que usuários com a versão bugada recebam o update assim que o novo AAB for publicado.

2. **Reforçar `scripts/build-android.sh` com checagens extras de "app offline"**
   - Validar que `dist/index.html` referencia assets relativos (sem `https://*.lovable.app` ou `https://*.lovableproject.com` hardcoded em `<script src>` / `<link href>`).
   - Validar que após `npx cap sync`, a pasta `android/app/src/main/assets/public/index.html` existe e contém o app real (não um redirect HTML).
   - Mensagem de erro clara apontando o que fazer caso falhe.

3. **Adicionar um `MainActivity` log de boot** (opcional, defensivo)
   - Pequeno log no `onCreate` do `MainActivity.java` para que, se o problema voltar, o usuário consiga ver no `adb logcat` qual URL está carregando.

4. **Atualizar memória `mem://project/native-config`** documentando definitivamente: nunca commitar `server.url` e sempre rodar `bash scripts/build-android.sh` (que valida tudo) antes de gerar AAB.

## O que VOCÊ precisa fazer (obrigatório, fora da Lovable)

Sem estas etapas o erro continua porque o app no celular não muda sozinho:

1. `git pull` no seu PC para puxar versionCode 6.
2. `bash scripts/build-android.sh` → gera `android/app/build/outputs/bundle/release/app-release.aab`.
3. **Subir esse novo AAB no Google Play Console** (faixa de produção ou interna).
4. Aguardar a Play Store publicar e atualizar o app no celular (ou desinstalar e instalar a nova versão).
5. Abrir o app — deve carregar local, sem nenhuma chamada à internet para HTML/JS/CSS.

## Detalhes técnicos resumidos

- Capacitor sem `server.url` → WebView usa esquema `https://localhost` apontando para `android_asset/public/index.html` (offline).
- Com `server.url` setado para sandbox Lovable → WebView vai à internet buscar HTML; se a sandbox foi destruída, retorna 404 proxy. Foi exatamente o que aconteceu.
- Bump de versão é obrigatório porque a Play Store rejeita uploads com `versionCode` igual ao já publicado.


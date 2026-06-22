Objetivo: registrar o Google Mobile Ads SDK no app Android do Lottos, seguindo o guia oficial da AdMob. Os pré-requisitos de SDK jáfunctions ext in variables.gradle) já estão satisfeitos: minSdkVersion 24 (>= 23) e compileSdkVersion 36 (>= 35).

Tarefas

1. Adicionar dependência do Google Mobile Ads SDK
   - Arquivo: `android/app/build.gradle`
   - Ação: incluir `implementation("com.google.android.gms:play-services-ads:25.4.0")` no bloco `dependencies`.

2. Registrar o AdMob App ID no AndroidManifest.xml
   - Arquivo: `android/app/src/main/AndroidManifest.xml`
   - Ação: adicionar a tag `<meta-data>` dentro do nó `<application>` com:
     - `android:name="com.google.android.gms.ads.APPLICATION_ID"`
     - `android:value="ca-app-pub-2147498950861352~1835716024"`

3. Validação do build
   - Executar `./gradlew assembleDebug` (ou equivalente do script do projeto) para confirmar que o build não quebra com a nova dependência e a meta-data.

4. Sincronização com o projeto web (após publicação)
   - Como o app é Capacitor, instruir o usuário a executar `npx cap sync` após publicar o site, para refletir as mudanças nativas no projeto Android.

Notas
- Não serão instalados plugins Capacitor de AdMob (nenhum anúncio nativo será exibido nesta etapa).
- Os anúncios atuais via AdSense no WebView continuam funcionando normalmente.
- O `AD_ID` permission já existe no manifest.
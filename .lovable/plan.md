## Problema

Na versão nativa (Android/iOS via Capacitor) o compartilhamento de imagens não funciona porque o código atual depende só de APIs web:

- `navigator.canShare({ files })` retorna `false` em muitas WebViews do Capacitor → cai no fallback.
- O fallback usa `<a download>` para "baixar" a imagem, mas a WebView do Android não salva blobs assim — o arquivo simplesmente desaparece.
- `window.open("https://wa.me/...")` dentro da WebView abre uma aba em branco em vez de o app do WhatsApp/Instagram.

Resultado: usuário toca em "WhatsApp"/"Instagram"/"Outros apps" e nada acontece (ou abre um popup vazio), sem imagem anexada.

## Solução

Usar os plugins nativos do Capacitor para escrever o arquivo no dispositivo e disparar o share sheet nativo, mantendo o fluxo web atual como fallback no navegador.

### Passos

1. **Instalar plugins** (padrão Capacitor):
   - `@capacitor/share` — share sheet nativo com anexo de arquivo.
   - `@capacitor/filesystem` — grava a imagem em cache para gerar um `file://` URI compartilhável.

2. **Criar helper `src/lib/nativeShare.ts`** com:
   - `isNativePlatform()` (via `Capacitor.isNativePlatform()`).
   - `shareImageNative(file, caption, title?)` — converte o `Blob` em base64, escreve em `Directory.Cache` com `Filesystem.writeFile`, pega o `uri` com `Filesystem.getUri` e chama `Share.share({ title, text: caption, url: uri, dialogTitle })`. Retorna outcome (`shared` | `aborted` | `error`).
   - `shareTextNative(text, url?)` — chama `Share.share({ text, url })`.

3. **Refatorar `src/lib/socialShare.ts`** para, em plataforma nativa:
   - `shareImageToWhatsApp` / `shareImageToInstagram`: chamar `shareImageNative` (share sheet nativo já lista WhatsApp/Instagram diretamente com a imagem anexa). Não abrir `wa.me` nem `instagram.com` na WebView.
   - `shareTextToWhatsApp`: usar o plugin `Share` no nativo.
   - No web, manter exatamente o comportamento atual (Web Share API + `wa.me` + download).

4. **Ajustar `ShareResultImageButton`, `ShareCardImageButton`, `SharePreviewDialog`, `ShareablePickButton`, `ResultsSummaryModal`**:
   - Botão "Outros apps" e handlers de `navigator.share`: encaminhar para `shareImageNative` quando `isNativePlatform()`.
   - O botão "Baixar PNG" no nativo: usar `Filesystem.writeFile` em `Directory.Documents` (ou `Directory.Cache` + `Share`) — evitar o `<a download>` que não funciona na WebView.

5. **Não mexer em nada de UI/estilo** — só a camada de compartilhamento.

### Detalhes técnicos

- Import dinâmico dos plugins (`await import("@capacitor/share")`) para não quebrar o preview web nem aumentar o bundle inicial.
- `Filesystem.writeFile` precisa de string base64 sem o prefixo `data:`; conversão feita com `FileReader.readAsDataURL` + `split(",")[1]`.
- No iOS o `Share.share({ url })` aceita `file://` URIs gerados pelo Filesystem.
- Após o `sync`, o usuário precisa rodar `npx cap sync android` uma vez para os plugins nativos serem registrados.

### Verificação

- `tsgo` para checagem de tipos.
- Instruir o usuário: `git pull`, `npm ci`, `npx cap sync android`, rebuild — testar tocar "WhatsApp"/"Instagram" no modal de resultado no aparelho.
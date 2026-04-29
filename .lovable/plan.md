## Preparação do Lottos para publicação na App Store (iOS)

Plano focado nos **ajustes dentro do projeto Lovable** que destravam o build iOS via Capacitor. Tudo que é externo (Apple Developer, Xcode, certificados, App Store Connect) está documentado no passo-a-passo do README, pois precisa ser feito por você no Mac.

---

### 1. Adicionar plataforma iOS ao Capacitor (config + scripts)

- Adicionar dependência `@capacitor/ios` ao `package.json`.
- Criar `scripts/build-ios.sh` espelhando o `build-android.sh` atual:
  - Validar que `capacitor.config.ts` **não tem `server.url`** (mesma regra anti-proxy 404 já aplicada no Android — está na memória `native-config`).
  - Rodar `npm run build` → validar `dist/index.html` → `npx cap sync ios`.
  - Instruir o desenvolvedor a abrir `ios/App/App.xcworkspace` no Xcode para Archive/Upload.
- Não vamos rodar `npx cap add ios` aqui no sandbox (precisa de macOS/CocoaPods). O script orienta o usuário a rodar isso localmente uma vez, depois do `git pull`.

### 2. Meta tags iOS no `index.html`

Adicionar dentro do `<head>`:
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- `<meta name="apple-mobile-web-app-title" content="Lottos">`
- `<meta name="format-detection" content="telephone=no">`
- `<meta name="theme-color" content="#0F172A">` (cor de fundo do app, alinhada à identidade)
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`

### 3. Conformidade obrigatória App Store — esconder anúncios em iOS

A Apple **rejeita** apps que mostram anúncios sem que estejam corretamente integrados via SDK nativo (Google Mobile Ads SDK), e o AdSense web em WebView é proibido pela política do AdSense. Solução para a primeira submissão:

- Criar helper `src/lib/platform.ts` com `isNativeIOS()` baseado em `Capacitor.getPlatform() === 'ios'`.
- Em `src/components/AdBanner.tsx`: se `isNativeIOS()`, retornar `null` (não renderizar `<ins>` nem carregar `adsbygoogle.push`).
- Em `index.html`: manter o script do AdSense (ele só dispara se houver `<ins>` na página, então não viola nada — mas adicionamos um comentário explicando).
- Resultado: web continua monetizado normalmente; o app iOS sobe limpo e passa na revisão.

> Monetização nativa iOS via AdMob fica como passo 2 (depois da primeira aprovação), pois exige SDK nativo e conta AdMob — fora do escopo desta entrega.

### 4. Ícone e splash screen

- Garantir um arquivo fonte `public/apple-touch-icon.png` (180×180) e `public/icon-1024.png` (1024×1024, sem transparência — exigência da App Store).
- Documentar no README como gerar todos os tamanhos com `@capacitor/assets` (`npx capacitor-assets generate --ios`) a partir de `resources/icon.png` e `resources/splash.png`.
- **Não vou gerar a arte aqui** — você precisa me enviar/aprovar a imagem 1024×1024 do logo do Lottos. Se ainda não tiver, posso gerar uma proposta com IA depois.

### 5. README com passo-a-passo iOS

Adicionar seção `## Build iOS` ao `README.md` cobrindo:
- Pré-requisitos (Mac, Xcode 15+, conta Apple Developer US$99/ano, CocoaPods).
- Comandos: `git pull` → `npm install` → `npx cap add ios` (só na 1ª vez) → `bash scripts/build-ios.sh` → abrir Xcode.
- Configuração no Xcode: Signing & Capabilities (Team), Bundle ID `com.lottos.app`, Version/Build numbers.
- Archive → Distribute App → App Store Connect.
- Checklist de App Store Connect: classificação +18 (já alinhado com Age Gate), categoria, screenshots (6.7" e 6.5"), descrição, política de privacidade (já existe em `/politica-privacidade`), texto explicando "este app não tem vínculo oficial com a Caixa" (já no Footer).
- Aviso explícito: **não habilitar `server.url` em `capacitor.config.ts`** (mesma regra do Android).

### 6. Atualizar memória do projeto

Criar `mem://project/native-config-ios.md` registrando:
- Bundle ID `com.lottos.app` compartilhado com Android.
- Regra: AdSense oculto em iOS nativo até integração AdMob.
- Caminho do workspace Xcode e script de build.

---

### Arquivos a criar/editar

```text
package.json                          (+ @capacitor/ios)
index.html                            (+ meta tags iOS)
scripts/build-ios.sh                  (novo)
src/lib/platform.ts                   (novo)
src/components/AdBanner.tsx           (early-return em iOS)
README.md                             (+ seção Build iOS)
mem://project/native-config-ios.md    (novo)
```

### O que NÃO está incluído (precisa de você)

- Inscrição no Apple Developer Program (US$99/ano).
- Acesso a um Mac com Xcode (sandbox Lovable não compila iOS).
- Geração/aprovação da arte 1024×1024 do ícone.
- Criação do app no App Store Connect, screenshots e textos da loja.
- Integração AdMob nativa (fase 2, pós-aprovação).

Confirma que quer prosseguir com esses 6 itens? Se preferir, posso remover o item 3 (esconder ads em iOS) e tentar publicar com os anúncios — mas o risco de rejeição é alto.
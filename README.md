# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.

## Build iOS (App Store)

O Lottos é empacotado como app nativo via **Capacitor** (`appId: com.lottos.app`). O build iOS **só roda em Mac com Xcode** — a sandbox Lovable e máquinas Linux/Windows não conseguem compilar.

### Pré-requisitos

- Mac com **macOS 14+** e **Xcode 15+**
- **CocoaPods**: `sudo gem install cocoapods`
- Conta **Apple Developer Program** ativa (US$ 99/ano)
- App criado no **App Store Connect** com Bundle ID `com.lottos.app`
- Ícone fonte 1024×1024 (sem transparência) em `resources/icon.png` e splash em `resources/splash.png`

### Primeira vez (setup local)

```sh
git pull
npm install
npx cap add ios            # cria a pasta ios/ — só uma vez
npx capacitor-assets generate --ios   # gera todos os tamanhos de ícone/splash
```

### A cada release

```sh
git pull
npm install
bash scripts/build-ios.sh  # valida + builda web + npx cap sync ios
open ios/App/App.xcworkspace
```

No Xcode:

1. **Signing & Capabilities** → selecione seu Team
2. Confirme **Bundle Identifier** = `com.lottos.app`
3. Bumpe **Version** (semver, ex.: 1.0.6) e **Build** (inteiro +1) em Info
4. **Product → Archive**
5. Janela Organizer → **Distribute App → App Store Connect → Upload**

### Regras críticas (NÃO QUEBRAR)

- **`capacitor.config.ts` NUNCA pode conter `server.url`** em release. Mesma regra do Android — se tiver, o app instalado tenta carregar a sandbox Lovable e fica inutilizável quando ela cai. O `scripts/build-ios.sh` valida isso automaticamente.
- **AdSense é ocultado em iOS nativo** (`src/components/AdBanner.tsx` faz early-return via `isNativeIOS()`). Mostrar AdSense em WebView viola a política do AdSense **e** costuma causar rejeição da Apple. Monetização nativa via AdMob fica para a v2.
- **Política de Privacidade pública obrigatória**: já está em `/politica-privacidade` (URL pública é exigência da App Store Connect).
- **Classificação etária 17+** no App Store Connect (alinhado ao Age Gate +18 do app).

### Checklist App Store Connect

- [ ] Categoria primária: **Entretenimento** (ou Utilitários)
- [ ] Classificação etária: **17+** (Apostas/Loterias frequente/intenso)
- [ ] Screenshots: **6.7"** (iPhone 15 Pro Max) e **6.5"** (iPhone 11 Pro Max)
- [ ] Descrição menciona explicitamente: *"Este app não possui vínculo oficial com a Caixa Econômica Federal."*
- [ ] URL de Política de Privacidade: `https://grupolottoxp.com/politica-privacidade`
- [ ] URL de Suporte preenchida
- [ ] Texto de revisão: explicar que o app apenas exibe resultados públicos da Caixa (não vende, não paga prêmios)
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

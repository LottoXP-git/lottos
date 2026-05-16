## Diagnóstico

Auditoria do projeto contra os requisitos do Google AdSense (Programa Policies + Better Ads Standards). Pontos críticos identificados:

### Bloqueios prováveis de aprovação

1. **Inconsistência de domínio (alto risco)**  
   O `index.html`, `Footer`, `Index.tsx` e botões de compartilhamento ainda apontam para `lottos.lovable.app`, mas o site oficial é `grupolottoxp.com` (canonical, sitemap, ads.txt). O AdSense verifica o domínio cadastrado: se `og:url` / canonical / Organization JSON-LD divergem, o crawler pode classificar como duplicado/subdomínio Lovable e rejeitar.

2. **Conteúdo de loterias sem disclaimer de jogo responsável (alto risco)**  
   AdSense permite conteúdo de loteria, mas exige aviso claro de “+18 / jogo responsável” visível e link para ajuda (Jogadores Anônimos, CVV). Hoje só existe o AgeGate.

3. **Falta de página “Sobre” (médio risco)**  
   AdSense exige *About*, *Contact*, *Privacy*. Hoje só há Privacidade + Termos + e-mail no rodapé.

4. **Sem banner de consentimento de cookies / CMP (médio risco)**  
   Desde 2024, AdSense exige CMP certificada para tráfego EEE/UK. Mesmo para BR-only é boa prática para LGPD e aumenta a chance de aprovação.

5. **AgeGate bloqueia conteúdo no primeiro paint (médio risco)**  
   O modal cobre 100% da viewport antes do bot Google avaliar o site. Já há detecção de UA, mas o AdsBot do AdSense usa UA `AdsBot-Google` que está listado — preciso confirmar e tornar a detecção também server-friendly (atributo no `<html>`).

6. **Densidade de anúncios vs conteúdo (médio risco)**  
   Páginas com `AdBanner` acima do primeiro parágrafo violam Better Ads. Verificar e mover banners para baixo do primeiro bloco de conteúdo.

7. **ads.txt + meta `google-adsense-account`** — já corretos.

8. **`og-image.jpg` apontando para lovable.app** — quebrará preview se o crawler validar pelo domínio canônico.

---

## Plano de ação

### 1. Padronizar domínio em `grupolottoxp.com`

- `index.html`: trocar `og:image` / `og:image:secure_url` / `twitter:image` para `https://grupolottoxp.com/og-image.jpg`. Adicionar `<link rel="canonical" href="https://grupolottoxp.com/">`.
- `src/pages/Index.tsx`: trocar todas as URLs `lottos.lovable.app` por `grupolottoxp.com` (WebSite JSON-LD, Organization logo, image).
- `src/components/Footer.tsx` (`handleShareApp`), `ShareResultImageButton.tsx`, `generator/ShareablePickButton.tsx`: trocar texto e URL de compartilhamento.
- Verificar `src/lib/breadcrumb.ts` (`SITE_URL`) — já deve estar em grupolottoxp.

### 2. Criar página `/sobre`

- Nova rota `src/pages/About.tsx` com:
  - Quem somos / missão do app.
  - Esclarecimento de que o app é informativo e independente da Caixa.
  - Equipe / localização (Olinda/PE).
  - Contato.
- Adicionar rota em `App.tsx` e link no `Footer`.
- Helmet com title/description/canonical próprios + JSON-LD `AboutPage` + Breadcrumb.

### 3. Página + bloco de Jogo Responsável

- Nova rota `/jogo-responsavel` com orientações, sinais de alerta e links para CVV (188) e Jogadores Anônimos BR.
- Adicionar bloco compacto no rodapé: ícone + texto “Jogue com responsabilidade. +18. Se precisar de ajuda: CVV 188” + link.
- Adicionar reforço no AgeGate.

### 4. Banner de consentimento de cookies (CMP leve)

- Componente `CookieConsent.tsx` exibido no primeiro acesso:
  - Texto curto LGPD + AdSense.
  - Botões: “Aceitar”, “Recusar não essenciais”, link para Privacidade.
  - Persistência em `localStorage` (`lottos_cookie_consent`).
- Carregar o script do AdSense só após consentimento OU após X segundos como fallback (manter o tag `<script async>` no `index.html` mas com `data-ad-client` apenas; remoção dinâmica é complexa — alternativa simpler: manter script, mas habilitar `(adsbygoogle = window.adsbygoogle || []).push({"google_tag_params": {"npa": 1}})` quando recusado).
- Garantir compatibilidade com a abordagem atual em `AdBanner.tsx`.

### 5. Endurecer AgeGate para crawlers

- Expandir lista de UAs em `BOT_UA_PATTERN` para incluir explicitamente `AdsBot-Google-Mobile-Apps`, `APIs-Google`, `Storebot-Google`, `GoogleProducer`.
- Definir `document.documentElement.dataset.bot = "true"` quando bot for detectado (ajuda em testes).
- Quando bot detectado, montar a rota normalmente já é o comportamento atual — manter.
- Adicionar `noscript` no `index.html` com texto descritivo do site (para crawlers sem JS, embora Googlebot execute JS, é redundância segura).

### 6. Revisar densidade/posicionamento de anúncios

- Auditar `Index.tsx`, `History.tsx`, `LotteryDraw.tsx`, `HowToWin.tsx`, `MonthlyReport.tsx`: garantir que nenhum `<AdBanner>` aparece antes do primeiro `<h1>` + 1 parágrafo de conteúdo. Mover banners se necessário.
- Garantir rótulo “Anúncio” visível (já existe no componente).
- Limitar a 1 banner por viewport mobile.

### 7. Conteúdo institucional / E-A-T

- Atualizar `PrivacyPolicy.tsx` para mencionar especificamente Google AdSense, cookies de personalização, opt-out via `adssettings.google.com` (parágrafo já existe, reforçar e linkar).
- Atualizar `TermsOfUse.tsx` com cláusula de jogo responsável + “sem garantia de prêmio”.
- Adicionar `dateModified` visível em ambas.

### 8. Verificações finais

- Rodar build local para confirmar que todas as rotas funcionam.
- Validar canonical/og em DevTools.
- Pedir ao usuário para reenviar o site no painel do AdSense após deploy.

---

## Detalhes técnicos

- **Arquivos novos**: `src/pages/About.tsx`, `src/pages/ResponsibleGambling.tsx`, `src/components/CookieConsent.tsx`.
- **Arquivos editados**: `index.html`, `src/App.tsx`, `src/components/Footer.tsx`, `src/components/AgeGate.tsx`, `src/pages/Index.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfUse.tsx`, `src/components/ShareResultImageButton.tsx`, `src/components/generator/ShareablePickButton.tsx`, `scripts/generate-sitemap.ts` (adicionar `/sobre`, `/jogo-responsavel`), `public/sitemap.xml` (regenerar).
- **Sem mudanças de schema/banco/Edge Functions** — apenas frontend + conteúdo institucional.

---

## Fora do escopo

- Integração com CMP certificada paga (Google Funding Choices, Cookiebot). Implementaremos CMP própria simples; se o tráfego EEE crescer, recomenda-se migrar.
- Mudança de provedor de anúncios.
- Reescrita do AgeGate em SSR (exigiria sair do Vite SPA).

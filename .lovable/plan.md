
# Correção das violações do Google AdSense

O AdSense sinalizou duas políticas:

1. **"Anúncios em telas sem conteúdo do editor"** — anúncios aparecem em páginas que não têm conteúdo original suficiente do editor (ou que mostram só placeholders/erros).
2. **"Conteúdo de baixo valor"** — páginas com pouco texto/utilidade e muitos anúncios.

Mapeei no código os pontos exatos que provavelmente dispararam essas políticas e proponho correções.

## Diagnóstico — onde estão os problemas

| Página | Problema |
|---|---|
| `src/pages/NotFound.tsx` (404) | Mostra apenas "Página não encontrada" + 1 link, mas exibe `AdBanner`. Clássico caso de "ad em tela sem conteúdo". |
| `src/pages/PrivacyPolicy.tsx` | `AdBanner leaderboard` no topo, antes de qualquer conteúdo. Páginas legais/utilitárias com anúncio acima da dobra são comumente reprovadas. |
| `src/pages/TermsOfUse.tsx` | Mesmo problema do Privacy. |
| `src/components/AgeGate.tsx` | Bloqueia toda a aplicação até o usuário confirmar idade. Quando o crawler do AdSense (sem o User-Agent listado em `BOT_UA_PATTERN`) cai no site, ele só vê o gate — "tela sem conteúdo". A whitelist atual cobre Googlebot/Mediapartners/AdsBot, mas é frágil. |
| `src/pages/Index.tsx` | 4 unidades de anúncio (`leaderboard`, `inline`, `interstitial`, mais o do Footer) em uma página com cards de loteria que dependem de fetch — se a API falhar ou enquanto carrega, a página fica "leve" demais para a quantidade de ads. |
| `src/pages/History.tsx` | Tem `useAdSenseScript` e `AdBanner`, mas a tabela depende de filtros — em estados vazios, o conteúdo fica escasso ao lado dos anúncios. |

## Plano de correção

### 1. Remover anúncios de páginas utilitárias
- `src/pages/NotFound.tsx`: remover o `<AdBanner>` e o import. 404 nunca deve servir anúncios.
- `src/pages/PrivacyPolicy.tsx`: remover o `<AdBanner>` do topo (e o import). Páginas legais ficam sem ads.
- `src/pages/TermsOfUse.tsx`: idem.

### 2. Garantir que o AgeGate não atrapalhe a indexação dos crawlers do AdSense
- Em `src/components/AgeGate.tsx`, ampliar a regex `BOT_UA_PATTERN` para incluir variantes recentes: `AdsBot-Google-Mobile`, `AdsBot-Google-Mobile-Apps`, `Google-InspectionTool`, `Google-Read-Aloud`, `Chrome-Lighthouse`, `GoogleOther`. Isso garante que o robô do AdSense passe direto para a Home e veja conteúdo real.

### 3. Reduzir densidade de anúncios na Home
Em `src/pages/Index.tsx`:
- Remover o `AdBanner format="interstitial"` (entre Prize Ranking e Registration) — é o terceiro anúncio na mesma rolagem e em zona com pouco texto.
- Manter apenas: 1 leaderboard após o gerador + 1 inline depois dos resultados. Isso reduz densidade e melhora "ratio conteúdo/anúncio".

### 4. Enriquecer conteúdo editorial da Home
Ainda em `src/pages/Index.tsx`, adicionar uma nova seção textual antes do Footer chamada **"Sobre as Loterias da Caixa"** com 3–4 parágrafos originais (200–300 palavras) cobrindo:
- O que são as loterias Caixa, como funcionam os sorteios e a destinação social.
- Como o Lottos analisa os resultados (frequência, atrasados, padrões) — sem prometer ganhos.
- Aviso responsável sobre +18 e jogo consciente.

Esse bloco resolve a crítica de "baixo valor" porque adiciona conteúdo único, indexável e relevante ao tema do site.

### 5. Garantir conteúdo mínimo no `History.tsx`
- Adicionar um parágrafo introdutório (1–2 frases) explicando o que é a página histórica antes da primeira renderização da tabela, para que mesmo o estado vazio tenha contexto editorial junto do anúncio.

### 6. Boas práticas adicionais (sem código novo)
- Verificar em **AdSense → Sites** se `lottos.lovable.app` e `grupolottoxp.com` estão ambos aprovados; um domínio reprovado contamina o status.
- Após publicar as mudanças, no painel do AdSense clicar em **"Solicitar revisão"** na violação. A revisão leva alguns dias.
- Manter `ads.txt` (já presente em `public/ads.txt`).

## Arquivos afetados

- `src/pages/NotFound.tsx` — remover AdBanner
- `src/pages/PrivacyPolicy.tsx` — remover AdBanner
- `src/pages/TermsOfUse.tsx` — remover AdBanner
- `src/components/AgeGate.tsx` — ampliar whitelist de bots
- `src/pages/Index.tsx` — remover 1 AdBanner + adicionar seção "Sobre as Loterias"
- `src/pages/History.tsx` — adicionar parágrafo introdutório

Sem alterações em backend, dependências ou componentes compartilhados.

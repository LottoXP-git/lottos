## Objetivo

Adicionar um destaque para o concurso especial **Mega-Sena 30 Anos** (sorteio em **24/05/2026, domingo, 11h**, prêmio estimado de **R$ 150 milhões**), seguindo o mesmo padrão visual da Dupla de Páscoa: banner clicável na home + modal com contagem regressiva e detalhes.

## O que será criado/alterado

### 1. Novo utilitário `src/utils/megaSena30Date.ts`
- Exporta `MEGA_SENA_30_DATE = new Date("2026-05-24T11:00:00-03:00")`.
- Função `isMegaSena3030AnosActive()`: retorna `true` de **30 dias antes do sorteio até 1 dia depois** (mesma janela que a Dupla de Páscoa, para manter consistência).

### 2. Novo componente `src/components/MegaSena30Modal.tsx`
- Estrutura espelhada em `SpecialDrawModal.tsx`, mas com identidade da Mega-Sena (verde `lottery-megasena`).
- Hero banner com gradiente verde/dourado, ícone `Trophy` + `Sparkles`.
- Badge "30 ANOS" em destaque, título "Mega-Sena 30 Anos", subtítulo "Mega-Sena • Concurso Especial".
- Prêmio estimado: **R$ 150.000.000,00**.
- Contagem regressiva (dias/horas/min/seg) usando o mesmo `CountdownUnit` (componente local, não exportado, então será replicado).
- Bloco de data: "Sorteio: Domingo, 24 de Maio de 2026 às 11h".
- Highlights:
  - "Prêmio histórico de R$ 150 milhões"
  - "Comemoração dos 30 anos da Mega-Sena"
  - "Não acumula — vai para a faixa da Quina se ninguém acertar"
  - "Aposta mínima a partir de R$ 5,00"
- CTA: "Gerar Palpites para a Mega-Sena 30 Anos" — chama callback que pré-seleciona `megasena` no `QuickBetGenerator` e faz scroll, igual ao fluxo atual.

### 3. Alterações em `src/pages/Index.tsx`
- Importar `MegaSena30Modal` e `isMegaSena3030AnosActive`.
- Novo estado `megaSena30Open`.
- Novo banner clicável (logo abaixo do banner da Dupla de Páscoa, ou substituindo-o quando a Páscoa não estiver ativa) com:
  - Gradiente verde/esmeralda + dourado.
  - Badge "30 ANOS" pulsante.
  - Título "Mega-Sena 30 Anos", subtítulo "Sorteio especial • 24/05/2026".
  - Prêmio "R$ 150 Milhões" no canto direito.
- Onclick abre o modal.
- Onclick do CTA do modal: fecha modal, faz `setQuickBetPreselect("megasena")` e scroll para `#quick-bet-generator`.

### Layout do banner (texto)

```text
┌──────────────────────────────────────────────────────────┐
│ [🏆]  CONCURSO ESPECIAL · 30 ANOS                        │
│       Mega-Sena 30 Anos              Prêmio estimado     │
│       Sorteio especial · 24/05/2026  R$ 150 Milhões      │
└──────────────────────────────────────────────────────────┘
```

### 4. Memória
- Atualizar `mem://features/seasonal-events` (ou criar `mem://features/mega-sena-30-anos`) registrando: data 24/05/2026 11h, prêmio 150M, janela de exibição 30 dias antes até 1 dia depois.
- Atualizar `mem://index.md` se criar arquivo novo.

## Detalhes técnicos

- **Sem mudanças no backend** — é um destaque estático baseado em data fixa. Quando a API da Caixa retornar o concurso real, o card normal da Mega-Sena na grade continuará funcionando normalmente em paralelo.
- **Janela de visibilidade**: 30 dias antes (24/04/2026) até 25/05/2026. Hoje (29/04/2026) o banner já apareceria — perfeito para validação imediata.
- **Reuso**: o `CountdownUnit` de `SpecialDrawModal.tsx` é local; será replicado dentro de `MegaSena30Modal.tsx` para evitar refatoração desnecessária. Caso prefira, posso extrair para `src/components/CountdownUnit.tsx` compartilhado — sinalize na revisão.
- **Coexistência com Dupla de Páscoa**: ambos os banners podem aparecer simultaneamente (Páscoa 2026 = 05/04, então a janela termina em 06/04 e não conflita com a Mega-Sena 30 Anos a partir de 24/04). Sem ajustes condicionais necessários.
- **Mobile-first**: banner usa grid responsivo (`flex-col sm:flex-row`), prêmio destacado em `text-lg sm:text-xl`.

## Resultado esperado

- Banner verde/dourado "Mega-Sena 30 Anos" visível na home a partir de 24/04/2026.
- Modal completo com countdown ao vivo, descrição, highlights e CTA que leva ao gerador de palpites pré-selecionado em Mega-Sena.
- Nenhuma quebra nas funcionalidades existentes (Dupla de Páscoa, grid de resultados, gerador, etc.).
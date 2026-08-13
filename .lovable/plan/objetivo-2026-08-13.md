## Objetivo
Aplicar a identidade visual de cada loteria no card "Preço das Apostas", mudando a cor do card de acordo com a modalidade selecionada no `<Select>`.

## Diagnóstico do estado atual
- `src/components/BetPricesCard.tsx` usa o tema genérico do app: `border-primary/20`, `bg-primary/10`, `text-primary`.
- O projeto já possui um sistema de cores por loteria:
  - Variáveis CSS em `src/index.css` (`--lottery-megasena`, `--lottery-lotofacil`, etc.).
  - Tokens Tailwind em `tailwind.config.ts` (`colors.lottery.*`).
  - Mapas manuais em `src/components/LotteryCard.tsx` (`colorMap`, `bgColorMap`, `badgeColorMap`).
- O `ModalityKey` em `src/lib/betPrices.ts` não inclui `federal` nem `maismilionaria`, mas inclui `milionaria`.

## Estratégia
1. Criar um mapa de cores por modalidade dentro de `src/components/BetPricesCard.tsx`, reaproveitando as cores oficiais já usadas em `LotteryCard.tsx`.
2. Aplicar as cores dinamicamente em:
   - Borda do `<Card>`.
   - Fundo e ícone do cabeçalho.
   - Texto dos valores (preços) da tabela.
   - Focus/ring do `<SelectTrigger>`.
3. Manter o contraste legível tanto no tema escuro quanto no claro.
4. Não alterar a estrutura de dados de `src/lib/betPrices.ts` nem a lógica de renderização das tabelas.

## Escopo
- Apenas `src/components/BetPricesCard.tsx`.
- Sem mudanças em outras páginas ou hooks.

## Detalhes técnicos
- Criar `modalityColorMap: Record<ModalityKey, { border: string; bg: string; iconBg: string; text: string; ring: string }>`.
- Usar `cn()` do `src/lib/utils` para compor as classes com base no estado `modality`.
- Garantir que `timemania`, `lotomania`, `milionaria` e `loteca` tenham cores definidas, já que não aparecem no `LotteryCard.tsx` com os mesmos nomes.
- Validação: type check (`tsgo`) e screenshot do preview mostrando o card em pelo menos duas modalidades diferentes.

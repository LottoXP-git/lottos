## Objetivo
Mostrar a **arrecadação total** de cada concurso no modal de detalhes (LotteryDetailModal), usando o campo `valorArrecadado` retornado pela API da Caixa.

## Alterações

1. **`src/data/lotteryData.ts`**
   - Adicionar campo opcional `totalCollected?: number` em `LotteryResult`.

2. **`supabase/functions/fetch-lottery-results/index.ts`**
   - Ler `raw.valorArrecadado` (e variações: `valor_arrecadado`) e incluir no payload normalizado (`totalCollected`).

3. **`src/hooks/useLotteryResults.ts`**
   - Em `fetchLotteryFromCaixa` e `fetchLotecaFromBrowser`, propagar `data.valorArrecadado` para `totalCollected`.

4. **`src/components/LotteryDetailModal.tsx`**
   - Quando `totalCollected > 0`, exibir uma linha "Arrecadação total: R$ X,XX" formatada em BRL, no bloco de informações do concurso (próximo a data/ganhadores), seguindo o estilo já existente do modal. Ocultar se ausente (ex.: mocks antigos ou Loteca sem dado).

## Observações
- Apenas leitura/exibição; sem mudanças no banco.
- Loteca normalmente não traz `valorArrecadado` — o campo simplesmente não aparece quando ausente.
- Nenhuma alteração de layout além da nova linha de texto.

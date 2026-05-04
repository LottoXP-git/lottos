## Objetivo

Criar um novo card na Home exibindo a tabela oficial de preços das apostas (referência: Caixa, 07/07/2025) para todas as 11 modalidades, usando os dados extraídos do PDF anexado.

## O que será criado

**1. Novo componente `src/components/BetPricesCard.tsx`**
- Card com header "Preço das Apostas" + selo "Valores oficiais Caixa"
- Selector (tabs ou select dropdown — melhor para mobile 390px) para escolher a modalidade entre as 11:
  - Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária, Loteca, (Federal não tem tabela de preço variável → exibir card simples informativo, ou omitir)
- Para cada modalidade, renderizar tabela responsiva com colunas correspondentes:
  - **Mega-Sena / Quina / Lotofácil / Dupla Sena / Dia de Sorte / Super Sete**: Quant. de números × Valor R$
  - **Timemania / Lotomania**: aposta única (card simples)
  - **+Milionária**: Números × Trevos × Apostas × Valor
  - **Loteca**: Duplos × Triplos × Nº apostas × Valor
- Cor do header de cada tabela alinhada à identidade da modalidade (já existe no projeto)
- Tabelas longas (Loteca, +Milionária) com `max-h-[400px] overflow-y-auto`
- Mobile: `text-xs`, padding reduzido; Desktop: `text-sm`
- Disclaimer no rodapé: "Valores de referência. Consulte loterias.caixa.gov.br para preços atualizados."

**2. Nova lib `src/lib/betPrices.ts`**
- Exporta um objeto `BET_PRICES` tipado com todos os dados extraídos do PDF (estrutura por modalidade)
- Mantém os dados separados da UI para facilitar atualização futura

**3. Integração em `src/pages/Index.tsx`**
- Importar `BetPricesCard` e renderizar como nova `<section>` logo após o `PrizeChecker` (faz sentido contextualmente: "conferir prêmio" → "saber quanto custa apostar")
- Envolver em `max-w-2xl mx-auto` para alinhar com largura dos outros cards centralizados

## Detalhes técnicos

- Usar componentes existentes: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` (shadcn já no projeto)
- Selector: `Select` do shadcn para mobile-first (mais econômico que tabs com 11 opções em 390px)
- Animação: `animate-fade-in` no card raiz
- Dados em `betPrices.ts` formatados em R$ pt-BR ("3,00", "1.260,00") como strings já prontas
- Sem alteração no backend, sem nova dependência

## Arquivos afetados

- **Criados**: `src/lib/betPrices.ts`, `src/components/BetPricesCard.tsx`
- **Editados**: `src/pages/Index.tsx`

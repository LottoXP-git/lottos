## Objetivo

Criar a rota `/relatorio-mensal` no app com uma página dedicada onde o usuário pode visualizar um resumo e baixar um PDF atualizado contendo as frequências das dezenas e os principais palpites gerados para cada modalidade numérica.

## O que será entregue

1. **Nova rota `/relatorio-mensal`** registrada no `src/App.tsx` (acima da rota catch-all).
2. **Página `src/pages/MonthlyReport.tsx`** com:
   - Header e Footer padrão do app (mesma identidade visual Caixa Clean / laranja-azul).
   - Card explicativo: o que o relatório contém, período coberto (últimos 30 dias) e modalidades incluídas.
   - Prévia em tela com cards por modalidade mostrando: top 5 quentes, top 5 frias e 1 palpite sugerido (estratégia balanceada) — usando `LotteryBall` para manter consistência visual.
   - Botão grande "Baixar PDF do mês" com loader enquanto gera.
   - Disclaimer legal reforçando "sem vínculo com a Caixa".
3. **Link no Header** (menu de navegação) apontando para `/relatorio-mensal`.
4. **Link de acesso direto pela Home** (botão secundário discreto, abaixo do Hero).

## Como o PDF será gerado

- **100% no cliente**, usando `jspdf` + `jspdf-autotable` (instalar como dependência). Sem Edge Function nova, sem custo de servidor.
- Os dados vêm dos hooks já existentes:
  - `useLotteryResults` para resultados atuais e cálculo de frequência (mesmo pipeline já usado em `StatisticsPanel`).
  - `generateSmartPicks` (de `src/data/lotteryData.ts`) para os palpites por modalidade nas estratégias `hot`, `cold` e `balanced`.
  - `analyzeBet` (de `src/lib/lotteryStats.ts`) para a justificativa estatística de cada palpite balanceado.
- Modalidades incluídas: as 10 numéricas (Mega-Sena, Lotofácil, Quina, Lotomania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária, Timemania, Federal). Loteca fica de fora por não ter dezenas.

## Estrutura do PDF

```text
Capa
  - Logo + título "Relatório Mensal de Loterias"
  - Mês/ano corrente (Abril/2026)
  - Disclaimer legal

Para cada modalidade (1 página):
  - Cabeçalho com nome e cor da modalidade
  - Último concurso e data
  - Tabela "Top 10 Dezenas Quentes" (nº, frequência, %)
  - Tabela "Top 10 Dezenas Frias" (nº, frequência, %)
  - Bloco "Palpite Sugerido (Balanceado)" com as dezenas + justificativa do analyzeBet
  - Palpites alternativos: 1 linha "Quentes" + 1 linha "Frias"

Rodapé em todas as páginas:
  - "Lottos · Sem vínculo oficial com a Caixa Econômica Federal"
  - Numeração de página
```

Nome do arquivo: `relatorio-loterias-{mes}-{ano}.pdf` (ex.: `relatorio-loterias-abril-2026.pdf`).

## Detalhes técnicos

- Adicionar dependência: `jspdf` e `jspdf-autotable`.
- Helper novo `src/lib/monthlyReportPdf.ts` que recebe `LotteryResult[]` + frequências e devolve um `Blob`/dispara o download. Mantém a página enxuta.
- Reutilizar paletas das modalidades (`mem://features/lottery-modalities`) para colorir cabeçalhos das seções no PDF.
- Estado de loading no botão (`isGenerating`) + toast de sucesso/erro via `sonner`.
- Sem mudanças no schema do banco, sem Edge Function nova.

## Arquivos afetados

- `src/App.tsx` — registrar rota.
- `src/pages/MonthlyReport.tsx` — nova página.
- `src/lib/monthlyReportPdf.ts` — gerador do PDF.
- `src/components/Header.tsx` — link de navegação.
- `src/pages/Index.tsx` — botão de acesso (opcional, discreto).
- `package.json` — adicionar `jspdf` e `jspdf-autotable`.

## QA

- Testar download em desktop (1336px) e mobile (≤640px).
- Conferir no PDF gerado: sem texto cortado, sem páginas em branco, cores coerentes, disclaimer presente em todas as páginas.

## Objetivo

Unificar o gerador de palpites: quando a loteria selecionada for **Federal**, o `SmartPickGenerator` (aba "Palpites" do modal de detalhes) renderiza a lógica de bilhetes de 6 dígitos baseada no histórico — exatamente como o atual `FederalPickGenerator`. Para as demais loterias, mantém o comportamento por dezenas. O bloco solto da Federal na home é removido para evitar duplicação.

## Mudanças

### 1. `src/components/SmartPickGenerator.tsx` — branch Federal

Acrescentar, no topo do componente, a checagem `const isFederal = lottery.id === "federal";` e, quando verdadeira, renderizar uma sub-UI Federal com:

- 4 estratégias: `hot`, `cold`, `balanced`, `random` (mesmas do `FederalPickGenerator`).
- Carregamento on-demand do histórico (50 concursos via `loteriascaixa-api.herokuapp.com`) com `useEffect` + estados `history`, `loadingHistory`, `historyError`.
- Construção de frequência por posição (`buildFrequency`) e geração via `pickByStrategy`.
- Mantém regras de monetização atuais (2 grátis → VideoAdModal) — chamando `runGeneration` que produz N bilhetes (input numérico 1–10) em vez de uma lista de números.
- Render dos bilhetes em cards com `Ticket` + botão copiar, idênticos ao `FederalPickGenerator`.
- Card visual segue o mesmo `card-glass` do gerador inteligente, com o título "Gerador de Palpites Inteligente" + badge "Federal" para identificar.

Estrutura:

```text
SmartPickGenerator
├── header (mesmo)
├── if (isFederal) → FederalBranch (estratégias 2x2, qtd, gerar, lista bilhetes)
└── else          → fluxo atual (estratégias 3x1, gerar, LotteryBalls)
```

A monetização (`freeGenerations`, `showVideoAd`, `handleAdComplete`) e o título permanecem compartilhados. Internamente, `runGeneration` ramifica:

```ts
if (isFederal) {
  const n = Math.min(10, Math.max(1, parseInt(count) || 1));
  const seen = new Set<string>();
  const out: string[] = [];
  while (out.length < n && tries < n*30) { ... pickByStrategy(freq, strategy) ... }
  setFederalPicks(out);
} else {
  setPicks(generateSmartPicks(frequencyData, lottery.selectCount, strategy));
}
```

Tipos/estados extras adicionados ao componente:
- `federalPicks: string[]`
- `count: string` (default `"3"`)
- `history`, `loadingHistory`, `historyError`
- `Strategy` ampliado para incluir `"random"` quando Federal

Helpers (`buildFrequency`, `pickByStrategy`, `fetchFederalHistory`, `TICKET_LEN`, `HISTORY_SIZE`) são movidos do `FederalPickGenerator.tsx` para dentro deste arquivo (ou para um pequeno utilitário `src/lib/federalPicks.ts` para manter o componente legível). Optar pelo utilitário dedicado.

### 2. Novo `src/lib/federalPicks.ts`

Exporta:
- `TICKET_LEN`, `HISTORY_SIZE`
- `type DigitFreq`
- `buildFrequency(tickets: string[]): DigitFreq`
- `pickByStrategy(freq, strategy): string`
- `fetchFederalHistory(size: number): Promise<string[]>`

Conteúdo copiado das linhas 22-111 do `FederalPickGenerator.tsx` atual.

### 3. `src/pages/Index.tsx`

Remover a importação de `FederalPickGenerator` (linha 17) e a `<section>` que o renderiza (linhas 278-283). Assim a Federal passa a ser acessada pelo mesmo fluxo das outras loterias: clique no card Federal → modal → aba "Palpites".

### 4. `src/components/FederalPickGenerator.tsx`

Deletar — a lógica vive agora dentro do `SmartPickGenerator` + utilitário.

## Arquivos afetados

- `src/components/SmartPickGenerator.tsx` — adiciona branch Federal completo.
- `src/lib/federalPicks.ts` — novo utilitário com helpers extraídos.
- `src/pages/Index.tsx` — remove uso/import do `FederalPickGenerator`.
- `src/components/FederalPickGenerator.tsx` — removido.

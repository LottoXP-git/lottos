## Objetivo

Transformar o **Gerador de Palpites Inteligentes** da home em uma ferramenta de recomendação baseada em dados, exibindo **probabilidades** e **justificativas** para cada palpite gerado.

## O que será feito

### 1. Estratégias de geração (escolha do usuário)
Adicionar três botões de estratégia no `QuickBetGenerator`:
- **Quentes** — prioriza dezenas mais sorteadas
- **Frias** — prioriza dezenas menos sorteadas (teoria do "atraso")
- **Equilibrada** — mix 50/50 (recomendada)

A geração deixa de ser 100% aleatória e passa a sortear dentro do pool de dezenas filtrado pela estratégia, usando dados de frequência da modalidade.

### 2. Justificativas por dezena
Após gerar, cada bola exibirá um tooltip / legenda mostrando:
- Frequência absoluta (ex: "saiu 42x nos últimos 100 sorteios")
- Classificação (Quente / Morna / Fria)
- Cor sutil de borda indicando temperatura

### 3. Painel de probabilidades e análise
Abaixo das bolas geradas, um card "Análise do palpite" com:
- **Probabilidade matemática** de acerto da faixa principal (combinatória C(n,k), ex: Mega-Sena ≈ 1 em 50.063.860)
- **Distribuição** do palpite: X dezenas quentes, Y mornas, Z frias
- **Soma** das dezenas e faixa típica esperada (média histórica)
- **Pares vs ímpares** e **baixas vs altas** (split em torno do meio)
- **Justificativa textual curta** explicando porque o palpite é considerado equilibrado/agressivo (ex: "Palpite equilibrado: 3 quentes + 3 frias, soma dentro da faixa estatística mais comum")

### 4. Aviso de transparência
Pequena nota fixa explicando que loterias são jogos de azar e que estatísticas históricas **não alteram a probabilidade real** de cada sorteio — apenas oferecem critérios para escolher números. Essencial para conformidade e expectativa do usuário.

### 5. Compatibilidade
- Mantém o sistema atual de 2 gerações grátis + anúncio
- Mantém pré-seleção via `preselectedId` (Dupla de Páscoa)
- Federal e Loteca continuam fora (não se aplicam)
- +Milionária mantém trevos, Timemania mantém Time, Dia de Sorte mantém Mês — tudo aleatório (não há frequência relevante)

## Detalhes técnicos

**Arquivos a editar/criar:**
- `src/lib/lotteryStats.ts` (novo) — utilitários puros: `calculateOdds(maxNumber, selectCount)`, `classifyTemperature(frequency, allFrequencies)`, `analyzeBet(numbers, frequencyData)` retornando soma, pares/ímpares, baixas/altas, distribuição quente/fria, justificativa.
- `src/data/lotteryData.ts` — reaproveitar `generateFrequencyData` e `generateSmartPicks` já existentes; adicionar opção de retornar dezenas com metadata (frequência por dezena selecionada).
- `src/components/QuickBetGenerator.tsx` — adicionar selector de estratégia, integrar geração baseada em frequência, renderizar painel de análise.
- `src/components/BetAnalysisCard.tsx` (novo) — componente do painel de análise/probabilidade.
- `src/components/LotteryBall.tsx` — aceitar prop opcional `temperature?: 'hot' | 'warm' | 'cold'` para borda colorida discreta (sem quebrar uso atual).

**Cálculo de odds (combinatória):**
```ts
// C(n, k) = n! / (k! * (n-k)!)
function combinations(n: number, k: number): number { ... }
const odds = combinations(maxNumber, selectCount); // "1 em X"
```

**Classificação de temperatura:** ordenar frequências, top 33% = quentes, meio 34% = mornas, bottom 33% = frias.

**Justificativa textual:** gerada por regras simples baseadas em (a) estratégia escolhida, (b) distribuição quente/fria do palpite, (c) se soma cai na faixa central ±1 desvio.

**Sem backend:** toda análise é client-side usando os mesmos dados de frequência simulados que o `SmartPickGenerator` já usa (`generateFrequencyData`). Quando integração real com histórico da Caixa estiver pronta, basta trocar a fonte da frequência.

## Layout (mobile-first, 390px)

````text
┌─────────────────────────────────┐
│   🎲  Gerador de Palpites       │
│   Inteligentes                  │
├─────────────────────────────────┤
│   [Select: Mega-Sena      ▼]    │
│                                 │
│   [🔥 Quentes][❄️ Frias][⚖️ Eq.]│
│                                 │
│   [   Gerar Aposta (2)     ]    │
│                                 │
│   ⚪ ⚪ ⚪ ⚪ ⚪ ⚪              │
│   (cada bola com borda          │
│    quente/morna/fria)           │
│                                 │
│ ┌─ Análise do Palpite ────────┐ │
│ │ Chance: 1 em 50.063.860     │ │
│ │ 🔥 3 quentes ❄️ 3 frias    │ │
│ │ Soma: 178 (faixa típ.150-210)│ │
│ │ Pares 4 / Ímpares 2         │ │
│ │ "Palpite equilibrado..."    │ │
│ └─────────────────────────────┘ │
│                                 │
│   [Copiar Números]              │
│                                 │
│  ⚠️ Estatísticas não alteram   │
│  a probabilidade do sorteio.   │
└─────────────────────────────────┘
````

## Fora do escopo
- Treinar modelos de ML / IA generativa para palpites
- Buscar histórico real dos últimos 100 sorteios da Caixa (continua usando `generateFrequencyData` simulado já existente)
- Salvar palpites no backend / histórico do usuário

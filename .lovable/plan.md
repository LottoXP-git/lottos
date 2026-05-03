## Objetivo

Tornar o resultado da Loteria Federal no conferidor mais transparente: para cada faixa secundária (Milhar, Centena, Dezena, Aproximações, Dezenas Finais, Unidade) mostrar **qual prêmio principal gerou o acerto** e **como o cálculo foi feito**, além de incluir um link para a página oficial de Bilhetes Premiados da Caixa relativa ao concurso pesquisado.

## Mudanças

### 1. Enriquecer `derivedTiers` em `src/components/PrizeChecker.tsx`

Hoje cada faixa derivada guarda apenas `matchedWith: string[]` (lista de bilhetes). Vou estender o tipo para carregar o detalhe do cálculo:

```ts
type DerivedMatch = {
  bilhete: string;        // bilhete principal vinculado
  posicao: number;        // 1..5 (qual prêmio principal gerou)
  detail: string;         // explicação curta do cálculo
};
type DerivedTier = {
  key: string;
  label: string;
  description: string;    // regra geral (já existente)
  matches: DerivedMatch[]; // substitui matchedWith
};
```

Na lógica de derivação (linhas ~432-521), em vez de filtrar só os bilhetes, vou iterar com índice para preservar `posicao` e produzir um `detail` por faixa:

- **Milhar / Centena / Dezena**: `detail` mostra o sufixo comparado, ex.:
  `"5393 = últimos 4 dígitos do 2º Prêmio (065393)"`
- **Aproximações**: `detail = "Bilhete 065392 está 1 unidade antes do 1º Prêmio (065393)"` ou `"... 1 unidade depois ..."`.
- **Dezenas Finais**: `detail = "Dezena final 95 está 2 unidades à frente da dezena 93 do 1º Prêmio"` (mostra o `diff` com sinal).
- **Unidade do 1º Prêmio**: `detail = "Último dígito 3 igual ao do 1º Prêmio (065393)"`.

Também passo a comparar contra **todos os 5 prêmios** para Aproximações/Dezenas Finais/Unidade (hoje só compara com o 1º). A regra oficial da Caixa é só sobre o 1º prêmio, então mantenho restrito ao 1º (apenas reforço a marcação textual deixando claro "do 1º Prêmio"). Para Milhar/Centena/Dezena, continuamos varrendo os 5 prêmios e listamos cada vínculo separadamente (uma linha por match, com a posição do prêmio).

### 2. Atualizar a UI das faixas secundárias (linhas ~1035-1059)

Cada `DerivedTier` vira um cartão âmbar com:
- Badge da faixa (ex.: "Milhar")
- Descrição curta da regra (já existe)
- Lista de **vínculos**, cada item exibindo:
  - Badge `Nº Prêmio` (1º..5º) + bilhete em fonte mono
  - Linha de `detail` em texto pequeno explicando o cálculo

Layout:

```text
[Milhar]  Últimos 4 dígitos iguais a um dos prêmios principais
  • 2º Prêmio  065393   — sufixo "5393" igual ao do seu bilhete
  • 4º Prêmio  125393   — sufixo "5393" igual ao do seu bilhete
```

### 3. Link para a página oficial de Bilhetes Premiados

Abaixo do bloco de faixas secundárias (e também quando não houver, junto da nota informativa), incluir:

```tsx
<a
  href="https://loterias.caixa.gov.br/Paginas/Bilhetes-Premiados-Federal.aspx"
  target="_blank" rel="noopener noreferrer"
  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
>
  <ExternalLink className="w-3 h-3" />
  Ver bilhetes premiados do concurso {result.concurso} no site da Caixa
</a>
```

A página da Caixa não aceita parâmetro de concurso na URL, então o link é fixo, mas o texto cita o número do concurso pesquisado (`result.concurso`) para contexto.

Importar `ExternalLink` de `lucide-react` na linha 9.

### 4. Sem mudanças em backend/dados

Toda a lógica é local — derivada do payload já retornado pela API herokuapp. Nenhum schema ou edge function muda.

## Arquivos afetados

- `src/components/PrizeChecker.tsx` — tipo `derivedTiers`, derivação com detalhamento por prêmio, render dos cartões âmbar com lista de vínculos detalhados, link externo para Bilhetes Premiados da Caixa.

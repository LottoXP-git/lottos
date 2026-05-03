## Adicionar Loteria Federal ao Conferidor de Apostas

A Loteria Federal funciona de forma diferente das demais: o usuário compra um **bilhete de 5 dígitos** e o sorteio premia 5 posições (1º ao 5º prêmio). Não há "acertar números" — ou o bilhete bate com uma das 5 posições, ou não bate. Por isso o conferidor precisa de um fluxo dedicado.

### Mudanças em `src/components/PrizeChecker.tsx`

1. **Adicionar Federal ao select**
   - Incluir `{ id: "federal", name: "Federal", maxNumber: 99999, selectCount: 1 }` em `LOTTERIES`.

2. **Adaptar a UI quando `selectedLottery === "federal"`**
   - Trocar o label "Números apostados" por "Número do bilhete (5 dígitos)".
   - Validar entrada: 1 número inteiro de 1 a 99999, exibido com 5 dígitos (`padStart(5,"0")`).
   - Esconder o aviso "Aposta padrão: X números".
   - Esconder campos extras (trevos, time, mês — já são condicionais, ok).

3. **Novo branch no `handleCheck`**
   - Buscar `https://loteriascaixa-api.herokuapp.com/api/federal[/concurso]`.
   - O payload da Federal traz `premiacoes` com 5 entradas (faixa 1 a 5), cada uma com `bilhete` (string de 5 dígitos) e `valorPremio`.
   - Comparar o bilhete digitado com cada `bilhete` sorteado; se bater, registrar a posição (1º, 2º, 3º, 4º, 5º) e o valor.
   - Aplicar as `cotas` (dividir o prêmio).

4. **Novo bloco de exibição de resultado para Federal**
   - Renderizar uma tabela compacta dos 5 prêmios com: posição, bilhete sorteado, valor, e badge "✓ Você ganhou!" na linha que coincide com o bilhete digitado.
   - Se nenhum bater: mensagem amigável "Seu bilhete não foi premiado neste concurso".
   - Disparar confete + toast quando ganhar (reaproveita lógica existente).

5. **Tipagem**
   - Adicionar opcional `federal?: { betBilhete: string; tiers: { posicao: number; bilhete: string; valorPremio: number; matched: boolean }[]; totalWon: number }` em `CheckResult`.
   - Pular o loop normal de `draws` quando for Federal (não usa `dezenas`).

### Fora do escopo
- Não mudar lógica das outras loterias.
- Não tocar em `lotteryData.ts` (Federal já existe lá).
- Sem ajustes de RLS / backend (tudo client-side via API pública da Caixa).

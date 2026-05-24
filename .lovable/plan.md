## Objetivo

Adicionar botões "Anterior" e "Próximo" no `LotteryDetailModal` para navegar entre concursos da mesma loteria, sem fechar o modal.

## Mudanças

### 1. `src/components/LotteryDetailModal.tsx`
- Importar `ChevronLeft`, `ChevronRight` (lucide) e `useLotteryDraw` de `@/hooks/useLotteryResults`.
- Adicionar estado interno `concursoOffset` (number, default `0`) que representa o deslocamento em relação ao concurso atual da prop `lottery`.
- Resetar `concursoOffset` para `0` toda vez que `lottery?.id` ou `lottery?.concurso` mudar (via `useEffect`), e quando o modal fechar.
- Calcular `targetConcurso = lottery.concurso + concursoOffset`.
- Usar `useLotteryDraw(lottery.id, targetConcurso)` apenas quando `concursoOffset !== 0` (`enabled`), reaproveitando o cache do React Query.
- `displayedLottery`: se `offset === 0` → usa `lottery` (prop); senão usa o resultado do hook, mantendo `color`, `maxNumber`, `selectCount` da loteria original como fallback caso a API não devolva.
- Substituir as referências a `lottery.*` dentro do conteúdo do modal por `displayedLottery.*`. As keys de `useMemo`, `captureRef` e `ShareResultImageButton` passam a usar `displayedLottery`.
- Renderizar dois botões compactos na linha do `DialogTitle` (à esquerda da contagem e à direita do nome):
  - Esquerda: `ChevronLeft` → decrementa offset (`-1`). Desabilitado se `targetConcurso <= 1`.
  - Direita: `ChevronRight` → incrementa offset (`+1`). Desabilitado quando já estamos no concurso "mais recente conhecido" (offset >= 0 e a request retornou 404/erro na próxima) — usar o estado `isError` do hook para próximo concurso para travar o avanço.
  - Ambos com `aria-label`, `variant="ghost"`, `size="icon"`, `h-7 w-7 sm:h-9 sm:w-9`, e `disabled` durante `isLoading` ou nos limites.
- Mostrar um skeleton/overlay leve (opacidade reduzida + spinner pequeno) sobre a área de conteúdo enquanto `isLoading && offset !== 0`, mantendo o header navegável.
- Em erro de fetch (`isError`), exibir mensagem inline curta e manter o concurso anterior visível; reverter `concursoOffset` para o último válido seria opcional — preferimos apenas bloquear o botão correspondente.

### 2. Sem mudanças em backend
A função edge `fetch-lottery-results` já aceita `?lottery=&concurso=`, e `useLotteryDraw` já está implementado e cacheado (24h staleTime). Nenhuma migração ou edge function nova é necessária.

### 3. Restrições preservadas
- Não altera lógica de negócios além da navegação visual.
- Loteca: `useLotteryDraw` chama a edge function que pode falhar para Loteca (Caixa bloqueia IPs server). Aceitamos esse comportamento (botões habilitados, mas pode exibir erro inline). Sem mudanças no `fetchLotecaFromBrowser` para manter escopo enxuto.

## Detalhes técnicos

- Tipo do estado: `const [offset, setOffset] = useState(0)`.
- `targetConcurso = (lottery?.concurso ?? 0) + offset`.
- Hook condicional: `const { data: fetched, isLoading, isError } = useLotteryDraw(lottery?.id ?? "", targetConcurso)` — o `enabled` interno já cuida de não disparar se concurso inválido; adicionar guarda extra `offset !== 0`.
- `displayedLottery = offset === 0 ? lottery : (fetched ? { ...lottery, ...fetched } : lottery)` para preservar campos visuais (`color`).
- Botões posicionados dentro do `DialogHeader`, em uma nova linha flex `justify-between` acima do título atual, OU integrados no próprio título com `flex items-center justify-between gap-2`. Preferimos a segunda forma para manter altura compacta.

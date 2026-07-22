## Objetivo
Reduzir a latência entre o sorteio oficial da Caixa e a exibição do novo resultado no app, sem gerar carga desnecessária fora das janelas de sorteio.

## Diagnóstico do estado atual
- `useLotteryResults` usa `staleTime: 5min` e `refetchInterval` de 30min (5min só aos domingos após 11h).
- Todas as 11 loterias são buscadas em um único query key — se uma demora, todas ficam presas ao mesmo ciclo.
- Não há cache-busting nas chamadas do navegador → CDN da Caixa pode devolver payload antigo.
- Não há push: mesmo com resultado disponível, o app só descobre no próximo tick.
- Sem detecção de "voltou da background" no mobile (Capacitor App resume).

## Estratégia (4 frentes combinadas)

### 1. Polling adaptativo por janela de sorteio (ganho maior, custo baixo)
Cada loteria tem horário/dias conhecidos (ex.: Mega-Sena qua/sáb 20h, Lotofácil seg-sáb 20h, Federal qua/sáb 19h, Loteca dom 14h, etc.). Criar `src/lib/drawSchedule.ts` que, dado `now()` em America/Sao_Paulo, retorna o `refetchInterval` ideal:
- Fora de janela: 30 min.
- 15 min antes até 90 min depois do horário previsto de qualquer loteria com sorteio no dia: **20 segundos**.
- Domingo ≥11h (Loteca/Timemania migradas): mantém 20s até haver update.
- Parar o polling agressivo assim que o `concurso` da loteria alvo incrementar (comparar com o anterior).

### 2. Query por loteria + prioridade
Separar `useLotteryResults` em queries independentes por modalidade (hook fábrica). Assim a Mega-Sena pode fazer polling de 20s sem arrastar as outras 10. O `Index` continua consumindo via um agregador leve.

### 3. Cache-busting + refetch em eventos
- Adicionar `?_=${Date.now()}` e headers `cache: 'no-store'` nas chamadas à Caixa (browser fetch) para furar CDN.
- Escutar `Capacitor App` `resume` e `visibilitychange` para disparar `queryClient.invalidateQueries(['lottery-results'])` imediatamente quando o usuário volta ao app.
- Já temos `refetchOnWindowFocus` — reforçar com `refetchOnReconnect: true`.

### 4. (Opcional / segunda fase) Push via Realtime
Se as três acima não bastarem, adicionar uma tabela `public.lottery_latest(id text pk, concurso int, payload jsonb, updated_at)` alimentada por cron (`pg_cron` chamando `fetch-lottery-results` a cada 1 min nas janelas). Frontend assina `postgres_changes` e recebe o novo concurso em <2s, zero polling. Deixo isso separado porque envolve migration + cron; confirmo com você antes de fazer.

## Escopo desta plano (fase 1 — implementar agora)
1. `src/lib/drawSchedule.ts` — tabela de horários por loteria + função `getRefetchIntervalMs(now)`.
2. `src/hooks/useLotteryResults.ts`:
   - Usar `getRefetchIntervalMs` no `refetchInterval` dinâmico.
   - Ligar `refetchOnReconnect`.
   - Cache-bust nas URLs da Caixa (`fetchLotteryFromCaixa`, `fetchLotecaFromBrowser`).
3. Novo `src/hooks/useAppResumeRefetch.ts` montado em `App.tsx` — invalida a query em `App.addListener('resume')` (Capacitor) e em `visibilitychange` (web).
4. Sem mudanças de UI.

Fase 2 (Realtime + cron) fica proposta separada — te pergunto antes de aplicar.

## Detalhes técnicos
- Tudo client-side + hook; sem migration nesta fase.
- Horários base (America/Sao_Paulo): Mega qua/sáb 20:00 · Lotofácil seg–sáb 20:00 · Quina seg–sáb 20:00 · Lotomania ter/qui/sáb 20:00 · Dupla Sena ter/qui/sáb 20:00 · Timemania ter/qui/sáb 20:00 · Dia de Sorte ter/qui/sáb 20:00 · Super Sete seg/qua/sex 15:00 · +Milionária sáb 20:00 · Federal qua/sáb 19:00 · Loteca dom 14:00. Ajusto se você quiser outros valores.
- Janela agressiva: `T-15min` até `T+90min` OU até `concurso` incrementar (o que vier primeiro).
- Guardar último `concurso` visto em ref para decidir sair da janela cedo.
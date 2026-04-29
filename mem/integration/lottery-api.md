---
name: Lottery API Integration
description: Edge function pulls from official Caixa API + heroku fallback; frontend always re-fetches Caixa from browser to override stale data
type: feature
---
## Architecture
- **Edge function `fetch-lottery-results`**: tries official Caixa (`servicebus2.caixa.gov.br/portaldeloterias/api/{lot}`) first → falls back to `loteriascaixa-api.herokuapp.com`. Caixa often returns 403 to data-center IPs, so heroku is the realistic primary in production (1-day stale).
- **Frontend `useLotteryResults`**: in parallel calls edge function + `fetchLotteryFromCaixa(cfg)` for ALL 10 numeric lotteries directly from the user's browser + `fetchLotecaFromBrowser`. Browser results override edge results when `concurso >= existing.concurso`. This guarantees freshness because Caixa allows browser origin requests.
- React Query: `staleTime` 5min, `refetchInterval` 10min.

## Why this matters
The herokuapp proxy lags ~1 day behind official draws. Without browser-side fetch, users would see yesterday's results until the proxy syncs.

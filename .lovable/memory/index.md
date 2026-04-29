# Project Memory

## Core
- App Purpose: Lottos - Caixa Lotteries results/predictions. Target +18 only. Age Gate blocks render.
- Legal Constraint: Footer MUST prominently state "Este App não possui vínculo oficial com a Caixa Econômica Federal."
- Design Constraint: NEVER re-add 'Evolução dos Prêmios' chart to details modal. It was removed for simplicity.
- Tech Stack: Supabase Edge Functions, React Query (5m cache). Loteca bypasses 403 via `fetchLotecaFromBrowser`.
- Styling: Laranja/Azul identity. Tailwind `animate-fade-in` for initial loads, `framer-motion` for interactions.
- UI/UX: "Caixa Clean" light mode, glassmorphism, mobile-first (text 8-10px, hide tooltips on mobile).
- iOS Compliance: AdSense hidden on native iOS (isNativeIOS in src/lib/platform.ts). Bundle com.lottos.app. NEVER add server.url to capacitor.config.ts.

## Memories
- [Lottery Formatting](mem://features/lottery-results-formatting)
- [Lottery Modalities](mem://features/lottery-modalities)
- [Statistics Analysis](mem://features/statistics-analysis)
- [Prediction Generator](mem://features/prediction-generator)
- [Random Bet Generator](mem://features/random-bet-generator)
- [Bet Checker](mem://features/bet-checker)
- [Results Summary Export](mem://features/results-summary-export)
- [Component Standards](mem://design/component-standards)
- [Modal Layout](mem://style/lottery-modal-layout)
- [History & Filtering](mem://features/history-and-filtering)
- [Lottery API Integration](mem://integration/lottery-api)
- [Prize Alerts](mem://features/prize-alerts)
- [High Prize Highlights](mem://features/high-prize-highlights)
- [Prize Ranking](mem://features/prize-ranking)
- [Special Draw Highlights](mem://features/special-draw-highlights)
- [Seasonal Events](mem://features/seasonal-events)
- [Special Rules Page](mem://features/special-rules-page)
- [Theme Switcher](mem://features/theme-switcher)
- [Mobile Optimization](mem://style/mobile-optimization)
- [Monetization Ads](mem://features/monetization-ads)
- [Google AdSense](mem://integration/google-adsense)
- [Premium Subscription](mem://features/premium-subscription)
- [Age Verification Gate](mem://features/age-verification-gate)
- [User Registration](mem://features/user-registration)
- [Marketing Consent](mem://features/marketing-consent)
- [Social Sharing](mem://features/social-sharing)
- [Application Footer](mem://features/application-footer)
- [Visual Identity](mem://style/visual-identity)
- [Native Config](mem://project/native-config) — Capacitor com.lottos.app, Android keystore, build offline
- [Native Compliance](mem://project/native-compliance) — IARC 18+, Play Store metadata
- [Native Config iOS](mem://project/native-config-ios) — Bundle com.lottos.app, build-ios.sh, AdSense oculto em iOS, checklist App Store

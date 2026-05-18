
## Objetivo

Manter os testadores do Closed Testing ativos durante os 14 dias exigidos pelo Google Play, disparando notificações locais agendadas em dias alternados (D+1, D+3, D+5, D+7, D+9, D+11, D+13) — sem depender de servidor de push.

## Estratégia

Usar **`@capacitor/local-notifications`** no app nativo (Android) e **Notifications API + setTimeout/visibilitychange** no web, com o mesmo hook orquestrando ambos. Plugin nativo permite agendar disparos futuros mesmo com o app fechado — essencial para o teste fechado.

Conteúdo das mensagens é rotativo e ligado a funcionalidades reais do app (resultados, palpite do dia, ranking, Mega 30 Anos), evitando padrão "spam" que o Google penaliza.

## Mudanças

### 1. Dependência nativa
- Instalar `@capacitor/local-notifications`
- Atualizar `android/app/src/main/AndroidManifest.xml` com permissões:
  - `POST_NOTIFICATIONS` (Android 13+)
  - `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`
  - `RECEIVE_BOOT_COMPLETED` (re-agendar após reboot — já incluído pelo plugin)

### 2. Novo módulo `src/lib/testerEngagement.ts`
Define o calendário de 7 notificações (dias 1,3,5,7,9,11,13) com:
- horário fixo (ex: 19h local)
- título + corpo + deep-link interno (`/`, `/historico`, `/estatisticas`, `/como-ganhar/megasena`)
- mensagens variadas: "Confira o resultado de hoje", "Gere seu palpite da sorte", "Veja os números mais sorteados", "Mega-Sena 30 Anos se aproxima!", etc.

### 3. Novo hook `src/hooks/useTesterNotifications.ts`
- Detecta plataforma via `isNative()` (já existe em `src/lib/platform.ts`)
- **Nativo (Android):** usa `LocalNotifications.schedule()` com 7 disparos futuros (`at: Date`) na primeira execução; persiste `lottos_tester_schedule_v1` em localStorage com a data-âncora para evitar re-agendar
- **Web:** fallback que aproveita o `useDailyReminder` existente (já implementado) mas amplia para todos os dias ímpares dos próximos 14 dias
- Método `cancelAll()` para desligar

### 4. CTA discreto no app
- Novo componente `src/components/TesterEngagementOptIn.tsx`: banner sutil acima do Footer em `/` perguntando "Ative os lembretes do teste (14 dias)" com botão único
- Pede permissão nativa via `LocalNotifications.requestPermissions()` e agenda
- Mostrado apenas se `!agendado && plataforma suporta`
- Esconde após opt-in/dismiss (localStorage)

### 5. Integração leve em `src/App.tsx`
- Chamar `useTesterNotifications()` no topo para revalidar/limpar agendamentos expirados na abertura
- Não dispara nada automaticamente — só responde ao opt-in do usuário

### 6. Documentação
- Atualizar `RELEASE.md` com instrução: após `npx cap sync`, conferir que o plugin foi listado em `android/app/src/main/assets/capacitor.plugins.json`

## Fora do escopo

- Push remoto (FCM) — exige backend e Service Worker; pode ser uma segunda fase
- iOS — projeto Android-only no momento (sem pasta `ios/`)
- Lembrete diário existente (`useDailyReminder`) — preservado, atende caso o usuário queira ping diário em vez de em dias alternados

## Resultado esperado

Testador instala → vê banner → ativa lembretes → recebe 7 notificações ao longo de 14 dias mesmo sem abrir o app, aumentando DAU e satisfazendo o requisito do Play Console.

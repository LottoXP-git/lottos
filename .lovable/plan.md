
# Tornar o Gerador de Palpites mais atrativo e viciante

Hoje o `QuickBetGenerator` (home) e o `SmartPickGenerator` (modal de detalhes) já funcionam bem, mas cada palpite é "descartável": o usuário gera, copia e sai. Para incentivar uso repetido, vamos adicionar **gamificação leve, recompensas visuais, personalização e memória entre sessões** — tudo client-side (localStorage), sem novos custos de backend.

## O que muda para o usuário

1. **Streak diário + XP de "Sortudo"**
   - Barra de XP no topo do gerador. Cada palpite gerado dá XP; ao completar a barra, sobe de "nível da sorte" (Iniciante → Apostador → Estrategista → Mestre da Sorte → Lenda).
   - Streak de dias consecutivos com pelo menos 1 palpite gerado (ícone de chama com contador). Quebrar o streak mostra um aviso amigável de "volte amanhã para manter sua sequência".
   - Ao subir de nível: confete dourado + toast comemorativo + desbloqueio de um "modo" novo (ver item 3).

2. **Histórico "Meus Palpites" (últimos 10)**
   - Bloco recolhível abaixo do botão de copiar, mostrando os últimos palpites gerados (com loteria, data/hora, números, estratégia).
   - Cada item tem ações rápidas: **Copiar**, **Compartilhar**, **Refazer estes números** (regenera com mesma estratégia), **Favoritar** (estrela).
   - Persistido em `localStorage` (`lottos_pick_history_v1`).

3. **Modos especiais da sorte (desbloqueáveis)**
   Substituem/complementam o seletor atual de estratégia (Quente/Fria/Equilibrado). Cada modo tem identidade visual e copy próprios:
   - **Numerologia** (data de nascimento como semente) — campo opcional de data que vira semente para o gerador.
   - **Signo** (12 opções) — cada signo enviesa para uma faixa de dezenas.
   - **Sonho** (escolhe um símbolo: peixe, dinheiro, casa, viagem...) — mapeia para um conjunto de dezenas tradicionais do "jogo do bicho-style", apenas como diversão.
   - **Espelhado / Sequência / Aniversário** — variações lúdicas.
   - Modos avançados começam bloqueados com cadeado e desbloqueiam por nível ou assistindo anúncio (reusa `VideoAdModal`).

4. **Reações e micro-recompensas a cada geração**
   - Variação visual da animação de bolas (já tem `framer-motion`): adicionar 4–5 estilos rotativos (cascata, explosão, espiral, flip 3D) para evitar repetição.
   - "Raridade" do palpite: cálculo simples baseado em quantos números quentes/frios saíram. Mostra badge: Comum / Raro / Épico / Lendário, com brilho proporcional.
   - Som curtinho opcional (toggle 🔔/🔕) ao revelar números — usa Web Audio API simples.
   - 1 em cada N gerações dispara um "**Palpite Dourado**" (bola dourada extra animada) com copy "Hoje a sorte está com você!".

5. **Compartilhamento que puxa para o app**
   - Botão "Compartilhar" gera uma imagem PNG do palpite (estilo cartelinha, reusa estética do `ShareCardImageButton`) com marca Lottos + link, incentivando viralidade.
   - Mensagem inclui o nível atual do usuário ("Gerado por Mestre da Sorte 🍀").

6. **CTA de retorno**
   - Após gerar, banner discreto: "Próximo sorteio da Mega-Sena em 1d 4h — gere mais palpites antes do encerramento" (reusa lógica de countdown já existente).
   - Notificação local opt-in: "Quer um palpite novo todo dia às 12h?" (toggle salvo em localStorage; dispara via `Notification API` quando o app está aberto, sem service worker novo).

7. **Refinamento do ciclo de anúncio**
   - Em vez de bloquear no 3º clique seco, mostrar progress: "2 de 2 palpites grátis usados — assista 10s para liberar +3" (sobe de 2 para 3 como pequena recompensa).
   - Combos: gerar 5 palpites seguidos sem sair libera 1 "geração premium" (modo especial sem ad).

## Arquitetura técnica

```text
src/
  hooks/
    usePickHistory.ts        # CRUD localStorage, últimos 10
    useLuckProgress.ts       # XP, nível, streak diário
    usePickSounds.ts         # Web Audio API + toggle persistido
  lib/
    luckModes.ts             # definição dos modos (numerologia, signo, sonho...)
    pickRarity.ts            # cálculo de raridade + thresholds
    pickGenerators.ts        # geradores por modo (extrai lógica de QuickBetGenerator)
  components/
    generator/
      LuckProgressBar.tsx    # XP + streak + nível
      LuckModeSelector.tsx   # substitui seletor atual de estratégia
      PickHistoryList.tsx    # lista colapsável dos últimos palpites
      PickRarityBadge.tsx    # badge Comum/Raro/Épico/Lendário
      GoldenPickEffect.tsx   # overlay quando dispara palpite dourado
      ShareablePickCard.tsx  # canvas PNG para compartilhar
```

`QuickBetGenerator.tsx` e `SmartPickGenerator.tsx` consomem esses hooks/componentes, mantendo toda a lógica de loterias específicas (trevos, time do coração, mês da sorte) intacta.

### Persistência (localStorage)
- `lottos_pick_history_v1`: array de `{ id, lotteryId, numbers, extras, strategy, mode, rarity, createdAt }`
- `lottos_luck_progress_v1`: `{ xp, level, streakDays, lastGenDate, unlockedModes[] }`
- `lottos_pick_sounds_enabled`: boolean
- `lottos_daily_reminder_enabled`: boolean

### Regras de XP/nível (proposta inicial, ajustável)
- +10 XP por palpite normal, +25 por modo especial, +50 por palpite "Lendário".
- Níveis a cada 100/300/700/1500/3000 XP.
- Streak: +1 por dia com geração; reseta após 36h sem gerar.

### Performance
- Animações em `framer-motion` já presentes; novos efeitos usam `transform/opacity` (GPU).
- Som lazy-loaded sob primeiro toggle on.
- História limitada a 10 itens para evitar inflar localStorage.

## Fora de escopo nesta etapa
- Sincronização de progresso entre dispositivos (exigiria conta logada).
- Ranking entre usuários (precisaria backend e moderação).
- Premiação real / cashback (compliance — manter o disclaimer existente).

## Resultado esperado
Um gerador que vira "ritual diário": o usuário volta para manter o streak, desbloquear modos novos, ver a raridade do palpite e compartilhar — tudo sem mudar a proposta legal do app (continua sem vínculo com a Caixa, +18, e os disclaimers permanecem).

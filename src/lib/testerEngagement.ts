/**
 * Calendário de notificações locais para reter testadores do
 * Closed Testing do Google Play Console (requisito: 14 dias com 20+ testadores).
 *
 * Disparos em dias alternados (D+1, D+3, ..., D+13) às 19h locais,
 * com mensagens conectadas a funcionalidades reais do app.
 */

export interface TesterNotification {
  /** Offset em dias a partir do opt-in. */
  dayOffset: number;
  title: string;
  body: string;
  /** Rota interna usada como deep-link via extra payload. */
  route: string;
}

export const TESTER_HOUR_LOCAL = 19; // 19h00 local
export const TESTER_SCHEDULE: TesterNotification[] = [
  {
    dayOffset: 1,
    title: "🎰 Confira o resultado de hoje",
    body: "Veja os números sorteados das principais loterias da Caixa.",
    route: "/",
  },
  {
    dayOffset: 3,
    title: "🍀 Gere seu palpite da sorte",
    body: "Use o gerador inteligente e crie seu jogo em segundos.",
    route: "/",
  },
  {
    dayOffset: 5,
    title: "📊 Números mais sorteados",
    body: "Descubra a frequência dos números e monte sua estratégia.",
    route: "/estatisticas",
  },
  {
    dayOffset: 7,
    title: "🏆 Ranking dos prêmios",
    body: "Quais loterias estão acumuladas hoje? Confira agora.",
    route: "/",
  },
  {
    dayOffset: 9,
    title: "📜 Histórico de sorteios",
    body: "Pesquise concursos antigos e padrões de resultados.",
    route: "/historico",
  },
  {
    dayOffset: 11,
    title: "🎯 Mega-Sena 30 Anos se aproxima",
    body: "Prêmio estimado de R$ 300 milhões. Não fique de fora!",
    route: "/",
  },
  {
    dayOffset: 13,
    title: "✨ Última chance da semana",
    body: "Gere um palpite final e confira os resultados do dia.",
    route: "/",
  },
];

export function buildScheduleDates(anchor: Date = new Date()): Date[] {
  return TESTER_SCHEDULE.map((n) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + n.dayOffset);
    d.setHours(TESTER_HOUR_LOCAL, 0, 0, 0);
    return d;
  });
}
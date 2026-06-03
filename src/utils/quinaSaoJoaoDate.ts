export const QUINA_SAO_JOAO_DATE = new Date("2026-06-28T11:00:00-03:00");

// Active from 30 days before the draw until 1 day after.
export function isQuinaSaoJoaoActive(): boolean {
  const now = new Date();
  const start = new Date(QUINA_SAO_JOAO_DATE);
  start.setDate(start.getDate() - 30);
  const end = new Date(QUINA_SAO_JOAO_DATE);
  end.setDate(end.getDate() + 1);
  return now >= start && now <= end;
}

export type QuinaSaoJoaoStatus = "upcoming" | "one-day" | "live" | "finished";

const LIVE_WINDOW_MS = 60 * 60 * 1000; // 1h

export function getQuinaSaoJoaoStatus(now: Date = new Date()): QuinaSaoJoaoStatus {
  const target = QUINA_SAO_JOAO_DATE.getTime();
  const diff = target - now.getTime();

  if (diff <= -LIVE_WINDOW_MS) return "finished";
  if (diff <= 0) return "live";
  if (diff <= 24 * 60 * 60 * 1000) return "one-day";
  return "upcoming";
}
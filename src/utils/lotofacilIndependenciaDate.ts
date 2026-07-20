export const LOTOFACIL_INDEPENDENCIA_DATE = new Date("2026-09-15T11:00:00-03:00");

// Active from 45 days before the draw until 1 day after.
export function isLotofacilIndependenciaActive(): boolean {
  const now = new Date();
  const start = new Date(LOTOFACIL_INDEPENDENCIA_DATE);
  start.setDate(start.getDate() - 45);
  const end = new Date(LOTOFACIL_INDEPENDENCIA_DATE);
  end.setDate(end.getDate() + 1);
  return now >= start && now <= end;
}

export type LotofacilIndependenciaStatus = "upcoming" | "one-day" | "live" | "finished";

const LIVE_WINDOW_MS = 60 * 60 * 1000; // 1h

export function getLotofacilIndependenciaStatus(now: Date = new Date()): LotofacilIndependenciaStatus {
  const target = LOTOFACIL_INDEPENDENCIA_DATE.getTime();
  const diff = target - now.getTime();

  if (diff <= -LIVE_WINDOW_MS) return "finished";
  if (diff <= 0) return "live";
  if (diff <= 24 * 60 * 60 * 1000) return "one-day";
  return "upcoming";
}
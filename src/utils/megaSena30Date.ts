export const MEGA_SENA_30_DATE = new Date("2026-05-24T11:00:00-03:00");

// Active from 30 days before the draw until 1 day after.
export function isMegaSena30AnosActive(): boolean {
  const now = new Date();
  const start = new Date(MEGA_SENA_30_DATE);
  start.setDate(start.getDate() - 30);
  const end = new Date(MEGA_SENA_30_DATE);
  end.setDate(end.getDate() + 1);
  return now >= start && now <= end;
}

export type MegaSena30Status = "upcoming" | "one-day" | "live" | "finished";

// Window in which we consider the draw "live" (sorteio dura ~30 min)
const LIVE_WINDOW_MS = 30 * 60 * 1000;

export function getMegaSena30Status(now: Date = new Date()): MegaSena30Status {
  const target = MEGA_SENA_30_DATE.getTime();
  const diff = target - now.getTime();

  if (diff <= -LIVE_WINDOW_MS) return "finished";
  if (diff <= 0) return "live";
  if (diff <= 24 * 60 * 60 * 1000) return "one-day";
  return "upcoming";
}
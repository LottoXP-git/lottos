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
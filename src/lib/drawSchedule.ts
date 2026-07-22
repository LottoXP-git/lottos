// Draw times per lottery (America/Sao_Paulo).
// Days: 0=Sun ... 6=Sat. Time is the official draw hour.
// Used to switch the polling interval to an aggressive value close to draws
// and back to a relaxed value the rest of the time.

type Schedule = { days: number[]; hour: number; minute: number };

const SCHEDULES: Record<string, Schedule> = {
  megasena: { days: [3, 6], hour: 20, minute: 0 }, // qua/sáb
  lotofacil: { days: [1, 2, 3, 4, 5, 6], hour: 20, minute: 0 }, // seg-sáb
  quina: { days: [1, 2, 3, 4, 5, 6], hour: 20, minute: 0 },
  lotomania: { days: [1, 3, 5], hour: 20, minute: 0 }, // seg/qua/sex
  duplasena: { days: [2, 4, 6], hour: 20, minute: 0 }, // ter/qui/sáb
  timemania: { days: [2, 4, 6], hour: 20, minute: 0 },
  diadesorte: { days: [2, 4, 6], hour: 20, minute: 0 },
  supersete: { days: [1, 3, 5], hour: 15, minute: 0 }, // seg/qua/sex
  maismilionaria: { days: [3, 6], hour: 20, minute: 0 }, // qua/sáb
  federal: { days: [3, 6], hour: 19, minute: 0 },
  loteca: { days: [0], hour: 14, minute: 0 }, // dom
};

const PRE_MIN = 15;
const POST_MIN = 90;

function nowInSaoPaulo(now: Date): { day: number; hour: number; minute: number; totalMin: number } {
  const sp = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return {
    day: sp.getDay(),
    hour: sp.getHours(),
    minute: sp.getMinutes(),
    totalMin: sp.getHours() * 60 + sp.getMinutes(),
  };
}

/** True if `now` is within a draw window for any lottery. */
export function isInAnyDrawWindow(now: Date = new Date()): boolean {
  const { day, totalMin } = nowInSaoPaulo(now);
  for (const key in SCHEDULES) {
    const s = SCHEDULES[key];
    if (!s.days.includes(day)) continue;
    const draw = s.hour * 60 + s.minute;
    if (totalMin >= draw - PRE_MIN && totalMin <= draw + POST_MIN) return true;
  }
  // Sunday from 11:00 onward: Loteca + weekend migrations may land any moment.
  if (day === 0 && totalMin >= 11 * 60) return true;
  return false;
}

/**
 * Interval (ms) for React Query polling.
 * - Inside a draw window: 20s (fast catch of the new concurso)
 * - Otherwise: 30min
 */
export function getRefetchIntervalMs(now: Date = new Date()): number {
  return isInAnyDrawWindow(now) ? 20 * 1000 : 30 * 60 * 1000;
}
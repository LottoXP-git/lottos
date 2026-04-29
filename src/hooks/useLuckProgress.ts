import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "lottos_luck_progress_v1";

export interface LuckLevel {
  index: number;
  name: string;
  emoji: string;
  /** Total XP required to *reach* this level */
  threshold: number;
}

export const LUCK_LEVELS: LuckLevel[] = [
  { index: 0, name: "Iniciante", emoji: "🍀", threshold: 0 },
  { index: 1, name: "Apostador", emoji: "🎯", threshold: 100 },
  { index: 2, name: "Estrategista", emoji: "🧠", threshold: 300 },
  { index: 3, name: "Mestre da Sorte", emoji: "🌟", threshold: 700 },
  { index: 4, name: "Lenda", emoji: "👑", threshold: 1500 },
];

interface LuckState {
  xp: number;
  streakDays: number;
  lastGenDate: string | null; // ISO date (yyyy-mm-dd)
  totalPicks: number;
}

const DEFAULT_STATE: LuckState = {
  xp: 0,
  streakDays: 0,
  lastGenDate: null,
  totalPicks: 0,
};

function loadState(): LuckState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: LuckState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86_400_000);
}

export function getLevelInfo(xp: number) {
  let current = LUCK_LEVELS[0];
  for (const lvl of LUCK_LEVELS) {
    if (xp >= lvl.threshold) current = lvl;
  }
  const next = LUCK_LEVELS[current.index + 1];
  const progress = next
    ? Math.min(100, ((xp - current.threshold) / (next.threshold - current.threshold)) * 100)
    : 100;
  return { current, next, progress };
}

export interface AddXpResult {
  xp: number;
  leveledUp: boolean;
  newLevel?: LuckLevel;
  streakDays: number;
  streakIncreased: boolean;
}

export function useLuckProgress() {
  const [state, setState] = useState<LuckState>(() => loadState());

  // Recompute streak on mount: if more than 1 day passed without a pick, reset.
  useEffect(() => {
    if (!state.lastGenDate) return;
    const today = todayISO();
    const diff = daysBetween(state.lastGenDate, today);
    if (diff > 1 && state.streakDays !== 0) {
      const next = { ...state, streakDays: 0 };
      setState(next);
      saveState(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addXp = useCallback(
    (amount: number): AddXpResult => {
      const today = todayISO();
      let streakDays = state.streakDays;
      let streakIncreased = false;

      if (!state.lastGenDate) {
        streakDays = 1;
        streakIncreased = true;
      } else {
        const diff = daysBetween(state.lastGenDate, today);
        if (diff === 0) {
          // same day, streak unchanged
        } else if (diff === 1) {
          streakDays += 1;
          streakIncreased = true;
        } else {
          streakDays = 1;
          streakIncreased = true;
        }
      }

      const prevLevel = getLevelInfo(state.xp).current;
      const newXp = state.xp + amount;
      const newLevel = getLevelInfo(newXp).current;
      const leveledUp = newLevel.index > prevLevel.index;

      const next: LuckState = {
        xp: newXp,
        streakDays,
        lastGenDate: today,
        totalPicks: state.totalPicks + 1,
      };
      setState(next);
      saveState(next);

      return {
        xp: newXp,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
        streakDays,
        streakIncreased,
      };
    },
    [state]
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    saveState(DEFAULT_STATE);
  }, []);

  const levelInfo = getLevelInfo(state.xp);

  return {
    xp: state.xp,
    streakDays: state.streakDays,
    totalPicks: state.totalPicks,
    level: levelInfo.current,
    nextLevel: levelInfo.next,
    progress: levelInfo.progress,
    addXp,
    reset,
  };
}
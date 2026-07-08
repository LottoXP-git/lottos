import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UpcomingMatch } from "@/components/LotecaUpcomingMatches";

export interface LotecaProgramming {
  concurso: number;
  periodoApostas: string;
  dataJogos: string;
  apuracao: string;
  jogos: UpcomingMatch[];
}

// Circuit breaker: after N consecutive failures, pause outgoing calls for a cool-down window.
const BREAKER_KEY = "loteca-programming:breaker";
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min

type BreakerState = { failures: number; openUntil: number };

function readBreaker(): BreakerState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(BREAKER_KEY) : null;
    if (!raw) return { failures: 0, openUntil: 0 };
    const parsed = JSON.parse(raw) as BreakerState;
    return { failures: parsed.failures ?? 0, openUntil: parsed.openUntil ?? 0 };
  } catch {
    return { failures: 0, openUntil: 0 };
  }
}

function writeBreaker(state: BreakerState) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(BREAKER_KEY, JSON.stringify(state));
    }
  } catch {
    /* ignore quota / privacy errors */
  }
}

function recordFailure() {
  const cur = readBreaker();
  const failures = cur.failures + 1;
  const openUntil = failures >= FAILURE_THRESHOLD ? Date.now() + COOLDOWN_MS : cur.openUntil;
  writeBreaker({ failures, openUntil });
}

function recordSuccess() {
  writeBreaker({ failures: 0, openUntil: 0 });
}

function isBreakerOpen(): boolean {
  return readBreaker().openUntil > Date.now();
}

export function useLotecaProgramming(fallback: LotecaProgramming) {
  return useQuery<LotecaProgramming>({
    queryKey: ["loteca-programming"],
    queryFn: async () => {
      if (isBreakerOpen()) return fallback;
      try {
        const { data, error } = await supabase.functions.invoke("fetch-loteca-programming");
        if (error || !data?.success || !data?.data) {
          recordFailure();
          return fallback;
        }
        recordSuccess();
        return data.data as LotecaProgramming;
      } catch {
        recordFailure();
        return fallback;
      }
    },
    placeholderData: fallback,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });
}
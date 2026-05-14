import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MEGA_SENA_30_DATE } from "@/utils/megaSena30Date";

const STORAGE_KEY = "lottos_megasena30_prize";
const DEFAULT_PRIZE = 200_000_000;
const POLL_INTERVAL = 1000 * 60 * 10; // 10 min

function targetDateStr(): string {
  // Caixa returns dataProximoConcurso as DD/MM/YYYY
  const d = MEGA_SENA_30_DATE;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function readStored(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeStored(value: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

function formatMillions(value: number): string {
  // "R$ 200" / "R$ 1,5" — integer if whole, else 1 decimal
  const millions = value / 1_000_000;
  if (Number.isInteger(millions)) return `R$ ${millions}`;
  return `R$ ${millions.toFixed(1).replace(".", ",")}`;
}

function formatFull(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function fetchEstimatedPrize(): Promise<number | null> {
  try {
    const res = await fetch("https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena");
    if (!res.ok) return null;
    const data = await res.json();
    const nextDate: string = data?.dataProximoConcurso || "";
    const estimated: number = Number(data?.valorEstimadoProximoConcurso || 0);
    // Only trust the value when the very next draw is the 30 Anos one.
    if (nextDate !== targetDateStr()) return null;
    if (!estimated || estimated <= 0) return null;
    return estimated;
  } catch {
    return null;
  }
}

/**
 * Tracks the official estimated prize for the Mega-Sena 30 Anos draw.
 * - Fetches Caixa's public API every 10 min while enabled.
 * - Persists last seen value in localStorage; falls back to DEFAULT_PRIZE.
 * - Shows a toast whenever the value changes.
 */
export function useMegaSena30Prize(enabled: boolean) {
  const [prize, setPrize] = useState<number>(() => readStored() ?? DEFAULT_PRIZE);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const tick = async () => {
      const fresh = await fetchEstimatedPrize();
      if (cancelled || fresh == null) return;
      const previous = readStored() ?? DEFAULT_PRIZE;
      if (fresh !== previous) {
        writeStored(fresh);
        setPrize(fresh);
        const direction = fresh > previous ? "subiu" : "foi atualizado";
        toast.success(`Prêmio da Mega-Sena 30 Anos ${direction}!`, {
          description: `Novo valor estimado: ${formatFull(fresh)} (antes ${formatFull(previous)}).`,
          duration: 10000,
        });
      } else {
        // keep state in sync even if no change
        setPrize(fresh);
      }
    };

    tick();
    const id = setInterval(tick, POLL_INTERVAL);
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);

  return {
    /** Raw value in BRL, e.g. 200000000 */
    prizeValue: prize,
    /** Compact display, e.g. "R$ 200" */
    prizeCompact: formatMillions(prize),
    /** Full display, e.g. "R$ 200.000.000,00" */
    prizeFull: formatFull(prize),
  };
}
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { LotteryResult } from "@/data/lotteryData";
import { isAccumulated } from "@/lib/accumulated";

const STORAGE_KEY = "lottos_accumulated_notified";

function loadNotified(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Dispara um alerta quando uma loteria passa a atender a condição de
 * "ACUMULOU" após a atualização dos resultados. Cada concurso notifica
 * uma única vez (persistido em localStorage).
 */
export function useAccumulatedAlerts(results: LotteryResult[] | undefined) {
  const notified = useRef<Record<string, number> | null>(null);

  useEffect(() => {
    if (!results || results.length === 0) return;
    if (notified.current === null) notified.current = loadNotified();

    let changed = false;
    for (const result of results) {
      if (!isAccumulated(result)) continue;
      const last = notified.current[result.id] ?? 0;
      if (result.concurso <= last) continue;

      notified.current[result.id] = result.concurso;
      changed = true;

      toast.warning(`💰 ${result.name} acumulou!`, {
        description: `Concurso ${result.concurso} sem ganhadores. Próximo prêmio: ${result.nextPrize}.`,
        duration: 9000,
      });
    }

    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notified.current));
      } catch {
        /* storage indisponível */
      }
    }
  }, [results]);
}

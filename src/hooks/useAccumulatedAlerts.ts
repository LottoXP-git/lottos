import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { LotteryResult } from "@/data/lotteryData";
import { isAccumulated } from "@/lib/accumulated";
import { isNative } from "@/lib/platform";

const STORAGE_KEY = "lottos_accumulated_notified";

function loadNotified(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Notificação local nativa (silenciosamente ignorada na web). */
async function notifyNative(title: string, body: string, id: number) {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }
    await LocalNotifications.schedule({
      notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 1000) } }],
    });
  } catch {
    /* plugin indisponível */
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

      void notifyNative(
        `💰 ${result.name} acumulou!`,
        `Concurso ${result.concurso} sem ganhadores. Próximo prêmio: ${result.nextPrize}.`,
        5000 + (result.concurso % 1000),
      );
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

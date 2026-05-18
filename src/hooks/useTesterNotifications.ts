import { useCallback, useEffect, useState } from "react";
import { isNative } from "@/lib/platform";
import { TESTER_SCHEDULE, buildScheduleDates } from "@/lib/testerEngagement";

const STORAGE_KEY = "lottos_tester_schedule_v1";

interface StoredSchedule {
  anchor: string; // ISO date of opt-in
  ids: number[];
  platform: "native" | "web";
}

function readStored(): StoredSchedule | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSchedule) : null;
  } catch {
    return null;
  }
}

function writeStored(value: StoredSchedule | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/**
 * Agenda 7 notificações locais em dias alternados pelos próximos 14 dias
 * para manter testadores do Closed Testing engajados.
 */
export function useTesterNotifications() {
  const [scheduled, setScheduled] = useState<boolean>(() => !!readStored());
  const [loading, setLoading] = useState(false);

  // Limpa schedule expirado (>14 dias).
  useEffect(() => {
    const stored = readStored();
    if (!stored) return;
    const ageDays =
      (Date.now() - new Date(stored.anchor).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > 15) {
      writeStored(null);
      setScheduled(false);
    }
  }, []);

  const schedule = useCallback(async (): Promise<
    { ok: true } | { ok: false; reason: string }
  > => {
    setLoading(true);
    try {
      const dates = buildScheduleDates(new Date());
      const ids = TESTER_SCHEDULE.map((_, i) => 1000 + i);

      if (isNative()) {
        const { LocalNotifications } = await import(
          "@capacitor/local-notifications"
        );
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") {
          return { ok: false, reason: "denied" };
        }
        // Limpa agendamentos antigos do mesmo grupo (best effort).
        try {
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({
              notifications: pending.notifications.map((n) => ({ id: n.id })),
            });
          }
        } catch {
          // ignore
        }
        await LocalNotifications.schedule({
          notifications: TESTER_SCHEDULE.map((n, i) => ({
            id: ids[i],
            title: n.title,
            body: n.body,
            schedule: { at: dates[i], allowWhileIdle: true },
            extra: { route: n.route },
          })),
        });
      } else {
        // Web fallback: Notifications API + setTimeout (somente enquanto a aba viver).
        if (typeof window === "undefined" || !("Notification" in window)) {
          return { ok: false, reason: "unsupported" };
        }
        let perm = Notification.permission;
        if (perm === "default") {
          perm = await Notification.requestPermission();
        }
        if (perm !== "granted") return { ok: false, reason: "denied" };
        TESTER_SCHEDULE.forEach((n, i) => {
          const delay = dates[i].getTime() - Date.now();
          if (delay <= 0) return;
          setTimeout(() => {
            try {
              new Notification(n.title, {
                body: n.body,
                icon: "/favicon.ico",
                tag: `lottos-tester-${i}`,
              });
            } catch {
              // ignore
            }
          }, Math.min(delay, 2 ** 31 - 1));
        });
      }

      writeStored({
        anchor: new Date().toISOString(),
        ids,
        platform: isNative() ? "native" : "web",
      });
      setScheduled(true);
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    const stored = readStored();
    if (stored && isNative()) {
      try {
        const { LocalNotifications } = await import(
          "@capacitor/local-notifications"
        );
        await LocalNotifications.cancel({
          notifications: stored.ids.map((id) => ({ id })),
        });
      } catch {
        // ignore
      }
    }
    writeStored(null);
    setScheduled(false);
  }, []);

  return { scheduled, loading, schedule, cancel };
}
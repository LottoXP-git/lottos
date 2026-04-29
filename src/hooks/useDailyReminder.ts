import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "lottos_daily_reminder_v1";
const LAST_NUDGE_KEY = "lottos_daily_reminder_last_v1";

type Permission = "default" | "granted" | "denied" | "unsupported";

interface State {
  enabled: boolean;
  permission: Permission;
}

function readPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as Permission;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyReminder() {
  const [state, setState] = useState<State>(() => {
    const enabled =
      typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
    return { enabled, permission: readPermission() };
  });

  // Soft daily nudge — fires once per day if enabled and permission granted.
  useEffect(() => {
    if (!state.enabled || state.permission !== "granted") return;
    const last = localStorage.getItem(LAST_NUDGE_KEY);
    const today = todayISO();
    if (last === today) return;

    const t = setTimeout(() => {
      try {
        new Notification("🍀 Hora de tentar a sorte!", {
          body: "Gere seu palpite do dia no Lottos e mantenha sua sequência viva.",
          icon: "/favicon.ico",
          tag: "lottos-daily",
        });
        localStorage.setItem(LAST_NUDGE_KEY, today);
      } catch {
        /* ignore */
      }
    }, 1500);

    return () => clearTimeout(t);
  }, [state.enabled, state.permission]);

  const enable = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { ok: false, reason: "unsupported" as const };
    }
    let perm = Notification.permission as Permission;
    if (perm === "default") {
      perm = (await Notification.requestPermission()) as Permission;
    }
    if (perm !== "granted") {
      setState((s) => ({ ...s, permission: perm }));
      return { ok: false, reason: perm };
    }
    localStorage.setItem(STORAGE_KEY, "1");
    setState({ enabled: true, permission: perm });
    return { ok: true as const };
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState((s) => ({ ...s, enabled: false }));
  }, []);

  return { ...state, enable, disable };
}
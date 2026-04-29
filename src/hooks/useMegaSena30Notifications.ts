import { useEffect } from "react";
import { toast } from "sonner";
import { MEGA_SENA_30_DATE, getMegaSena30Status } from "@/utils/megaSena30Date";

const STORAGE_KEY = "lottos_megasena30_notified";

type NotifiedFlags = {
  oneDay?: boolean;
  live?: boolean;
};

function readFlags(): NotifiedFlags {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeFlags(flags: NotifiedFlags) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // ignore
  }
}

function fireNative(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "megasena-30-anos",
    });
  } catch {
    // ignore
  }
}

async function ensurePermission() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      // ignore
    }
  }
}

/**
 * Polls every 30s to detect status transitions for the Mega-Sena 30 Anos draw.
 * Fires a toast + native notification (when permitted) once per milestone:
 *  - 1 day before the draw
 *  - At the moment the draw goes live
 * Persists in localStorage to avoid duplicates across reloads.
 */
export function useMegaSena30Notifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    // Best-effort permission request (silent if user already chose).
    ensurePermission();

    const check = () => {
      const flags = readFlags();
      const status = getMegaSena30Status();

      if (status === "one-day" && !flags.oneDay) {
        toast.info("Falta 1 dia para a Mega-Sena 30 Anos!", {
          description: "Domingo, 24/05/2026 às 11h. Prêmio estimado de R$ 150 milhões.",
          duration: 8000,
        });
        fireNative(
          "Mega-Sena 30 Anos — Falta 1 dia!",
          "Sorteio amanhã às 11h. Prêmio estimado: R$ 150 milhões.",
        );
        writeFlags({ ...flags, oneDay: true });
      }

      if ((status === "live" || status === "finished") && !flags.live) {
        toast.success("🎉 Sorteio da Mega-Sena 30 Anos acontecendo agora!", {
          description: "Acompanhe o resultado em instantes.",
          duration: 10000,
        });
        fireNative(
          "Mega-Sena 30 Anos — AO VIVO",
          "O sorteio dos 30 anos está acontecendo agora!",
        );
        writeFlags({ ...flags, live: true, oneDay: true });
      }
    };

    // Run immediately and then every 30s.
    check();
    const interval = setInterval(check, 30_000);
    // Also re-check when the tab regains focus (covers long sleep periods).
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);
}

export { MEGA_SENA_30_DATE };
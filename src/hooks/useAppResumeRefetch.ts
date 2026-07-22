import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Invalidates lottery queries whenever the app returns to the foreground:
 * - Web: `visibilitychange` -> visible
 * - Native (Capacitor): `App.resume`
 *
 * This complements the polling interval so users see fresh results
 * immediately when reopening the app instead of waiting for the next tick.
 */
export function useAppResumeRefetch() {
  const qc = useQueryClient();

  useEffect(() => {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["lottery-results"] });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let removeNative: (() => void) | null = null;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handle = await App.addListener("resume", invalidate);
        removeNative = () => {
          handle.remove();
        };
      } catch {
        // @capacitor/app not available (pure web) — ignore.
      }
    })();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      removeNative?.();
    };
  }, [qc]);
}
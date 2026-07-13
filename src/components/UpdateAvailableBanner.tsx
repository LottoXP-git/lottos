import { useCallback, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Download, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppUpdateAvailable } from "@/hooks/useAppUpdateAvailable";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.lottos.app";

/**
 * Banner de atualização opcional. Aparece quando existe uma versão mais
 * recente publicada (`latest_version_name` no backend) e o usuário ainda
 * não dispensou o alerta para essa versão específica.
 */
export function UpdateAvailableBanner() {
  const { updateAvailable, latestVersion } = useAppUpdateAvailable();
  const dismissKey = latestVersion
    ? `lottos_update_dismissed_${latestVersion}`
    : null;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (!dismissKey || typeof window === "undefined") return false;
    return localStorage.getItem(dismissKey) === "1";
  });

  const handleUpdate = useCallback(async () => {
    try {
      await Browser.open({ url: PLAY_STORE_URL });
    } catch {
      window.open(PLAY_STORE_URL, "_blank");
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissKey) {
      try {
        localStorage.setItem(dismissKey, "1");
      } catch {
        // ignore
      }
    }
    setDismissed(true);
  }, [dismissKey]);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="sticky top-0 z-40 w-full border-b border-primary/30 bg-primary/10 text-foreground backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-1.5">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-[11px] sm:text-xs font-medium">
          Nova versão{" "}
          {latestVersion && (
            <span className="font-semibold">{latestVersion}</span>
          )}{" "}
          disponível na Play Store.
        </p>
        <Button
          size="sm"
          onClick={handleUpdate}
          className="h-7 shrink-0 gap-1 px-2 text-[11px]"
        >
          <Download className="h-3.5 w-3.5" />
          Atualizar
        </Button>
        <button
          aria-label="Dispensar aviso de atualização"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 hover:bg-primary/20"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
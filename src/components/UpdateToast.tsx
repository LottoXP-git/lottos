import { useEffect, useRef } from "react";
import { Browser } from "@capacitor/browser";
import { toast } from "sonner";
import { useAppUpdateAvailable } from "@/hooks/useAppUpdateAvailable";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.lottos.app";

async function openStore() {
  try {
    await Browser.open({ url: PLAY_STORE_URL });
  } catch {
    window.open(PLAY_STORE_URL, "_blank");
  }
}

/**
 * Mostra um toast único na abertura do app quando há uma versão mais
 * recente publicada na Play Store, com botão de atualizar.
 */
export function UpdateToast() {
  const { updateAvailable, latestVersion } = useAppUpdateAvailable();
  const shownRef = useRef(false);

  useEffect(() => {
    if (!updateAvailable || shownRef.current) return;
    shownRef.current = true;

    const timer = window.setTimeout(() => {
      toast("Nova versão disponível", {
        description: latestVersion
          ? `A versão ${latestVersion} do Lottos já está na Play Store.`
          : "Uma nova versão do Lottos já está na Play Store.",
        duration: 12000,
        action: {
          label: "Atualizar",
          onClick: () => {
            void openStore();
          },
        },
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [updateAvailable, latestVersion]);

  return null;
}
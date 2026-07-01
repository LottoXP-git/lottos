import { useCallback } from "react";
import { Browser } from "@capacitor/browser";
import { AlertTriangle, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.lottos.app";

interface ForceUpdateScreenProps {
  onRetry: () => void;
}

export function ForceUpdateScreen({ onRetry }: ForceUpdateScreenProps) {
  const handleUpdate = useCallback(async () => {
    try {
      await Browser.open({ url: PLAY_STORE_URL });
    } catch {
      window.open(PLAY_STORE_URL, "_blank");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Atualização necessária
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Uma nova versão do Lottos está disponível com melhorias e correções.
            Atualize agora para continuar usando o app.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleUpdate}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Store className="h-4 w-4" />
            Atualizar na Play Store
          </Button>

          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          Após atualizar, abra o app novamente.
        </p>
      </div>
    </div>
  );
}

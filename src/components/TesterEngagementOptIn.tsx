import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTesterNotifications } from "@/hooks/useTesterNotifications";

const DISMISS_KEY = "lottos_tester_optin_dismissed_v1";

/**
 * Banner sutil convidando o usuário a ativar 7 lembretes ao longo de 14 dias.
 * Foco: manter DAU durante o Closed Testing do Google Play.
 */
export function TesterEngagementOptIn() {
  const { scheduled, loading, schedule } = useTesterNotifications();
  const [dismissed, setDismissed] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (scheduled || dismissed) return null;

  const handleEnable = async () => {
    const res = await schedule();
    if (res.ok === true) {
      toast.success("🔔 Lembretes ativados!", {
        description: "Você receberá dicas e novidades nos próximos 14 dias.",
      });
      return;
    }
    if (res.reason === "denied") {
      toast.error("Permissão de notificação negada");
    } else {
      toast.error("Notificações não suportadas neste dispositivo");
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <aside aria-label="Lembretes do Lottos" className="mx-auto my-4 max-w-3xl px-3">
      <div className="relative flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm">
        <Bell className="h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Ative os lembretes do Lottos
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            7 avisos nos próximos 14 dias: resultados, palpites e Mega-Sena 30 Anos.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleEnable}
          disabled={loading}
          className="h-8 shrink-0"
        >
          {loading ? "..." : "Ativar"}
        </Button>
        <button
          aria-label="Dispensar"
          onClick={handleDismiss}
          className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
  );
}

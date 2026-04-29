import { useEffect, useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyReminder } from "@/hooks/useDailyReminder";
import { toast } from "sonner";

interface NextDrawCTAProps {
  /** dd/mm/yyyy */
  nextDate?: string;
  lotteryName: string;
}

function parseBR(date?: string): Date | null {
  if (!date) return null;
  const m = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  // Default 20:00 local time as draw time
  return new Date(parseInt(y, 10), parseInt(mo, 10) - 1, parseInt(d, 10), 20, 0, 0);
}

function formatDelta(ms: number) {
  if (ms <= 0) return "agora";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function NextDrawCTA({ nextDate, lotteryName }: NextDrawCTAProps) {
  const target = parseBR(nextDate);
  const [now, setNow] = useState(() => Date.now());
  const reminder = useDailyReminder();

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [target?.getTime()]);

  const handleToggle = async () => {
    if (reminder.enabled) {
      reminder.disable();
      toast("Lembretes diários desativados");
      return;
    }
    const res = await reminder.enable();
    if (res.ok) {
      toast.success("🔔 Lembrete diário ativado!", {
        description: "Vamos te avisar para gerar o palpite do dia.",
      });
    } else if (res.reason === "denied") {
      toast.error("Permissão negada nas configurações do navegador");
    } else if (res.reason === "unsupported") {
      toast.error("Seu navegador não suporta notificações");
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background/50 border border-border/60">
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground leading-tight">
            Próximo sorteio {lotteryName}
          </div>
          <div className="text-sm font-bold text-foreground leading-tight truncate">
            {target ? `em ${formatDelta(target.getTime() - now)}` : "em breve"}
            {nextDate && (
              <span className="text-[11px] font-normal text-muted-foreground ml-1">
                ({nextDate})
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant={reminder.enabled ? "secondary" : "outline"}
        onClick={handleToggle}
        className="h-8 px-2 shrink-0"
        title={reminder.enabled ? "Desativar lembrete" : "Ativar lembrete diário"}
      >
        {reminder.enabled ? (
          <BellOff className="w-3.5 h-3.5" />
        ) : (
          <Bell className="w-3.5 h-3.5" />
        )}
        <span className="ml-1 text-[11px]">
          {reminder.enabled ? "Ativado" : "Lembrar-me"}
        </span>
      </Button>
    </div>
  );
}
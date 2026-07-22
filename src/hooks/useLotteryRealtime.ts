import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOTTERY_NAMES: Record<string, string> = {
  megasena: "Mega-Sena",
  lotofacil: "Lotofácil",
  quina: "Quina",
  lotomania: "Lotomania",
  duplasena: "Dupla Sena",
  diadesorte: "Dia de Sorte",
  supersete: "Super Sete",
  maismilionaria: "+Milionária",
  timemania: "Timemania",
  federal: "Federal",
  loteca: "Loteca",
};

/**
 * Subscribes to Postgres changes on `public.lottery_latest`. Whenever the
 * cron sync detects a new concurso and upserts it, every connected client
 * receives the event within ~2s and we invalidate the lottery-results
 * query so `useLotteryResults` refetches the fresh Caixa payloads.
 *
 * Mount once at the app root. RLS on `lottery_latest` allows anon SELECT,
 * so no auth is required for the subscription.
 */
export function useLotteryRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    // Avoid firing a toast for the very first snapshot the channel may
    // deliver on subscribe (React StrictMode / reconnects). We only want
    // to notify on genuinely new draws that arrive while the app is open.
    const seen = new Map<string, number>();
    let primed = false;
    const primeTimer = setTimeout(() => {
      primed = true;
    }, 4000);

    const channel = supabase
      .channel("lottery-latest-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lottery_latest" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { id?: string; concurso?: number } | null;
          console.log(
            `[realtime] lottery_latest ${payload.eventType} → ${row?.id ?? "?"}#${row?.concurso ?? "?"}`,
          );
          qc.invalidateQueries({ queryKey: ["lottery-results"] });

          const id = row?.id;
          const concurso = row?.concurso;
          if (!id || !concurso) return;
          const prev = seen.get(id) ?? 0;
          seen.set(id, concurso);
          if (!primed) return;
          if (concurso <= prev) return;

          const name = LOTTERY_NAMES[id] ?? id;
          toast.success(`🎰 Novo resultado: ${name}`, {
            description: `Concurso ${concurso} acabou de ser publicado.`,
            duration: 8000,
          });
        },
      )
      .subscribe();

    return () => {
      clearTimeout(primeTimer);
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
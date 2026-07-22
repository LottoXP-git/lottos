import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
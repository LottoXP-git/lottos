import { LotteryResult } from "@/data/lotteryData";
import { LotteryBall } from "./LotteryBall";
import { Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DrawHistoryProps {
  lottery: LotteryResult;
  variant?: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena";
}

async function fetchRecentDraws(lotteryId: string): Promise<LotteryResult[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/fetch-lottery-results?lottery=${lotteryId}&mode=history&count=5`,
    {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }

  const data = await response.json();
  return data?.results || [];
}

export function DrawHistory({ lottery, variant }: DrawHistoryProps) {
  const { data: draws, isLoading, error } = useQuery({
    queryKey: ["draw-history", lottery.id],
    queryFn: () => fetchRecentDraws(lottery.id),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !draws || draws.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-8">
        Não foi possível carregar o histórico.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {draws.map((draw) => (
        <div
          key={draw.concurso}
          className="p-4 rounded-xl bg-secondary/30 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Concurso {draw.concurso}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {draw.date}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {draw.numbers.map((num, idx) => (
              <LotteryBall
                key={`${draw.concurso}-${idx}`}
                number={num}
                size="sm"
                variant={variant}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Prêmio: {draw.prize}</span>
            <span>
              {draw.winners > 0
                ? `${draw.winners} ganhador${draw.winners > 1 ? "es" : ""}`
                : "Acumulou"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

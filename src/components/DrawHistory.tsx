import { LotteryResult } from "@/data/lotteryData";
import { LotteryBall } from "./LotteryBall";
import { Calendar, Loader2, Clover, Heart, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DrawHistoryProps {
  lottery: LotteryResult;
  variant?: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
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
    <div className="space-y-2 sm:space-y-3">
      {draws.map((draw) => (
        <div
          key={draw.concurso}
          className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              #{draw.concurso}
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {draw.date}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
            {lottery.id === "duplasena" ? (
              <>
                <div className="w-full text-[10px] text-muted-foreground font-medium">1º Sorteio</div>
                {draw.numbers.slice(0, 6).map((num, idx) => (
                  <LotteryBall key={`${draw.concurso}-s1-${idx}`} number={num} size="xs" variant={variant} />
                ))}
                <div className="w-full text-[10px] text-muted-foreground font-medium mt-0.5">2º Sorteio</div>
                {draw.numbers.slice(6).map((num, idx) => (
                  <LotteryBall key={`${draw.concurso}-s2-${idx}`} number={num} size="xs" variant={variant} />
                ))}
              </>
            ) : (
              draw.numbers.map((num, idx) => (
                <LotteryBall key={`${draw.concurso}-${idx}`} number={num} size="xs" variant={variant} />
              ))
            )}
            {lottery.id === "maismilionaria" && draw.trevos && draw.trevos.length > 0 && (
              <>
                <Clover className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 ml-0.5" />
                {draw.trevos.map((t, idx) => (
                  <div key={`${draw.concurso}-t-${idx}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-emerald-400">
                    {t}
                  </div>
                ))}
              </>
            )}
          </div>
          {lottery.id === "timemania" && draw.timeCoracao && (
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400 fill-green-400" />
              <span className="text-[10px] font-semibold text-green-400">{draw.timeCoracao}</span>
            </div>
          )}
          {lottery.id === "diadesorte" && draw.mesSorte && (
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400">{draw.mesSorte}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span className="truncate mr-2">{draw.prize}</span>
            <span className="whitespace-nowrap">
              {draw.winners > 0
                ? `${draw.winners} ganh.`
                : "Acumulou"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

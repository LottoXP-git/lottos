import { Trophy, TrendingUp } from "lucide-react";
import { LotteryResult } from "@/data/lotteryData";

interface PrizeRankingProps {
  lotteries: LotteryResult[];
}

const parsePrize = (prize: string): number => {
  return parseFloat(prize.replace(/[R$\s.]/g, "").replace(",", "."));
};

const formatPrize = (value: number): string => {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  return `R$ ${(value / 1_000).toFixed(0)}mil`;
};

const medalColors = [
"from-yellow-400 to-amber-500",
"from-gray-300 to-gray-400",
"from-orange-400 to-orange-600"];


export function PrizeRanking({ lotteries }: PrizeRankingProps) {
  const sorted = [...lotteries].
  map((l) => ({ ...l, prizeValue: parsePrize(l.nextPrize) })).
  sort((a, b) => b.prizeValue - a.prizeValue);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-accent">Ranking de </span>
        <span className="text-gradient">Prêmios</span>
      </h3>

      <div className="space-y-3">
        {sorted.map((lottery, idx) =>
        <div
          key={lottery.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">

            <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
            idx < 3 ?
            `bg-gradient-to-br ${medalColors[idx]}` :
            "bg-muted-foreground/30"}`
            }>

              {idx + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {lottery.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Concurso {lottery.concurso}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gradient">
                {formatPrize(lottery.prizeValue)}
              </p>
              {lottery.winners === 0 &&
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Acumulou
                </span>
            }
            </div>
          </div>
        )}
      </div>
    </div>);

}
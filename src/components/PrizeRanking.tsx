import { Trophy, TrendingUp, Shield, Info } from "lucide-react";
import { LotteryResult } from "@/data/lotteryData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  "from-orange-400 to-orange-600",
];

// Probabilidades reais de acertar o prêmio principal
const difficultyMap: Record<string, { odds: string; level: "easy" | "medium" | "hard" | "extreme"; explain: string }> = {
  megasena:        { odds: "1 em 50.063.860", level: "extreme", explain: "Acertar 6 números de 60. Combinação C(60,6)." },
  lotofacil:       { odds: "1 em 3.268.760", level: "easy", explain: "Acertar 15 números de 25. Combinação C(25,15)." },
  quina:           { odds: "1 em 24.040.016", level: "hard", explain: "Acertar 5 números de 80. Combinação C(80,5)." },
  lotomania:       { odds: "1 em 11.372.635", level: "medium", explain: "Acertar 15 números de 50 (sorteiam 20). Combinação C(50,20)." },
  timemania:       { odds: "1 em 26.472.637", level: "hard", explain: "Acertar 7 números de 80 + Time do Coração. Combinação C(80,7) × 80 times." },
  diadesorte:      { odds: "1 em 2.629.575", level: "easy", explain: "Acertar 7 números de 31 + Mês da Sorte. Combinação C(31,7) × 12 meses." },
  supersete:       { odds: "1 em 10.000.000", level: "medium", explain: "Acertar 7 colunas com dígitos de 0-9. Probabilidade 10⁷." },
  maismilionaria:  { odds: "1 em 238.360.500", level: "extreme", explain: "Acertar 6 números de 50 + 2 trevos de 6. C(50,6) × C(6,2)." },
  federal:         { odds: "1 em 100.000", level: "easy", explain: "Bilhete com 5 dígitos. 100.000 combinações possíveis." },
  duplasena:       { odds: "1 em 15.890.700", level: "hard", explain: "Acertar 6 números de 50 em cada sorteio. Combinação C(50,6)." },
  loteca:          { odds: "1 em 4.782.969", level: "medium", explain: "Acertar o resultado de 14 jogos de futebol (vitória/empate/derrota). 3¹⁴ combinações." },
};

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  easy:    { label: "Fácil",       color: "text-emerald-400", bg: "bg-emerald-500/15" },
  medium:  { label: "Moderado",    color: "text-amber-400",   bg: "bg-amber-500/15" },
  hard:    { label: "Difícil",     color: "text-orange-400",  bg: "bg-orange-500/15" },
  extreme: { label: "Extremo",     color: "text-destructive", bg: "bg-destructive/15" },
};

export function PrizeRanking({ lotteries }: PrizeRankingProps) {
  const sorted = [...lotteries]
    .map((l) => ({ ...l, prizeValue: parsePrize(l.nextPrize) }))
    .sort((a, b) => b.prizeValue - a.prizeValue);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="text-accent">Ranking de </span>
        <span className="text-gradient">Prêmios</span>
      </h3>

      <div className="grid gap-2">
        {sorted.map((lottery, idx) => {
          const diff = difficultyMap[lottery.id];
          const lvl = diff ? levelConfig[diff.level] : null;

          return (
            <div
              key={lottery.id}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
            >
              {/* Position */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  idx < 3
                    ? `bg-gradient-to-br ${medalColors[idx]}`
                    : "bg-muted-foreground/30"
                }`}
              >
                {idx + 1}
              </div>

              {/* Name + Difficulty */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {lottery.name}
                </p>
                {diff && lvl && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${lvl.bg} ${lvl.color}`}>
                          <Shield className="w-2.5 h-2.5" />
                          {lvl.label}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" side="top">
                        <div className="space-y-1.5">
                          <p className={`text-xs font-bold ${lvl.color}`}>
                            {lvl.label} — {diff.odds}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {diff.explain}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 pt-1 border-t border-border">
                            <Info className="w-3 h-3" />
                            Probabilidade para aposta mínima
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {diff.odds}
                    </span>
                  </div>
                )}
              </div>

              {/* Prize */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gradient leading-tight">
                  {formatPrize(lottery.prizeValue)}
                </p>
                {lottery.winners === 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    Acumulou
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

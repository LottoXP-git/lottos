import { Card } from "@/components/ui/card";
import { BetAnalysis } from "@/lib/lotteryStats";
import { Flame, Snowflake, Scale, TrendingUp, Sigma, Target, Info } from "lucide-react";

interface BetAnalysisCardProps {
  analysis: BetAnalysis;
  lotteryName: string;
}

export function BetAnalysisCard({ analysis, lotteryName }: BetAnalysisCardProps) {
  return (
    <Card className="p-3 sm:p-4 bg-secondary/30 border-primary/20 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          Análise do palpite
        </h3>
      </div>

      {/* Odds */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background/60 border border-border/60">
        <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Probabilidade de acerto ({lotteryName})
          </div>
          <div className="text-base sm:text-lg font-bold text-primary font-mono">
            {analysis.oddsLabel}
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 flex flex-col items-center">
          <Flame className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
          <span className="text-base font-bold text-orange-400">{analysis.hotCount}</span>
          <span className="text-[10px] text-muted-foreground">quentes</span>
        </div>
        <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex flex-col items-center">
          <Scale className="w-3.5 h-3.5 text-yellow-400 mb-0.5" />
          <span className="text-base font-bold text-yellow-400">{analysis.warmCount}</span>
          <span className="text-[10px] text-muted-foreground">mornas</span>
        </div>
        <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 flex flex-col items-center">
          <Snowflake className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
          <span className="text-base font-bold text-sky-400">{analysis.coldCount}</span>
          <span className="text-[10px] text-muted-foreground">frias</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="p-2 rounded-lg bg-background/60 border border-border/60">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Sigma className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Soma</span>
          </div>
          <div className="font-bold text-foreground">
            {analysis.sum}{" "}
            <span className={`text-[10px] font-normal ${analysis.sumInRange ? "text-emerald-400" : "text-amber-400"}`}>
              ({analysis.sumInRange ? "típica" : "atípica"})
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            faixa {analysis.expectedSumMin}–{analysis.expectedSumMax}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-background/60 border border-border/60">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Pares / Ímpares
          </div>
          <div className="font-bold text-foreground">
            {analysis.evenCount} / {analysis.oddCount}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Baixas/Altas {analysis.lowCount}/{analysis.highCount}
          </div>
        </div>
      </div>

      {/* Justification */}
      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-foreground leading-relaxed">
          {analysis.justification}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground italic">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        <span>
          Loterias são jogos de azar. Estatísticas históricas não alteram a probabilidade real
          do próximo sorteio — servem apenas como critério para escolher dezenas.
        </span>
      </div>
    </Card>
  );
}

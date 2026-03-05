import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { NumberFrequency, getMostFrequent, getLeastFrequent } from "@/data/lotteryData";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface StatisticsPanelProps {
  frequencyData: NumberFrequency[];
  variant: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
  showCount?: number;
}

export function StatisticsPanel({ frequencyData, variant, showCount = 6 }: StatisticsPanelProps) {
  const hotNumbers = getMostFrequent(frequencyData, showCount);
  const coldNumbers = getLeastFrequent(frequencyData, showCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <Card className="card-glass border-emerald-500/20">
        <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-emerald-400">Dezenas Quentes</span>
          </CardTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Mais sorteadas nos últimos 100 concursos</p>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {hotNumbers.map((num, idx) => (
              <div key={num} className="flex flex-col items-center gap-0.5 sm:gap-1">
                <span className="text-[8px] sm:text-[10px] font-bold text-emerald-400">#{idx + 1}</span>
                <LotteryBall number={num} size="sm" variant={variant} delay={idx * 80} />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                  {frequencyData.find(d => d.number === num)?.frequency}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass border-blue-500/20">
        <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="text-blue-400">Dezenas Frias</span>
          </CardTitle>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Menos sorteadas nos últimos 100 concursos</p>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
            {coldNumbers.map((num, idx) => (
              <div key={num} className="flex flex-col items-center gap-0.5 sm:gap-1">
                <span className="text-[8px] sm:text-[10px] font-bold text-blue-400">#{idx + 1}</span>
                <LotteryBall number={num} size="sm" variant={variant} delay={idx * 80} />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                  {frequencyData.find(d => d.number === num)?.frequency}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

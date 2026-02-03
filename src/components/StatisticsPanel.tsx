import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { NumberFrequency, getMostFrequent, getLeastFrequent } from "@/data/lotteryData";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface StatisticsPanelProps {
  frequencyData: NumberFrequency[];
  variant: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena";
  showCount?: number;
}

export function StatisticsPanel({ frequencyData, variant, showCount = 6 }: StatisticsPanelProps) {
  const hotNumbers = getMostFrequent(frequencyData, showCount);
  const coldNumbers = getLeastFrequent(frequencyData, showCount);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="card-glass border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400">Dezenas Quentes</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">Mais sorteadas nos últimos 100 concursos</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {hotNumbers.map((num, idx) => (
              <div key={num} className="flex flex-col items-center gap-1">
                <LotteryBall number={num} size="md" variant={variant} delay={idx * 80} />
                <span className="text-xs text-muted-foreground font-mono">
                  {frequencyData.find(d => d.number === num)?.frequency}x
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400">Dezenas Frias</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">Menos sorteadas nos últimos 100 concursos</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {coldNumbers.map((num, idx) => (
              <div key={num} className="flex flex-col items-center gap-1">
                <LotteryBall number={num} size="md" variant={variant} delay={idx * 80} />
                <span className="text-xs text-muted-foreground font-mono">
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

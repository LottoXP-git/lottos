import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult } from "@/data/lotteryData";
import { Calendar, Trophy, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LotteryCardProps {
  result: LotteryResult;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  "lottery-megasena": "border-emerald-500/30 hover:border-emerald-500/60",
  "lottery-lotofacil": "border-purple-500/30 hover:border-purple-500/60",
  "lottery-quina": "border-blue-500/30 hover:border-blue-500/60",
  "lottery-lotomania": "border-orange-500/30 hover:border-orange-500/60",
  "lottery-duplasena": "border-rose-500/30 hover:border-rose-500/60",
};

const badgeColorMap: Record<string, string> = {
  "lottery-megasena": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "lottery-lotofacil": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "lottery-quina": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "lottery-lotomania": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "lottery-duplasena": "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const variantMap: Record<string, "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena"> = {
  "lottery-megasena": "megasena",
  "lottery-lotofacil": "lotofacil",
  "lottery-quina": "quina",
  "lottery-lotomania": "lotomania",
  "lottery-duplasena": "duplasena",
};

export function LotteryCard({ result, onClick }: LotteryCardProps) {
  return (
    <Card
      className={cn(
        "card-glass border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 glow-effect",
        colorMap[result.color]
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            {result.name}
          </CardTitle>
          <Badge variant="outline" className={cn("font-mono", badgeColorMap[result.color])}>
            Concurso {result.concurso}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{result.date}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {result.numbers.map((num, idx) => (
            <LotteryBall
              key={num}
              number={num}
              size={result.numbers.length > 10 ? "sm" : "md"}
              variant={variantMap[result.color]}
              delay={idx * 80}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Prêmio:</span>
          </div>
          <span className="text-sm font-semibold text-primary text-right">{result.prize}</span>

          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Ganhadores:</span>
          </div>
          <span className="text-sm font-semibold text-right">
            {result.winners === 0 ? "Acumulou!" : result.winners}
          </span>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-muted-foreground">Próximo:</span>
          </div>
          <span className="text-sm font-semibold text-emerald-400 text-right">{result.nextPrize}</span>
        </div>
      </CardContent>
    </Card>
  );
}

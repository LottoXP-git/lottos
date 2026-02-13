import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult } from "@/data/lotteryData";
import { Calendar, Trophy, Users, TrendingUp, Flame, Sparkles, Clover, Heart, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareButton } from "./ShareButton";
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
  "lottery-diadesorte": "border-amber-500/30 hover:border-amber-500/60",
  "lottery-supersete": "border-lime-500/30 hover:border-lime-500/60",
  "lottery-maismilionaria": "border-indigo-500/30 hover:border-indigo-500/60",
  "lottery-timemania": "border-lime-500/30 hover:border-lime-500/60",
  "lottery-federal": "border-sky-500/30 hover:border-sky-500/60",
  "lottery-loteca": "border-red-500/30 hover:border-red-500/60"
};
const badgeColorMap: Record<string, string> = {
  "lottery-megasena": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "lottery-lotofacil": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "lottery-quina": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "lottery-lotomania": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "lottery-duplasena": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "lottery-diadesorte": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "lottery-supersete": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "lottery-maismilionaria": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "lottery-timemania": "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "lottery-federal": "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "lottery-loteca": "bg-red-500/20 text-red-400 border-red-500/30"
};
type LotteryVariant = "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
const variantMap: Record<string, LotteryVariant> = {
  "lottery-megasena": "megasena",
  "lottery-lotofacil": "lotofacil",
  "lottery-quina": "quina",
  "lottery-lotomania": "lotomania",
  "lottery-duplasena": "duplasena",
  "lottery-diadesorte": "diadesorte",
  "lottery-supersete": "supersete",
  "lottery-maismilionaria": "maismilionaria",
  "lottery-timemania": "timemania",
  "lottery-federal": "federal",
  "lottery-loteca": "loteca"
};

// Helper to parse prize value from string like "R$ 42.350.000,00"
function parsePrizeValue(prize: string): number {
  const cleaned = prize.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
export function LotteryCard({
  result,
  onClick
}: LotteryCardProps) {
  const nextPrizeValue = parsePrizeValue(result.nextPrize);
  const isHighPrize = nextPrizeValue >= 20000000; // R$ 20 milhões

  const shareText = `🎰 ${result.name} - Concurso ${result.concurso}\n📅 ${result.date}\n🔢 Números: ${result.numbers.join(", ")}\n🏆 Prêmio: ${result.prize}\n💰 Próximo: ${result.nextPrize}`;
  return <Card className={cn("card-glass border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 glow-effect relative overflow-hidden", colorMap[result.color], isHighPrize && "ring-2 ring-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]")} onClick={onClick}>
      {/* High Prize Banner */}
      {isHighPrize && <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-center gap-2 animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          <span>PRÊMIO ACUMULADO!</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>}

      <CardHeader className={cn("pb-3", isHighPrize && "pt-10")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground">
            {result.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <ShareButton title={`${result.name} - Concurso ${result.concurso}`} text={shareText} className="h-8 w-8" />
            <Badge variant="outline" className={cn("font-mono", badgeColorMap[result.color])}>
              Concurso {result.concurso}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{result.date}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {result.id === "duplasena" ? (
            <>
              <div className="w-full text-xs text-center text-muted-foreground font-medium mb-1">1º Sorteio</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.numbers.slice(0, 6).map((num, idx) => (
                  <LotteryBall key={`s1-${idx}`} number={num} size="md" variant={variantMap[result.color]} delay={idx * 80} />
                ))}
              </div>
              <div className="w-full text-xs text-center text-muted-foreground font-medium mt-2 mb-1">2º Sorteio</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.numbers.slice(6).map((num, idx) => (
                  <LotteryBall key={`s2-${idx}`} number={num} size="md" variant={variantMap[result.color]} delay={(idx + 6) * 80} />
                ))}
              </div>
            </>
          ) : result.id === "maismilionaria" ? (
            <>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.numbers.map((num, idx) => (
                  <LotteryBall key={`n-${idx}`} number={num} size="md" variant={variantMap[result.color]} delay={idx * 80} />
                ))}
              </div>
              {result.trevos && result.trevos.length > 0 && (
                <>
                  <div className="w-full flex items-center justify-center gap-1.5 mt-2 mb-1">
                    <Clover className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-center text-emerald-500 font-medium">Trevos</span>
                    <Clover className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {result.trevos.map((trevo, idx) => (
                      <div key={`t-${idx}`} className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-sm font-bold text-emerald-400 animate-in fade-in zoom-in" style={{ animationDelay: `${(result.numbers.length + idx) * 80}ms` }}>
                        {trevo}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            result.numbers.map((num, idx) => <LotteryBall key={`${idx}-${num}`} number={num} size={result.numbers.length > 10 ? "sm" : "md"} variant={variantMap[result.color]} delay={idx * 80} />)
          )}
        </div>

        {/* Time do Coração - Timemania */}
        {result.id === "timemania" && result.timeCoracao && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-lime-500/10 border border-lime-500/30">
            <Heart className="w-4 h-4 text-lime-400 fill-lime-400" />
            <span className="text-sm font-semibold text-lime-400">{result.timeCoracao}</span>
          </div>
        )}

        {/* Mês da Sorte - Dia de Sorte */}
        {result.id === "diadesorte" && result.mesSorte && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-muted-foreground">Mês da Sorte:</span>
            <span className="text-sm font-semibold text-amber-400">{result.mesSorte}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Prêmio:</span>
          </div>
          <span className="font-semibold text-primary text-right text-base">{result.prize}</span>

          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Ganhadores:</span>
          </div>
          <span className="text-sm font-semibold text-right">
            {result.winners === 0 ? "Acumulou!" : result.winners}
          </span>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className={cn("w-4 h-4", isHighPrize ? "text-yellow-500" : "text-emerald-400")} />
            <span className="text-muted-foreground">Próximo:</span>
          </div>
          <span className={cn("text-sm font-bold text-right", isHighPrize ? "text-yellow-500 text-base animate-pulse" : "text-emerald-400")}>
            {result.nextPrize}
          </span>
        </div>

        {/* High Prize Highlight */}
        {isHighPrize && <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-center text-yellow-500 font-medium">
              💰 Acima de R$ 20 milhões! Não perca!
            </p>
          </div>}
      </CardContent>
    </Card>;
}
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryResult, NumberFrequency, generateFrequencyData } from "@/data/lotteryData";
import { FrequencyChart } from "./FrequencyChart";
import { StatisticsPanel } from "./StatisticsPanel";
import { SmartPickGenerator } from "./SmartPickGenerator";
import { DrawHistory } from "./DrawHistory";
import { LotteryBall } from "./LotteryBall";
import { PrizeEvolutionChart } from "./PrizeEvolutionChart";
import { ShareButton } from "./ShareButton";
import { BarChart3, Sparkles, History, Calendar, Clock, TrendingUp, Clover, Heart, CalendarDays, Trophy, Flame } from "lucide-react";
import { useMemo } from "react";

interface LotteryDetailModalProps {
  lottery: LotteryResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  "lottery-loteca": "loteca",
};

export function LotteryDetailModal({ lottery, open, onOpenChange }: LotteryDetailModalProps) {
  const frequencyData = useMemo(() => {
    if (!lottery) return [];
    return generateFrequencyData(lottery.maxNumber);
  }, [lottery]);

  if (!lottery) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {lottery.name}
              <span className="text-sm font-normal text-muted-foreground">
                Concurso {lottery.concurso}
              </span>
            </DialogTitle>
            <ShareButton
              title={`${lottery.name} - Concurso ${lottery.concurso}`}
              text={`🎰 ${lottery.name} - Concurso ${lottery.concurso}\n📅 ${lottery.date}\n🔢 Números: ${lottery.numbers.join(", ")}${lottery.trevos?.length ? `\n🍀 Trevos: ${lottery.trevos.join(", ")}` : ""}${lottery.timeCoracao ? `\n❤️ Time: ${lottery.timeCoracao}` : ""}${lottery.mesSorte ? `\n📆 Mês: ${lottery.mesSorte}` : ""}\n💰 Próximo: ${lottery.nextPrize}`}
              className="h-9 w-9"
            />
          </div>
          <DialogDescription className="sr-only">
            Detalhes do resultado {lottery.name} concurso {lottery.concurso}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Result */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Resultado de {lottery.date}</span>
            </div>
            {lottery.id === "duplasena" ? (
              <>
                <div className="w-full text-xs text-center text-muted-foreground font-medium mb-1">1º Sorteio</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {lottery.numbers.slice(0, 6).map((num, idx) => (
                    <LotteryBall key={`s1-${idx}`} number={num} size="lg" variant={variantMap[lottery.color]} delay={idx * 50} />
                  ))}
                </div>
                <div className="w-full text-xs text-center text-muted-foreground font-medium mt-2 mb-1">2º Sorteio</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {lottery.numbers.slice(6).map((num, idx) => (
                    <LotteryBall key={`s2-${idx}`} number={num} size="lg" variant={variantMap[lottery.color]} delay={(idx + 6) * 50} />
                  ))}
                </div>
              </>
            ) : lottery.id === "maismilionaria" ? (
              <>
                <div className="flex flex-wrap gap-2 justify-center">
                  {lottery.numbers.map((num, idx) => (
                    <LotteryBall key={`n-${idx}`} number={num} size="lg" variant={variantMap[lottery.color]} delay={idx * 50} />
                  ))}
                </div>
                {lottery.trevos && lottery.trevos.length > 0 && (
                  <>
                    <div className="w-full flex items-center justify-center gap-1.5 mt-2 mb-1">
                      <Clover className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-center text-emerald-500 font-medium">Trevos</span>
                      <Clover className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {lottery.trevos.map((trevo, idx) => (
                        <div key={`t-${idx}`} className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-base font-bold text-emerald-400 animate-in fade-in zoom-in" style={{ animationDelay: `${(lottery.numbers.length + idx) * 50}ms` }}>
                          {trevo}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {lottery.numbers.map((num, idx) => (
                  <LotteryBall key={`n-${idx}`} number={num} size={lottery.numbers.length > 10 ? "sm" : "lg"} variant={variantMap[lottery.color]} delay={idx * 50} />
                ))}
              </div>
            )}

            {/* Time do Coração - Timemania */}
            {lottery.id === "timemania" && lottery.timeCoracao && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 mt-2">
                <Heart className="w-4 h-4 text-green-400 fill-green-400" />
                <span className="text-sm font-semibold text-green-400">{lottery.timeCoracao}</span>
              </div>
            )}

            {/* Mês da Sorte - Dia de Sorte */}
            {lottery.id === "diadesorte" && lottery.mesSorte && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mt-2">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Mês da Sorte:</span>
                <span className="text-sm font-semibold text-amber-400">{lottery.mesSorte}</span>
              </div>
            )}
          </div>

          {/* Prize Tiers */}
          {lottery.premiacoes && lottery.premiacoes.length > 0 && (
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                <Trophy className="w-4 h-4 text-primary" />
                <span>Faixas de Premiação</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Faixa</th>
                      <th className="text-center py-2 px-2 text-muted-foreground font-medium">Ganhadores</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lottery.premiacoes.map((p, idx) => (
                      <tr key={idx} className="border-b border-border/50 last:border-0">
                        <td className="py-2 px-2 text-foreground">{p.descricao}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={p.ganhadores > 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                            {p.ganhadores}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-foreground">
                          {typeof p.valorPremio === 'number'
                            ? `R$ ${p.valorPremio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : p.valorPremio}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Next Draw Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Próximo Prêmio</span>
              </div>
              <span className="text-base font-bold text-primary">{lottery.nextPrize}</span>
              {lottery.accumulated && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-500">
                  <Flame className="w-3 h-3" /> Acumulado!
                </span>
              )}
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Próximo Sorteio</span>
              </div>
              <span className="text-base font-bold text-foreground">{lottery.nextDate || "A definir"}</span>
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Estatísticas</span>
              </TabsTrigger>
              <TabsTrigger value="frequency" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Frequências</span>
              </TabsTrigger>
              <TabsTrigger value="evolution" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Evolução</span>
              </TabsTrigger>
              <TabsTrigger value="picks" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Palpites</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4">
              <DrawHistory lottery={lottery} variant={variantMap[lottery.color]} />
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <StatisticsPanel
                frequencyData={frequencyData}
                variant={variantMap[lottery.color]}
                showCount={lottery.selectCount > 10 ? 10 : lottery.selectCount}
              />
            </TabsContent>

            <TabsContent value="frequency" className="mt-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <FrequencyChart
                  data={frequencyData}
                  maxNumber={lottery.maxNumber}
                  title={`Mapa de Frequência - ${lottery.name}`}
                />
              </div>
            </TabsContent>

            <TabsContent value="evolution" className="mt-4">
              <PrizeEvolutionChart lottery={lottery} variant={variantMap[lottery.color]} />
            </TabsContent>

            <TabsContent value="picks" className="mt-4">
              <SmartPickGenerator
                lottery={lottery}
                frequencyData={frequencyData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

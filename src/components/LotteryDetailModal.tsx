import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LotecaVolante } from "./LotecaVolante";
import { LotecaUpcomingMatches, LOTECA_1255 } from "./LotecaUpcomingMatches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryResult, NumberFrequency, generateFrequencyData, WinnerLocation, LotecaMatch } from "@/data/lotteryData";
import { FrequencyChart } from "./FrequencyChart";
import { StatisticsPanel } from "./StatisticsPanel";
import { DrawHistory } from "./DrawHistory";
import { LotteryBall } from "./LotteryBall";

import { ShareResultImageButton } from "./ShareResultImageButton";
import { SpecialStats } from "./SpecialStats";
import { BarChart3, Sparkles, History, Calendar, Clock, TrendingUp, Clover, Heart, CalendarDays, Trophy, Flame, MapPin, Dribbble, ChevronLeft, ChevronRight, Loader2, Coins } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLotteryDraw } from "@/hooks/useLotteryResults";

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
  const captureRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(0);

  // Reset offset when lottery changes or modal closes
  useEffect(() => {
    setOffset(0);
  }, [lottery?.id, lottery?.concurso, open]);

  const baseConcurso = lottery?.concurso ?? 0;
  const targetConcurso = baseConcurso + offset;

  const {
    data: fetchedDraw,
    isLoading: isFetchingDraw,
    isError: isDrawError,
  } = useLotteryDraw(
    offset !== 0 && lottery ? lottery.id : "",
    offset !== 0 ? targetConcurso : 0,
  );

  if (!lottery) return null;

  const displayedLottery: LotteryResult =
    offset === 0
      ? lottery
      : fetchedDraw
        ? {
            ...lottery,
            ...fetchedDraw,
            color: lottery.color,
            maxNumber: lottery.maxNumber,
            selectCount: lottery.selectCount,
            name: lottery.name,
          }
        : lottery;

  const canGoPrev = targetConcurso > 1 && !isFetchingDraw;
  // Block "next" when we're already past the latest known and got an error
  const atLatestKnown = offset >= 0 && isDrawError;
  const canGoNext = !atLatestKnown && !isFetchingDraw;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden bg-card border-border p-2 sm:p-6 mx-0 sm:mx-auto w-[calc(100vw-0.5rem)] sm:w-auto rounded-xl">
        <DialogHeader className="space-y-0.5 sm:space-y-1">
          <DialogTitle className="text-base sm:text-2xl font-bold flex items-baseline gap-1.5 sm:gap-3 flex-nowrap leading-tight min-w-0 overflow-hidden">
              <span className="truncate min-w-0">{displayedLottery.name}</span>
              <span className="text-base sm:text-3xl font-bold text-primary shrink-0 whitespace-nowrap">
                #{displayedLottery.concurso}
              </span>
            </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes do resultado {displayedLottery.name} concurso {displayedLottery.concurso}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6 overflow-x-hidden">
          {isDrawError && offset !== 0 && (
            <div className="text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-md py-2 px-3">
              Não foi possível carregar o concurso #{targetConcurso}.
            </div>
          )}
          <div
            ref={captureRef}
            className={`space-y-3 sm:space-y-6 transition-opacity ${
              isFetchingDraw && offset !== 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
          {/* Current Result */}
          <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] sm:text-sm text-muted-foreground">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{displayedLottery.date}</span>
            </div>
            {typeof displayedLottery.totalCollected === "number" && displayedLottery.totalCollected > 0 && (
              <div className="flex items-center justify-center gap-1.5 mb-2 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] sm:text-sm">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-muted-foreground">Arrecadação total:</span>
                <span className="font-semibold text-foreground font-mono">
                  R$ {displayedLottery.totalCollected.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            {displayedLottery.id === "loteca" && displayedLottery.jogos ? (
              <LotecaVolante jogos={displayedLottery.jogos} concurso={displayedLottery.concurso} />
            ) : displayedLottery.id === "federal" ? (
              <div className="space-y-2">
                {displayedLottery.numbers.map((num, idx) => {
                  const location = displayedLottery.localGanhadores?.find(l => l.posicao === idx + 1);
                  const premio = displayedLottery.premiacoes?.[idx];
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-xs font-medium text-muted-foreground">{idx + 1}º</span>
                        {location && (
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3 h-3 text-sky-400/70 shrink-0" />
                            <span className="text-xs text-muted-foreground/80 truncate">{location.nomeLoteria}</span>
                          </div>
                        )}
                        {location && (
                          <span className="text-[10px] text-muted-foreground/60 ml-4 truncate">{location.municipio}/{location.uf}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="font-mono font-bold text-sky-400 text-sm sm:text-lg">{String(num).padStart(5, '0')}</span>
                        {premio && (
                          <span className="text-xs font-medium text-primary">
                            R$ {premio.valorPremio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : displayedLottery.id === "duplasena" ? (
              <>
                <div className="w-full text-xs text-center text-muted-foreground font-medium mb-1">1º Sorteio</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {displayedLottery.numbers.slice(0, 6).map((num, idx) => (
                    <LotteryBall key={`s1-${idx}`} number={num} size="md" variant={variantMap[displayedLottery.color]} delay={idx * 50} />
                  ))}
                </div>
                <div className="w-full text-xs text-center text-muted-foreground font-medium mt-2 mb-1">2º Sorteio</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {displayedLottery.numbers.slice(6).map((num, idx) => (
                    <LotteryBall key={`s2-${idx}`} number={num} size="md" variant={variantMap[displayedLottery.color]} delay={(idx + 6) * 50} />
                  ))}
                </div>
              </>
            ) : displayedLottery.id === "maismilionaria" ? (
              <>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {displayedLottery.numbers.map((num, idx) => (
                    <LotteryBall key={`n-${idx}`} number={num} size="md" variant={variantMap[displayedLottery.color]} delay={idx * 50} />
                  ))}
                </div>
                {displayedLottery.trevos && displayedLottery.trevos.length > 0 && (
                  <>
                    <div className="w-full flex items-center justify-center gap-1.5 mt-2 mb-1">
                      <Clover className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-center text-emerald-500 font-medium">Trevos</span>
                      <Clover className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {displayedLottery.trevos.map((trevo, idx) => (
                        <div key={`t-${idx}`} className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-sm sm:text-base font-bold text-emerald-400 animate-in fade-in zoom-in" style={{ animationDelay: `${(displayedLottery.numbers.length + idx) * 50}ms` }}>
                          {trevo}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                {displayedLottery.numbers.map((num, idx) => (
                  <LotteryBall key={`n-${idx}`} number={num} size={displayedLottery.numbers.length > 10 ? "sm" : "md"} variant={variantMap[displayedLottery.color]} delay={idx * 50} />
                ))}
              </div>
            )}

            {/* Time do Coração - Timemania */}
            {displayedLottery.id === "timemania" && displayedLottery.timeCoracao && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/30 mt-2">
                <Heart className="w-4 h-4 text-green-400 fill-green-400" />
                <span className="text-sm font-semibold text-green-400">{displayedLottery.timeCoracao}</span>
              </div>
            )}

            {/* Mês da Sorte - Dia de Sorte */}
            {displayedLottery.id === "diadesorte" && displayedLottery.mesSorte && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mt-2">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Mês da Sorte:</span>
                <span className="text-sm font-semibold text-amber-400">{displayedLottery.mesSorte}</span>
              </div>
            )}
          </div>

          {/* Winner Locations - All lotteries except Federal (already shown inline) */}
          {displayedLottery.id !== "federal" && displayedLottery.localGanhadores && displayedLottery.localGanhadores.length > 0 && (
            <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-foreground">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span>Locais dos Ganhadores</span>
              </div>
              <div className="space-y-2">
                {displayedLottery.localGanhadores.map((loc, idx) => (
                  <div key={idx} className="flex items-start gap-2 px-2 sm:px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                    <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      {loc.nomeLoteria ? (
                        <span className="text-sm font-medium text-foreground truncate">{loc.nomeLoteria}</span>
                      ) : null}
                      <span className="text-xs text-muted-foreground truncate">
                        {loc.municipio}/{loc.uf}
                      </span>
                    </div>
                    {loc.ganhadores > 0 && (
                      <span className="text-xs font-semibold text-primary whitespace-nowrap shrink-0">
                        {loc.ganhadores} {loc.ganhadores === 1 ? "ganhador" : "ganhadores"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prize Tiers */}
          {displayedLottery.premiacoes && displayedLottery.premiacoes.length > 0 && (
             <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-foreground">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span>Faixas de Premiação</span>
              </div>
              {displayedLottery.id === "duplasena" ? (
                <div className="space-y-4">
                  {[
                    { label: "1º Sorteio", items: displayedLottery.premiacoes.slice(0, Math.ceil(displayedLottery.premiacoes.length / 2)) },
                    { label: "2º Sorteio", items: displayedLottery.premiacoes.slice(Math.ceil(displayedLottery.premiacoes.length / 2)) },
                  ].map((group) => (
                    <div key={group.label}>
                      <div className="text-xs font-semibold text-muted-foreground text-center mb-2">{group.label}</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-1.5 px-1.5 sm:py-2 sm:px-2 text-muted-foreground font-medium">Faixa</th>
                              <th className="text-center py-1.5 px-1 sm:py-2 sm:px-2 text-muted-foreground font-medium">Ganh.</th>
                              <th className="text-right py-1.5 px-1.5 sm:py-2 sm:px-2 text-muted-foreground font-medium">Prêmio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((p, idx) => (
                              <tr key={idx} className="border-b border-border/50 last:border-0">
                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 text-foreground">{p.descricao}</td>
                                <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-center">
                                  <span className={p.ganhadores > 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                                    {p.ganhadores}
                                  </span>
                                </td>
                                <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 text-right font-mono text-foreground">
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
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1.5 px-1.5 sm:py-2 sm:px-2 text-muted-foreground font-medium">Faixa</th>
                        <th className="text-center py-1.5 px-1 sm:py-2 sm:px-2 text-muted-foreground font-medium">Ganh.</th>
                        <th className="text-right py-1.5 px-1.5 sm:py-2 sm:px-2 text-muted-foreground font-medium">Prêmio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedLottery.premiacoes.map((p, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 text-foreground">{p.descricao}</td>
                          <td className="py-1.5 px-1 sm:py-2 sm:px-2 text-center">
                            <span className={p.ganhadores > 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                              {p.ganhadores}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 sm:py-2 sm:px-2 text-right font-mono text-foreground">
                            {typeof p.valorPremio === 'number'
                              ? `R$ ${p.valorPremio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : p.valorPremio}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Next Draw Info */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border flex flex-col items-center gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Próximo Prêmio</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-primary">{displayedLottery.nextPrize}</span>
              {displayedLottery.accumulated && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-yellow-500">
                  <Flame className="w-3 h-3" /> Acumulado!
                </span>
              )}
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border flex flex-col items-center gap-0.5 sm:gap-1">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Próximo Sorteio</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-foreground">{displayedLottery.nextDate || "A definir"}</span>
            </div>
          </div>
          </div>

          {/* Share Button - Centralizado */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Concurso anterior"
              onClick={() => setOffset((o) => o - 1)}
              disabled={!canGoPrev}
              className="h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary"
            >
              {isFetchingDraw && offset < 0 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            <ShareResultImageButton
              targetRef={captureRef}
              lotteryName={displayedLottery.name}
              lotteryId={displayedLottery.id}
              concurso={displayedLottery.concurso}
              date={displayedLottery.date}
              nextPrize={displayedLottery.nextPrize}
              className="h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Próximo concurso"
              onClick={() => setOffset((o) => o + 1)}
              disabled={!canGoNext}
              className="h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary"
            >
              {isFetchingDraw && offset > 0 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>


          <Tabs defaultValue="history" className="w-full">
            <TabsList className="flex w-full overflow-x-auto gap-0.5 sm:gap-1 bg-secondary/50 p-0.5 sm:p-1 rounded-lg scrollbar-hide">
              <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-w-fit text-[10px] sm:text-sm rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Histórico</span>
              </TabsTrigger>
              {lottery.id === "loteca" && (
                <TabsTrigger value="upcoming" className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-w-fit text-[10px] sm:text-sm rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                  <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Próximo Concurso</span>
                </TabsTrigger>
              )}
              {lottery.id !== "loteca" && (
                <>
                  <TabsTrigger value="stats" className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-w-fit text-[10px] sm:text-sm rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Estatísticas</span>
                  </TabsTrigger>
                  <TabsTrigger value="frequency" className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-w-fit text-[10px] sm:text-sm rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Frequências</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="history" className="mt-2 sm:mt-4">
              <DrawHistory lottery={lottery} variant={variantMap[lottery.color]} />
            </TabsContent>

            {lottery.id === "loteca" && (
              <TabsContent value="upcoming" className="mt-2 sm:mt-4">
                <LotecaUpcomingMatches {...LOTECA_1255} />
              </TabsContent>
            )}

            {lottery.id !== "loteca" && (
              <>
                <TabsContent value="stats" className="mt-2 sm:mt-4 space-y-3 sm:space-y-4">
                  <StatisticsPanel
                    frequencyData={frequencyData}
                    variant={variantMap[lottery.color]}
                    showCount={lottery.selectCount > 10 ? 10 : lottery.selectCount}
                  />
                  <SpecialStats lottery={lottery} />
                </TabsContent>

                <TabsContent value="frequency" className="mt-2 sm:mt-4">
                  <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-secondary/30 border border-border">
                    <FrequencyChart
                      data={frequencyData}
                      maxNumber={lottery.maxNumber}
                      title={`Mapa de Frequência - ${lottery.name}`}
                    />
                  </div>
                </TabsContent>

              </>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

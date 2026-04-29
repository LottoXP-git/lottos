import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, generateFrequencyData, generateSmartPicks, NumberFrequency } from "@/data/lotteryData";
import { analyzeBet, buildTemperatureMap, BetAnalysis } from "@/lib/lotteryStats";
import { BetAnalysisCard } from "./BetAnalysisCard";
import { Dices, RefreshCw, Copy, Check, Clover, Heart, CalendarDays, Flame, Snowflake, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoAdModal } from "./VideoAdModal";
import { useLuckProgress } from "@/hooks/useLuckProgress";
import { usePickHistory } from "@/hooks/usePickHistory";
import { computeRarity, type RarityInfo } from "@/lib/pickRarity";
import { LuckProgressBar } from "./generator/LuckProgressBar";
import { PickRarityBadge } from "./generator/PickRarityBadge";
import { PickHistoryList } from "./generator/PickHistoryList";
import { LuckModeSelector } from "./generator/LuckModeSelector";
import { NextDrawCTA } from "./generator/NextDrawCTA";
import { ShareablePickButton } from "./generator/ShareablePickButton";
import { generateModePicks, type LuckModeId } from "@/lib/luckModes";

interface QuickBetGeneratorProps {
  lotteries: LotteryResult[];
  preselectedId?: string;
}

type Strategy = "hot" | "cold" | "balanced";

const strategyOptions: { id: Strategy; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "hot", label: "Quentes", icon: <Flame className="w-3.5 h-3.5" />, color: "text-orange-400" },
  { id: "cold", label: "Frias", icon: <Snowflake className="w-3.5 h-3.5" />, color: "text-sky-400" },
  { id: "balanced", label: "Equilibrada", icon: <Scale className="w-3.5 h-3.5" />, color: "text-emerald-400" },
];

const variantMap: Record<string, string> = {
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

const TIMES_TIMEMANIA = [
  "ABC/RN", "Altos/PI", "América-MG", "América-RN", "Aparecidense/GO",
  "Atlético-GO", "Atlético-MG", "Avaí/SC", "Bahia/BA", "Botafogo/PB",
  "Botafogo/RJ", "Bragantino/PA", "Brasiliense/DF", "Ceará/CE", "Chapecoense/SC",
  "Corinthians/SP", "Coritiba/PR", "CRB/AL", "Criciúma/SC", "Cruzeiro/MG",
  "CSA/AL", "Cuiabá/MT", "Figueirense/SC", "Flamengo/RJ", "Fluminense/RJ",
  "Fortaleza/CE", "Goiás/GO", "Grêmio/RS", "Guarani/SP", "Internacional/RS",
  "Ituano/SP", "Joinville/SC", "Juventude/RS", "Londrina/PR", "Manaus/AM",
  "Mirassol/SP", "Náutico/PE", "Novorizontino/SP", "Operário-PR", "Palmeiras/SP",
  "Paysandu/PA", "Ponte Preta/SP", "Porto Velho/RO", "Remo/PA", "Sampaio Corrêa/MA",
  "Santos/SP", "São Paulo/SP", "Sport/PE", "Tombense/MG", "Vasco/RJ",
  "Vila Nova/GO", "Vitória/BA", "Volta Redonda/RJ"
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function generateRandomNumbers(max: number, count: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function QuickBetGenerator({ lotteries, preselectedId }: QuickBetGeneratorProps) {
  const [selectedId, setSelectedId] = useState(lotteries[0]?.id || "");

  useEffect(() => {
    if (preselectedId) {
      setSelectedId(preselectedId);
    }
  }, [preselectedId]);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [trevos, setTrevos] = useState<number[]>([]);
  const [timeCoracao, setTimeCoracao] = useState<string>("");
  const [mesSorte, setMesSorte] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [freeGenerations, setFreeGenerations] = useState(2);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [analysis, setAnalysis] = useState<BetAnalysis | null>(null);
  const [frequencyData, setFrequencyData] = useState<NumberFrequency[]>([]);
  const [rarity, setRarity] = useState<RarityInfo | null>(null);
  const [luckMode, setLuckMode] = useState<LuckModeId>("random");
  const [luckInput, setLuckInput] = useState<string>("");
  const ENTRANCES = ["bounce", "cascade", "flip", "pop", "spin"] as const;
  const [entranceIdx, setEntranceIdx] = useState(0);
  const entrance = ENTRANCES[entranceIdx];

  const luck = useLuckProgress();
  const history = usePickHistory();

  const selected = lotteries.find((l) => l.id === selectedId);

  // Reset analysis when lottery changes
  useEffect(() => {
    setNumbers([]);
    setAnalysis(null);
    setTrevos([]);
    setTimeCoracao("");
    setMesSorte("");
    setRarity(null);
  }, [selectedId]);

  const generate = () => {
    if (!selected) return;
    if (freeGenerations <= 0) {
      setShowVideoAd(true);
      return;
    }
    runGeneration();
  };

  const handleAdComplete = () => {
    setShowVideoAd(false);
    setFreeGenerations(2);
    runGeneration();
  };

  const runGeneration = () => {
    if (!selected) return;
    setIsSpinning(true);
    setFreeGenerations((prev) => prev - 1);
    setTrevos([]);
    setTimeCoracao("");
    setMesSorte("");
    setAnalysis(null);
    setRarity(null);
    setEntranceIdx((i) => (i + 1) % ENTRANCES.length);
    setTimeout(() => {
      if (selected.id === "federal" || selected.id === "loteca") {
        toast.info(`Geração aleatória não disponível para ${selected.name}`);
        setIsSpinning(false);
        return;
      }
      // Generate frequency data and use strategy-aware smart picks
      const freqData = generateFrequencyData(selected.maxNumber);
      const nums =
        luckMode === "random"
          ? generateSmartPicks(freqData, selected.selectCount, strategy)
          : generateModePicks(luckMode, luckInput, selected.maxNumber, selected.selectCount);
      setFrequencyData(freqData);
      setNumbers(nums);
      const a = analyzeBet(nums, freqData, selected.maxNumber, selected.selectCount, strategy);
      setAnalysis(a);
      const r = computeRarity(a);
      setRarity(r);

      // Special fields
      let trevosOut: number[] = [];
      let timeOut = "";
      let mesOut = "";
      if (selected.id === "maismilionaria") {
        trevosOut = generateRandomNumbers(6, 2);
        setTrevos(trevosOut);
      }
      if (selected.id === "timemania") {
        timeOut = pickRandom(TIMES_TIMEMANIA);
        setTimeCoracao(timeOut);
      }
      if (selected.id === "diadesorte") {
        mesOut = pickRandom(MESES);
        setMesSorte(mesOut);
      }

      setIsSpinning(false);

      // Add to history
      history.add({
        lotteryId: selected.id,
        lotteryName: selected.name,
        numbers: nums,
        trevos: trevosOut.length ? trevosOut : undefined,
        timeCoracao: timeOut || undefined,
        mesSorte: mesOut || undefined,
        strategy,
        rarity: r.level,
      });

      // Award XP based on rarity
      const xpAmount =
        r.level === "legendary" ? 50 : r.level === "epic" ? 30 : r.level === "rare" ? 18 : 10;
      const result = luck.addXp(xpAmount);

      // Confetti — bigger and golden for rarer picks
      const colorsByRarity: Record<typeof r.level, string[]> = {
        common: ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"],
        rare: ["#38bdf8", "#22d3ee", "#a78bfa", "#f472b6"],
        epic: ["#a855f7", "#d946ef", "#f59e0b", "#fde047"],
        legendary: ["#fbbf24", "#f59e0b", "#fde047", "#fff7ae"],
      };
      confetti({
        particleCount: r.level === "legendary" ? 220 : r.level === "epic" ? 160 : 110,
        spread: r.level === "legendary" ? 110 : 80,
        startVelocity: r.level === "legendary" ? 55 : 45,
        origin: { y: 0.6 },
        colors: colorsByRarity[r.level],
      });

      // Toasts for milestones
      if (r.level === "legendary") {
        toast.success("👑 Palpite Lendário! +50 XP", {
          description: "Combinação muito rara — guarde com carinho.",
        });
      } else if (r.level === "epic") {
        toast.success("💜 Palpite Épico! +30 XP");
      }
      if (result.leveledUp && result.newLevel) {
        setTimeout(() => {
          toast.success(`${result.newLevel!.emoji} Subiu de nível: ${result.newLevel!.name}!`, {
            description: "Continue gerando palpites para evoluir ainda mais.",
          });
          confetti({
            particleCount: 180,
            spread: 120,
            startVelocity: 50,
            origin: { y: 0.4 },
            colors: ["#fbbf24", "#f59e0b", "#fde047", "#fff7ae", "#22c55e"],
          });
        }, 600);
      } else if (result.streakIncreased && result.streakDays > 1) {
        toast(`🔥 Sequência de ${result.streakDays} dias!`, {
          description: "Volte amanhã para manter sua chama acesa.",
        });
      }
    }, 400);
  };

  const copyNumbers = () => {
    if (numbers.length === 0) return;
    let text = numbers.map((n) => n.toString().padStart(2, "0")).join(" - ");
    if (trevos.length > 0) text += ` | Trevos: ${trevos.join(" - ")}`;
    if (timeCoracao) text += ` | Time: ${timeCoracao}`;
    if (mesSorte) text += ` | Mês: ${mesSorte}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Números copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  const ballVariant = selected ? variantMap[selected.color] as any : "default";
  const tempMap = analysis ? new Map(analysis.perNumber.map((p) => [p.number, p])) : null;

  return (
    <Card className="card-glass border-primary/30 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="text-center relative pb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 mx-auto mb-3">
          <Dices className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Gerador de Palpites Inteligentes
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha a loteria e gere seus números da sorte
        </p>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <LuckProgressBar
          level={luck.level}
          nextLevel={luck.nextLevel}
          xp={luck.xp}
          progress={luck.progress}
          streakDays={luck.streakDays}
          totalPicks={luck.totalPicks}
        />

        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Escolha a loteria" />
          </SelectTrigger>
          <SelectContent>
            {lotteries.
            filter((l) => l.id !== "federal" && l.id !== "loteca").
            map((l) =>
            <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Strategy selector */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground text-center">
            Estratégia de recomendação
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {strategyOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStrategy(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-xl border-2 transition-all",
                  strategy === s.id
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                    : "border-border bg-secondary/30 hover:border-primary/40"
                )}
              >
                <span className={strategy === s.id ? s.color : "text-muted-foreground"}>
                  {s.icon}
                </span>
                <span className="text-xs font-medium text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={generate}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-primary-foreground font-bold text-base h-12 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
          disabled={isSpinning || !selected || selected.id === "federal" || selected.id === "loteca"}>
          {isSpinning ?
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> :
          <Dices className="w-5 h-5 mr-2" />
          }
          {freeGenerations > 0
            ? `Gerar Aposta (${freeGenerations} restante${freeGenerations > 1 ? "s" : ""})`
            : "Assistir Anúncio para Gerar"}
        </Button>

        {freeGenerations <= 0 && numbers.length > 0 && (
          <p className="text-xs text-center text-muted-foreground animate-pulse">
            🎬 Assista um anúncio rápido para liberar mais 2 palpites gratuitos
          </p>
        )}

        {numbers.length > 0 &&
        <div className="space-y-4 animate-fade-in">
            {rarity && (
              <div className="flex justify-center">
                <PickRarityBadge info={rarity} />
              </div>
            )}
            <div
              className={cn(
                "flex flex-wrap gap-2 justify-center py-4 px-2 rounded-xl bg-background/50 border border-border/50 transition-shadow",
                rarity?.glowClass
              )}
            >
              {numbers.map((num, idx) => {
                const meta = tempMap?.get(num);
                const tempLabel = meta?.temperature === "hot" ? "Quente" : meta?.temperature === "cold" ? "Fria" : "Morna";
                return (
                  <LotteryBall
                    key={`${num}-${idx}`}
                    number={num}
                    size={numbers.length > 10 ? "sm" : "md"}
                    variant={ballVariant}
                    delay={idx * 80}
                    temperature={meta?.temperature}
                    entrance={entrance}
                    title={meta ? `Dezena ${num} — ${tempLabel} (saiu ${meta.frequency}x nos últimos 100 sorteios)` : undefined}
                  />
                );
              })}
            </div>

            {/* Legend */}
            {analysis && (
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground -mt-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Quente</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-300" /> Morna</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Fria</span>
              </div>
            )}

            {/* Trevos - +Milionária */}
            {trevos.length > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-background/50 border border-border/50">
                <Clover className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-muted-foreground">Trevos:</span>
                {trevos.map((t, idx) => (
                  <div key={`trevo-${idx}`} className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-sm font-bold text-emerald-400 animate-fade-in" style={{ animationDelay: `${(numbers.length + idx) * 80}ms` }}>
                    {t}
                  </div>
                ))}
              </div>
            )}

            {/* Time do Coração - Timemania */}
            {timeCoracao && (
              <div className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-background/50 border border-border/50 animate-fade-in">
                <Heart className="w-4 h-4 text-green-400 fill-green-400" />
                <span className="text-sm font-semibold text-muted-foreground">Time do Coração:</span>
                <span className="text-sm font-bold text-green-400">{timeCoracao}</span>
              </div>
            )}

            {/* Mês da Sorte - Dia de Sorte */}
            {mesSorte && (
              <div className="flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-background/50 border border-border/50 animate-fade-in">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-muted-foreground">Mês da Sorte:</span>
                <span className="text-sm font-bold text-amber-400">{mesSorte}</span>
              </div>
            )}

            <Button
            onClick={copyNumbers}
            variant="outline"
            size="lg"
            className="w-full border-primary/50 hover:bg-primary/10 h-11">
              {copied ?
            <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  Copiado!
                </> :
            <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Números
                </>
            }
            </Button>

            {selected && (
              <ShareablePickButton
                lotteryName={selected.name}
                numbers={numbers}
                trevos={trevos.length ? trevos : undefined}
                timeCoracao={timeCoracao || undefined}
                mesSorte={mesSorte || undefined}
                rarityLabel={rarity?.label}
                rarityEmoji={rarity?.emoji}
                levelName={luck.level.name}
                levelEmoji={luck.level.emoji}
              />
            )}

            {/* Analysis card */}
            {analysis && selected && (
              <BetAnalysisCard analysis={analysis} lotteryName={selected.name} />
            )}
          </div>
        }

        {selected && selected.id !== "federal" && selected.id !== "loteca" && (
          <NextDrawCTA nextDate={selected.nextDate} lotteryName={selected.name} />
        )}

        {/* Pick history */}
        <PickHistoryList
          items={history.items}
          onToggleFavorite={history.toggleFavorite}
          onRemove={history.remove}
          onClear={history.clear}
        />

        <VideoAdModal open={showVideoAd} onComplete={handleAdComplete} />
      </CardContent>
    </Card>);

}
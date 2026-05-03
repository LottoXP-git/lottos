import { useEffect, useMemo, useState } from "react";
import { VideoAdModal } from "./VideoAdModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, NumberFrequency, generateSmartPicks } from "@/data/lotteryData";
import { Sparkles, Flame, Snowflake, Scale, RefreshCw, Copy, Check, Wand2, Dices, Star, Zap, Ticket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  buildFrequency,
  emptyFreq,
  fetchFederalHistory,
  pickByStrategy,
  HISTORY_SIZE,
  type FederalStrategy,
} from "@/lib/federalPicks";

interface SmartPickGeneratorProps {
  lottery: LotteryResult;
  frequencyData: NumberFrequency[];
}

type Strategy = "hot" | "cold" | "balanced";

const strategies: { id: Strategy; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "hot", label: "Quentes", icon: <Flame className="w-4 h-4" />, description: "Dezenas mais sorteadas" },
  { id: "cold", label: "Frias", icon: <Snowflake className="w-4 h-4" />, description: "Dezenas menos sorteadas" },
  { id: "balanced", label: "Equilibrado", icon: <Scale className="w-4 h-4" />, description: "Mix de quentes e frias" },
];

const federalStrategies: { id: FederalStrategy; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: "hot", label: "Quentes", icon: <Flame className="w-3.5 h-3.5" />, color: "text-orange-400", desc: "Dígitos mais sorteados por posição" },
  { id: "cold", label: "Frias", icon: <Snowflake className="w-3.5 h-3.5" />, color: "text-sky-400", desc: "Dígitos menos sorteados" },
  { id: "balanced", label: "Equilibrada", icon: <Scale className="w-3.5 h-3.5" />, color: "text-emerald-400", desc: "Probabilidade ponderada" },
  { id: "random", label: "Aleatória", icon: <Dices className="w-3.5 h-3.5" />, color: "text-purple-400", desc: "Sorteio puramente aleatório" },
];

const variantMap: Record<string, "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca"> = {
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

export function SmartPickGenerator({ lottery, frequencyData }: SmartPickGeneratorProps) {
  const isFederal = lottery.id === "federal";

  // Estados do fluxo padrão (dezenas)
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [picks, setPicks] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [freeGenerations, setFreeGenerations] = useState(2);
  const [showVideoAd, setShowVideoAd] = useState(false);

  // Estados Federal
  const [fedStrategy, setFedStrategy] = useState<FederalStrategy>("balanced");
  const [count, setCount] = useState("3");
  const [federalPicks, setFederalPicks] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<string[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const t = await fetchFederalHistory(HISTORY_SIZE);
      if (t.length === 0) throw new Error("Histórico vazio");
      setHistory(t);
    } catch (e: any) {
      setHistoryError(e?.message || "Erro ao carregar histórico");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isFederal && history === null && !loadingHistory) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFederal]);

  const freq = useMemo(() => (history ? buildFrequency(history) : emptyFreq()), [history]);

  const concursosAnalisados = useMemo(
    () => (history ? Math.ceil(history.length / 5) : 0),
    [history]
  );

  const hottestPerPosition = useMemo(() => {
    return freq.map((counts) => {
      const top = counts.map((c, d) => ({ c, d })).sort((a, b) => b.c - a.c)[0];
      return top?.d ?? 0;
    });
  }, [freq]);

  const generatePicks = () => {
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
    setIsGenerating(true);
    setFreeGenerations((prev) => prev - 1);

    if (isFederal) {
      setFederalPicks([]);
      setTimeout(() => {
        if (!history || history.length === 0) {
          toast.error("Histórico ainda não carregado.");
          setIsGenerating(false);
          return;
        }
        const n = Math.min(10, Math.max(1, parseInt(count) || 1));
        const result: string[] = [];
        const seen = new Set<string>();
        let attempts = 0;
        while (result.length < n && attempts < n * 30) {
          const b = pickByStrategy(freq, fedStrategy);
          if (!seen.has(b)) {
            seen.add(b);
            result.push(b);
          }
          attempts++;
        }
        setFederalPicks(result);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#22c55e", "#eab308", "#3b82f6"],
        });
        setIsGenerating(false);
      }, 500);
    } else {
      setPicks([]);
      setTimeout(() => {
        const newPicks = generateSmartPicks(frequencyData, lottery.selectCount, strategy);
        setPicks(newPicks);
        setIsGenerating(false);
      }, 500);
    }
  };

  const copyPicks = () => {
    if (picks.length === 0) return;
    const text = picks.map((n) => n.toString().padStart(2, "0")).join(" - ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Palpite copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyFederal = async (bilhete: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(bilhete);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
      toast.success("Bilhete copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Card className="card-glass border-primary/20 overflow-hidden relative">
      <div className="absolute top-2 right-3 opacity-10 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <Star className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
        </motion.div>
      </div>
      <div className="absolute bottom-4 left-2 opacity-[0.07] pointer-events-none">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Dices className="w-12 h-12 sm:w-14 sm:h-14 text-accent" />
        </motion.div>
      </div>

      <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-1 sm:pb-2 relative z-10">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
            <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          </motion.div>
          <span className="text-gradient font-bold">Gerador de Palpites Inteligente</span>
          {isFederal && <Badge variant="outline" className="text-[10px] ml-1">Federal</Badge>}
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          </motion.div>
        </CardTitle>
        {isFederal && (
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            🎟️ Bilhetes de 6 dígitos baseados na frequência dos sorteios anteriores
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-6 px-3 sm:px-6 pb-3 sm:pb-6 relative z-10">
        {isFederal ? (
          <>
            {/* Status histórico */}
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
              {loadingHistory ? (
                <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Carregando histórico...</span>
              ) : historyError ? (
                <span className="text-destructive">{historyError}</span>
              ) : (
                <span>Base: <strong className="text-foreground">{concursosAnalisados}</strong> concursos · <strong className="text-foreground">{history?.length ?? 0}</strong> bilhetes</span>
              )}
              <Button variant="ghost" size="sm" onClick={loadHistory} disabled={loadingHistory} className="h-6 px-2 text-[11px]">
                <RefreshCw className={cn("w-3 h-3", loadingHistory && "animate-spin")} />
              </Button>
            </div>

            {/* Padrão por posição */}
            {!loadingHistory && !historyError && history && (
              <div className="rounded-lg bg-secondary/40 border border-border p-2.5">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Dígito mais frequente por posição:</p>
                <div className="flex items-center justify-center gap-1.5 font-mono">
                  {hottestPerPosition.map((d, i) => (
                    <span key={i} className="inline-flex items-center justify-center w-7 h-9 sm:w-8 sm:h-10 rounded-md bg-primary/10 border border-primary/30 text-primary font-bold text-sm sm:text-base">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Estratégia Federal (4 opções) */}
            <div className="grid grid-cols-2 gap-1.5">
              {federalStrategies.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFedStrategy(s.id)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border text-left transition-all",
                    fedStrategy === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/60"
                  )}
                >
                  <span className={cn("flex items-center gap-1.5 text-xs sm:text-sm font-semibold", s.color)}>
                    {s.icon} {s.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>

            {/* Quantidade */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Quantidade de bilhetes (1 a 10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="h-9 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={generatePicks}
                disabled={isGenerating || loadingHistory || !!historyError}
                className="w-full bg-gradient-to-r from-primary via-yellow-600 to-primary hover:from-primary/90 hover:to-primary/90 text-primary-foreground font-bold text-xs sm:text-sm h-10 sm:h-11 rounded-xl shadow-[0_4px_20px_hsl(var(--primary)/0.3)]"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                )}
                {freeGenerations > 0
                  ? `Gerar Bilhetes (${freeGenerations} restante${freeGenerations > 1 ? "s" : ""})`
                  : "Assistir Anúncio para Gerar"}
              </Button>
            </motion.div>

            {freeGenerations <= 0 && federalPicks.length > 0 && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                🎬 Assista um anúncio rápido para liberar mais 2 gerações gratuitas
              </p>
            )}

            <AnimatePresence>
              {federalPicks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 pt-2 border-t border-border"
                >
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Seus palpites:</p>
                  <div className="space-y-1.5">
                    {federalPicks.map((b, idx) => (
                      <motion.div
                        key={`${b}-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-primary/5 border border-emerald-500/30"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Ticket className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-mono font-bold text-base sm:text-lg tracking-wider text-foreground">{b}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyFederal(b, idx)}
                          className="h-7 px-2"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground italic text-center pt-1">
                    ⚠️ Palpites são apenas indicativos e não garantem prêmios.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {strategies.map((s) => (
                <motion.button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "p-2 sm:p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-0.5 sm:gap-1",
                    strategy === s.id
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                      : "border-border bg-secondary/30 hover:border-primary/50"
                  )}
                >
                  <motion.div
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5",
                      strategy === s.id ? "text-primary" : "text-muted-foreground"
                    )}
                    animate={strategy === s.id ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <span className={cn(
                      strategy === s.id && s.id === "hot" && "text-orange-500",
                      strategy === s.id && s.id === "cold" && "text-blue-400",
                      strategy === s.id && s.id === "balanced" && "text-emerald-400",
                    )}>
                      {s.icon}
                    </span>
                    <span className="font-medium text-xs sm:text-sm">{s.label}</span>
                  </motion.div>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block">{s.description}</span>
                </motion.button>
              ))}
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={generatePicks}
                className="w-full bg-gradient-to-r from-primary via-yellow-600 to-primary hover:from-primary/90 hover:to-primary/90 text-primary-foreground font-bold text-xs sm:text-sm h-10 sm:h-11 rounded-xl shadow-[0_4px_20px_hsl(var(--primary)/0.3)]"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                ) : (
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  </motion.span>
                )}
                {freeGenerations > 0
                  ? `Gerar Palpite (${freeGenerations} restante${freeGenerations > 1 ? "s" : ""})`
                  : "Assistir Anúncio para Gerar"}
              </Button>
            </motion.div>

            {freeGenerations <= 0 && picks.length > 0 && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                🎬 Assista um anúncio rápido para liberar mais 2 palpites gratuitos
              </p>
            )}

            <AnimatePresence>
              {picks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 sm:space-y-4"
                >
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center py-2 sm:py-4">
                    {picks.map((num, idx) => (
                      <motion.div
                        key={`${idx}-${num}`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.06, type: "spring", stiffness: 260, damping: 15 }}
                      >
                        <LotteryBall
                          number={num}
                          size={picks.length > 10 ? "xs" : "sm"}
                          variant={variantMap[lottery.color]}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={copyPicks}
                    variant="outline"
                    className="w-full border-primary/50 hover:bg-primary/10 text-xs sm:text-sm h-9 sm:h-10 rounded-xl"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Copiar Palpite
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                    ✨ Palpite baseado na estratégia "{strategies.find((s) => s.id === strategy)?.label}" usando dados dos últimos 100 sorteios
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <VideoAdModal open={showVideoAd} onComplete={handleAdComplete} />
      </CardContent>
    </Card>
  );
}

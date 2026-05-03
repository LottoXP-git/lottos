import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, Loader2, Copy, Check, Flame, Snowflake, Scale, Ticket, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Strategy = "hot" | "cold" | "balanced" | "random";

const STRATEGIES: { id: Strategy; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: "hot", label: "Quentes", icon: <Flame className="w-3.5 h-3.5" />, color: "text-orange-400", desc: "Dígitos mais sorteados por posição" },
  { id: "cold", label: "Frias", icon: <Snowflake className="w-3.5 h-3.5" />, color: "text-sky-400", desc: "Dígitos menos sorteados" },
  { id: "balanced", label: "Equilibrada", icon: <Scale className="w-3.5 h-3.5" />, color: "text-emerald-400", desc: "Probabilidade ponderada pela frequência" },
  { id: "random", label: "Aleatória", icon: <Dices className="w-3.5 h-3.5" />, color: "text-purple-400", desc: "Sorteio puramente aleatório" },
];

const TICKET_LEN = 6;
const HISTORY_SIZE = 50;

// freq[posicao 0..5][digit 0..9] = contagem
type DigitFreq = number[][];

function emptyFreq(): DigitFreq {
  return Array.from({ length: TICKET_LEN }, () => Array(10).fill(0));
}

function buildFrequency(tickets: string[]): DigitFreq {
  const freq = emptyFreq();
  for (const raw of tickets) {
    const t = String(raw).replace(/\D/g, "").padStart(TICKET_LEN, "0").slice(-TICKET_LEN);
    for (let i = 0; i < TICKET_LEN; i++) {
      const d = parseInt(t[i], 10);
      if (!isNaN(d)) freq[i][d]++;
    }
  }
  return freq;
}

function pickByStrategy(freq: DigitFreq, strategy: Strategy): string {
  let bilhete = "";
  for (let i = 0; i < TICKET_LEN; i++) {
    const counts = freq[i];
    const total = counts.reduce((a, b) => a + b, 0);
    let digit = 0;

    if (strategy === "random" || total === 0) {
      digit = Math.floor(Math.random() * 10);
    } else if (strategy === "hot") {
      // top 3 mais frequentes, escolha aleatória entre eles
      const ranked = counts
        .map((c, d) => ({ c, d }))
        .sort((a, b) => b.c - a.c)
        .slice(0, 3);
      digit = ranked[Math.floor(Math.random() * ranked.length)].d;
    } else if (strategy === "cold") {
      const ranked = counts
        .map((c, d) => ({ c, d }))
        .sort((a, b) => a.c - b.c)
        .slice(0, 3);
      digit = ranked[Math.floor(Math.random() * ranked.length)].d;
    } else {
      // balanced: roleta proporcional à frequência
      const r = Math.random() * total;
      let acc = 0;
      for (let d = 0; d < 10; d++) {
        acc += counts[d];
        if (r <= acc) { digit = d; break; }
      }
    }
    bilhete += String(digit);
  }
  return bilhete;
}

async function fetchFederalHistory(size: number): Promise<string[]> {
  const latestRes = await fetch("https://loteriascaixa-api.herokuapp.com/api/federal");
  if (!latestRes.ok) throw new Error("Falha ao buscar último concurso");
  const latestRaw = await latestRes.json();
  const latest = Array.isArray(latestRaw) ? latestRaw[0] : latestRaw;
  const lastConcurso: number = latest.concurso || latest.numero;
  if (!lastConcurso) throw new Error("Concurso atual não encontrado");

  const tickets: string[] = [];
  // O último já temos
  if (Array.isArray(latest.dezenas)) tickets.push(...latest.dezenas.map(String));

  // Busca os anteriores em paralelo
  const promises: Promise<string[]>[] = [];
  for (let i = 1; i < size; i++) {
    const c = lastConcurso - i;
    if (c <= 0) break;
    promises.push(
      fetch(`https://loteriascaixa-api.herokuapp.com/api/federal/${c}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return [];
          const obj = Array.isArray(d) ? d[0] : d;
          return Array.isArray(obj?.dezenas) ? obj.dezenas.map(String) : [];
        })
        .catch(() => [])
    );
  }
  const results = await Promise.all(promises);
  for (const arr of results) tickets.push(...arr);
  return tickets;
}

export function FederalPickGenerator() {
  const [history, setHistory] = useState<string[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [count, setCount] = useState("3");
  const [picks, setPicks] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

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

  useEffect(() => { loadHistory(); }, []);

  const freq = useMemo(() => (history ? buildFrequency(history) : emptyFreq()), [history]);

  const concursosAnalisados = useMemo(
    () => (history ? Math.ceil(history.length / 5) : 0),
    [history]
  );

  const hottestPerPosition = useMemo(() => {
    return freq.map((counts) => {
      const top = counts
        .map((c, d) => ({ c, d }))
        .sort((a, b) => b.c - a.c)[0];
      return top?.d ?? 0;
    });
  }, [freq]);

  const handleGenerate = () => {
    if (!history || history.length === 0) {
      toast.error("Histórico não carregado.");
      return;
    }
    const n = Math.min(10, Math.max(1, parseInt(count) || 1));
    const result: string[] = [];
    const seen = new Set<string>();
    let attempts = 0;
    while (result.length < n && attempts < n * 30) {
      const b = pickByStrategy(freq, strategy);
      if (!seen.has(b)) {
        seen.add(b);
        result.push(b);
      }
      attempts++;
    }
    setPicks(result);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#eab308", "#3b82f6"],
    });
    toast.success(`${result.length} bilhete${result.length > 1 ? "s" : ""} gerado${result.length > 1 ? "s" : ""}!`);
  };

  const handleCopy = async (bilhete: string, idx: number) => {
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
    <Card className="border-border bg-card overflow-hidden relative">
      <div className="absolute top-3 right-4 opacity-10 pointer-events-none">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <Ticket className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500" />
        </motion.div>
      </div>

      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 relative z-10">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]" />
          </motion.div>
          <span className="text-gradient font-bold">Palpites Federal</span>
          <Badge variant="outline" className="text-[10px] ml-auto">Histórico</Badge>
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          🎟️ Gere bilhetes de 6 dígitos baseados na frequência dos sorteios anteriores
        </p>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6 relative z-10">
        {/* Status histórico */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
          {loadingHistory ? (
            <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Carregando histórico...</span>
          ) : historyError ? (
            <span className="text-destructive">{historyError}</span>
          ) : (
            <span>Base: <strong className="text-foreground">{concursosAnalisados}</strong> concursos · <strong className="text-foreground">{history?.length ?? 0}</strong> bilhetes premiados</span>
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

        {/* Estratégia */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Estratégia</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={cn(
                  "flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border text-left transition-all",
                  strategy === s.id
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

        <Button
          onClick={handleGenerate}
          disabled={loadingHistory || !!historyError}
          className="w-full h-9 sm:h-10 text-xs sm:text-sm gap-1.5"
        >
          <Dices className="w-3.5 h-3.5" />
          Gerar bilhetes
        </Button>

        {/* Resultado */}
        {picks.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
            <p className="text-xs sm:text-sm font-semibold text-foreground">Seus palpites:</p>
            <div className="space-y-1.5">
              {picks.map((b, idx) => (
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
                    onClick={() => handleCopy(b, idx)}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
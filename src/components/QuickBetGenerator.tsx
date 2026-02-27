import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult } from "@/data/lotteryData";
import { Dices, RefreshCw, Copy, Check, Clover, Heart, CalendarDays } from "lucide-react";
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

interface QuickBetGeneratorProps {
  lotteries: LotteryResult[];
}

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

export function QuickBetGenerator({ lotteries }: QuickBetGeneratorProps) {
  const [selectedId, setSelectedId] = useState(lotteries[0]?.id || "");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [trevos, setTrevos] = useState<number[]>([]);
  const [timeCoracao, setTimeCoracao] = useState<string>("");
  const [mesSorte, setMesSorte] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [freeGenerations, setFreeGenerations] = useState(2);
  const [showVideoAd, setShowVideoAd] = useState(false);

  const selected = lotteries.find((l) => l.id === selectedId);

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
    setTimeout(() => {
      if (selected.id === "federal" || selected.id === "loteca") {
        toast.info(`Geração aleatória não disponível para ${selected.name}`);
        setIsSpinning(false);
        return;
      }
      const nums = generateRandomNumbers(selected.maxNumber, selected.selectCount);
      setNumbers(nums);

      // Special fields
      if (selected.id === "maismilionaria") {
        setTrevos(generateRandomNumbers(6, 2));
      }
      if (selected.id === "timemania") {
        setTimeCoracao(pickRandom(TIMES_TIMEMANIA));
      }
      if (selected.id === "diadesorte") {
        setMesSorte(pickRandom(MESES));
      }

      setIsSpinning(false);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
      });
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
            <div className="flex flex-wrap gap-2 justify-center py-4 px-2 rounded-xl bg-background/50 border border-border/50">
              {numbers.map((num, idx) =>
            <LotteryBall
              key={`${num}-${idx}`}
              number={num}
              size={numbers.length > 10 ? "sm" : "md"}
              variant={ballVariant}
              delay={idx * 80} />
            )}
            </div>

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
          </div>
        }

        <VideoAdModal open={showVideoAd} onComplete={handleAdComplete} />
      </CardContent>
    </Card>);

}
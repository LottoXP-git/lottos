import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult } from "@/data/lotteryData";
import { Dices, RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";

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

function generateRandomNumbers(max: number, count: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function QuickBetGenerator({ lotteries }: QuickBetGeneratorProps) {
  const [selectedId, setSelectedId] = useState(lotteries[0]?.id || "");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const selected = lotteries.find((l) => l.id === selectedId);

  const generate = () => {
    if (!selected) return;
    setIsSpinning(true);
    setNumbers([]);
    setTimeout(() => {
      // Federal and Loteca have special formats - skip random generation for them
      if (selected.id === "federal" || selected.id === "loteca") {
        toast.info(`Geração aleatória não disponível para ${selected.name}`);
        setIsSpinning(false);
        return;
      }
      const nums = generateRandomNumbers(selected.maxNumber, selected.selectCount);
      setNumbers(nums);
      setIsSpinning(false);
    }, 400);
  };

  const copyNumbers = () => {
    if (numbers.length === 0) return;
    const text = numbers.map((n) => n.toString().padStart(2, "0")).join(" - ");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Números copiados!");
    setTimeout(() => setCopied(false), 2000);
  };

  const ballVariant = selected ? variantMap[selected.color] as any : "default";

  return (
    <Card className="card-glass border-primary/30 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] relative overflow-hidden">
      {/* Decorative background glow */}
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
          Gerar Aposta
        </Button>

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
      </CardContent>
    </Card>);

}
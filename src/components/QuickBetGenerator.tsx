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
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Dices className="w-5 h-5 text-primary" />
          <span>Gerador de Palpites Inteligentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full">
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
          className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-primary-foreground font-bold"
          disabled={isSpinning || !selected || selected.id === "federal" || selected.id === "loteca"}>

          {isSpinning ?
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> :

          <Dices className="w-4 h-4 mr-2" />
          }
          Gerar Aposta
        </Button>

        {numbers.length > 0 &&
        <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap gap-2 justify-center py-3">
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
            size="sm"
            className="w-full border-primary/50 hover:bg-primary/10">

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
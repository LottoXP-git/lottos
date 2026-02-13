import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, NumberFrequency, generateSmartPicks } from "@/data/lotteryData";
import { Sparkles, Flame, Snowflake, Scale, RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SmartPickGeneratorProps {
  lottery: LotteryResult;
  frequencyData: NumberFrequency[];
}

type Strategy = 'hot' | 'cold' | 'balanced';

const strategies: { id: Strategy; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'hot', label: 'Quentes', icon: <Flame className="w-4 h-4" />, description: 'Dezenas mais sorteadas' },
  { id: 'cold', label: 'Frias', icon: <Snowflake className="w-4 h-4" />, description: 'Dezenas menos sorteadas' },
  { id: 'balanced', label: 'Equilibrado', icon: <Scale className="w-4 h-4" />, description: 'Mix de quentes e frias' },
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
  const [strategy, setStrategy] = useState<Strategy>('balanced');
  const [picks, setPicks] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePicks = () => {
    setIsGenerating(true);
    setPicks([]);
    
    setTimeout(() => {
      const newPicks = generateSmartPicks(frequencyData, lottery.selectCount, strategy);
      setPicks(newPicks);
      setIsGenerating(false);
    }, 500);
  };

  const copyPicks = () => {
    if (picks.length === 0) return;
    
    const text = picks.map(n => n.toString().padStart(2, '0')).join(' - ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Palpite copiado!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="card-glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Gerador de Palpites Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-1",
                strategy === s.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/30 hover:border-primary/50"
              )}
            >
              <div className={cn(
                "flex items-center gap-1.5",
                strategy === s.id ? "text-primary" : "text-muted-foreground"
              )}>
                {s.icon}
                <span className="font-medium text-sm">{s.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{s.description}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={generatePicks}
          className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-primary-foreground font-bold"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Gerar Palpite para {lottery.name}
        </Button>

        {picks.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-2 justify-center py-4">
              {picks.map((num, idx) => (
                <LotteryBall
                  key={`${idx}-${num}`}
                  number={num}
                  size={picks.length > 10 ? "sm" : "lg"}
                  variant={variantMap[lottery.color]}
                  delay={idx * 100}
                />
              ))}
            </div>

            <Button
              onClick={copyPicks}
              variant="outline"
              className="w-full border-primary/50 hover:bg-primary/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Palpite
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Palpite baseado na estratégia "{strategies.find(s => s.id === strategy)?.label}" usando dados dos últimos 100 sorteios
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

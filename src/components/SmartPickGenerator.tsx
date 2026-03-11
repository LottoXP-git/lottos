import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, NumberFrequency, generateSmartPicks } from "@/data/lotteryData";
import { Sparkles, Flame, Snowflake, Scale, RefreshCw, Copy, Check, Wand2, Dices, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    <Card className="card-glass border-primary/20 overflow-hidden relative">
      {/* Decorative floating icons */}
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
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
          </motion.div>
          <span className="text-gradient font-bold">Gerador de Palpites Inteligente</span>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-6 px-3 sm:px-6 pb-3 sm:pb-6 relative z-10">
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
                  strategy === s.id && s.id === 'hot' && "text-orange-500",
                  strategy === s.id && s.id === 'cold' && "text-blue-400",
                  strategy === s.id && s.id === 'balanced' && "text-emerald-400",
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
            Gerar Palpite para {lottery.name}
          </Button>
        </motion.div>

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
                ✨ Palpite baseado na estratégia "{strategies.find(s => s.id === strategy)?.label}" usando dados dos últimos 100 sorteios
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

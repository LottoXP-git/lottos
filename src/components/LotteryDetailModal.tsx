import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LotteryResult, NumberFrequency, generateFrequencyData } from "@/data/lotteryData";
import { FrequencyChart } from "./FrequencyChart";
import { StatisticsPanel } from "./StatisticsPanel";
import { SmartPickGenerator } from "./SmartPickGenerator";
import { DrawHistory } from "./DrawHistory";
import { LotteryBall } from "./LotteryBall";
import { PrizeEvolutionChart } from "./PrizeEvolutionChart";
import { BarChart3, Sparkles, History, Calendar, Clock, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface LotteryDetailModalProps {
  lottery: LotteryResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variantMap: Record<string, "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena"> = {
  "lottery-megasena": "megasena",
  "lottery-lotofacil": "lotofacil",
  "lottery-quina": "quina",
  "lottery-lotomania": "lotomania",
  "lottery-duplasena": "duplasena",
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
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {lottery.name}
            <span className="text-sm font-normal text-muted-foreground">
              Concurso {lottery.concurso}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Result */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Resultado de {lottery.date}</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {lottery.numbers.map((num, idx) => (
                <LotteryBall
                  key={num}
                  number={num}
                  size={lottery.numbers.length > 10 ? "sm" : "lg"}
                  variant={variantMap[lottery.color]}
                  delay={idx * 50}
                />
              ))}
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

import { useState } from "react";
import { Header } from "@/components/Header";
import { LotteryCard } from "@/components/LotteryCard";
import { LotteryDetailModal } from "@/components/LotteryDetailModal";
import { lotteryResults, LotteryResult } from "@/data/lotteryData";
import { Sparkles, TrendingUp, Trophy } from "lucide-react";

const Index = () => {
  const [selectedLottery, setSelectedLottery] = useState<LotteryResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (lottery: LotteryResult) => {
    setSelectedLottery(lottery);
    setModalOpen(true);
  };

  // Calculate total prize pool
  const totalPrize = lotteryResults.reduce((acc, lottery) => {
    const value = parseFloat(lottery.nextPrize.replace(/[R$\s.]/g, '').replace(',', '.'));
    return acc + value;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Resultados em tempo real</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Loterias </span>
            <span className="text-gradient">Caixa</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Acompanhe os resultados de todas as loterias, analise estatísticas de frequência 
            e gere palpites inteligentes baseados em dados históricos.
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-gradient">
                  R$ {(totalPrize / 1000000).toFixed(0)}M+
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Prêmios Acumulados</p>
            </div>
            
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold text-emerald-400">5</span>
              </div>
              <p className="text-xs text-muted-foreground">Loterias Disponíveis</p>
            </div>
            
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">100+</span>
              </div>
              <p className="text-xs text-muted-foreground">Sorteios Analisados</p>
            </div>
          </div>
        </section>

        {/* Lottery Results Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-foreground">Últimos</span>
            <span className="text-gradient">Resultados</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteryResults.map((lottery, idx) => (
              <div
                key={lottery.id}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <LotteryCard
                  result={lottery}
                  onClick={() => handleCardClick(lottery)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Clique em qualquer loteria para ver estatísticas detalhadas e gerar palpites inteligentes
          </p>
        </section>
      </main>

      <LotteryDetailModal
        lottery={selectedLottery}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Index;

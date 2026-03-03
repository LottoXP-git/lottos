import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotteryCard } from "@/components/LotteryCard";
import { LotteryDetailModal } from "@/components/LotteryDetailModal";
import { RegistrationForm } from "@/components/RegistrationForm";
import { QuickBetGenerator } from "@/components/QuickBetGenerator";
import { LotteryResult, lotteryResults as fallbackResults } from "@/data/lotteryData";
import { useLotteryResults } from "@/hooks/useLotteryResults";
import { usePrizeNotification } from "@/hooks/usePrizeNotification";
import { Sparkles, TrendingUp, Trophy, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { PrizeRanking } from "@/components/PrizeRanking";
import { AdBanner } from "@/components/AdBanner";
import { SpecialDrawModal } from "@/components/SpecialDrawModal";
import { isDuplaDePascoaActive } from "@/utils/easterDate";

const Index = () => {
  const [selectedLottery, setSelectedLottery] = useState<LotteryResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [specialDrawOpen, setSpecialDrawOpen] = useState(false);
  const [quickBetPreselect, setQuickBetPreselect] = useState<string | undefined>();

  const { data: lotteryResults, isLoading, error, refetch, isFetching } = useLotteryResults();

  // Use API data or fallback to static data
  const results = useMemo(() => {
    if (lotteryResults && lotteryResults.length > 0) {
      return lotteryResults;
    }
    return fallbackResults;
  }, [lotteryResults]);

  // Trigger sound notification for mega prizes (> R$ 50M)
  usePrizeNotification(results);

  const isLiveData = lotteryResults && lotteryResults.length > 0;

  const handleCardClick = (lottery: LotteryResult) => {
    setSelectedLottery(lottery);
    setModalOpen(true);
  };

  // Calculate total prize pool
  const totalPrize = results.reduce((acc, lottery) => {
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
             {isLiveData ?
            <>
                 <Wifi className="w-4 h-4 text-emerald-400" />
                 <span className="text-sm text-emerald-400 font-medium">Dados ao vivo da Caixa</span>
               </> :

            <>
                 <WifiOff className="w-4 h-4 text-muted-foreground" />
                 <span className="text-sm text-muted-foreground font-medium">Dados de exemplo</span>
               </>
            }
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-accent">Loterias </span>
            <span className="text-gradient text-accent">Caixa</span>
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
                <span className="text-2xl font-bold text-emerald-400">10</span>
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

        {/* Ad - Leaderboard */}
        <AdBanner format="leaderboard" className="mb-8 rounded-xl" />

        {/* Quick Bet Generator */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}>

          <div id="quick-bet-generator" className="max-w-lg mx-auto">
            <QuickBetGenerator lotteries={results} preselectedId={quickBetPreselect} />
          </div>
        </motion.section>

        {/* Special Draw Banner */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => setSpecialDrawOpen(true)}
            className="w-full group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-600/10 via-amber-500/10 to-violet-600/10 hover:from-rose-600/20 hover:via-amber-500/15 hover:to-violet-600/20 transition-all duration-300 p-4 sm:p-5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-amber-500/5 group-hover:opacity-100 opacity-0 transition-opacity" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Concurso Especial</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300 animate-pulse">AO VIVO</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Dupla de Páscoa</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Clique para ver detalhes e contagem regressiva</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground">Prêmio estimado</span>
                <div className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                  R$ 35 Milhões
                </div>
              </div>
            </div>
          </button>
        </motion.section>

        {/* Lottery Results Grid */}
        <section className="mb-12">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-accent">Últimos</span>
                <span className="text-gradient">Resultados</span>
              </h2>
              <div className="flex items-center gap-2">
                <ShareButton
                title="Resultados das Loterias Caixa"
                text={`🎰 Resultados das Loterias Caixa\n\n💰 Prêmios acumulados: R$ ${(totalPrize / 1000000).toFixed(0)}M+\n🎯 ${results.length} loterias disponíveis\n\nConfira os últimos resultados!`}
                variant="outline"
                size="sm"
                className="h-9 w-9" />

                <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2">

                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          
           {isLoading ?
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(5)].map((_, idx) =>
            <div key={idx} className="p-6 rounded-2xl border border-border bg-card">
                   <Skeleton className="h-6 w-32 mb-4" />
                   <Skeleton className="h-4 w-24 mb-4" />
                   <div className="flex gap-2 mb-4">
                     {[...Array(6)].map((_, i) =>
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
                )}
                   </div>
                   <Skeleton className="h-8 w-40" />
                 </div>
            )}
             </div> :
          error ?
          <div className="text-center py-8">
               <p className="text-destructive mb-4">Erro ao carregar resultados: {error.message}</p>
               <Button onClick={() => refetch()} variant="outline">
                 Tentar novamente
               </Button>
             </div> :

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((lottery, idx) =>
            <motion.div
              key={lottery.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}>

                    <LotteryCard
                result={lottery}
                onClick={() => handleCardClick(lottery)} />

                  </motion.div>
            )}
              </div>
          }
        </section>

        {/* Ad - Inline */}
        <AdBanner format="inline" className="mb-8" />

        {/* Prize Ranking */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}>

          <PrizeRanking lotteries={results} />
        </motion.section>

        {/* Ad - Interstitial */}
        <AdBanner format="interstitial" className="mb-8" />

        {/* Registration Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-accent">Receba </span>
                <span className="text-gradient">Novidades</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Cadastre-se para receber resultados, estatísticas e dicas exclusivas 
                diretamente no seu WhatsApp ou email. Fique por dentro dos maiores 
                prêmios e não perca nenhum sorteio!
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Resultados em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Análises estatísticas exclusivas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Dicas e palpites inteligentes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Alertas de prêmios acumulados
                </li>
              </ul>
            </div>
            <RegistrationForm />
          </div>
        </motion.section>

        {/* Instructions */}
        <section className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Clique em qualquer loteria para ver estatísticas detalhadas e gerar palpites inteligentes
          </p>
        </section>
      </main>

      <Footer />

      <LotteryDetailModal
        lottery={selectedLottery}
        open={modalOpen}
        onOpenChange={setModalOpen} />

      <SpecialDrawModal
        open={specialDrawOpen}
        onOpenChange={setSpecialDrawOpen}
        onGeneratePicks={() => {
          setSpecialDrawOpen(false);
          setQuickBetPreselect("duplasena");
          setTimeout(() => {
            document.getElementById("quick-bet-generator")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }}
      />

    </div>);

};

export default Index;
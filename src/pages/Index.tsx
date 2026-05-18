import { useState, useMemo, useEffect } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TesterEngagementOptIn } from "@/components/TesterEngagementOptIn";
import { LotteryCard } from "@/components/LotteryCard";
import { LotteryDetailModal } from "@/components/LotteryDetailModal";
import { RegistrationForm } from "@/components/RegistrationForm";
import { QuickBetGenerator } from "@/components/QuickBetGenerator";
import { LotteryResult, lotteryResults as fallbackResults } from "@/data/lotteryData";
import { useLotteryResults } from "@/hooks/useLotteryResults";
import { Sparkles, TrendingUp, Trophy, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ResultsSummaryModal } from "@/components/ResultsSummaryModal";
import { PrizeRanking } from "@/components/PrizeRanking";
import { PrizeChecker } from "@/components/PrizeChecker";
import { BetPricesCard } from "@/components/BetPricesCard";
import { AdBanner } from "@/components/AdBanner";
import { SpecialDrawModal } from "@/components/SpecialDrawModal";
import { isDuplaDePascoaActive } from "@/utils/easterDate";
import { MegaSena30Modal } from "@/components/MegaSena30Modal";
import { MegaSena30Banner } from "@/components/MegaSena30Banner";
import { isMegaSena30AnosActive, getMegaSena30Status, MegaSena30Status } from "@/utils/megaSena30Date";
import { useMegaSena30Notifications } from "@/hooks/useMegaSena30Notifications";
import { useMegaSena30Prize } from "@/hooks/useMegaSena30Prize";
import { useAdSenseScript } from "@/hooks/useAdSenseScript";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";
import { Helmet } from "react-helmet-async";

const Index = () => {
  useAdSenseScript();
  const [selectedLottery, setSelectedLottery] = useState<LotteryResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [specialDrawOpen, setSpecialDrawOpen] = useState(false);
  const [megaSena30Open, setMegaSena30Open] = useState(false);
  const [quickBetPreselect, setQuickBetPreselect] = useState<string | undefined>();
  const showDuplaDePascoa = isDuplaDePascoaActive();
  const showMegaSena30 = isMegaSena30AnosActive();

  // Live status for the Mega-Sena 30 Anos draw — updates every 30s.
  const [megaSena30Status, setMegaSena30Status] = useState<MegaSena30Status>(() => getMegaSena30Status());
  useEffect(() => {
    if (!showMegaSena30) return;
    const tick = () => setMegaSena30Status(getMegaSena30Status());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [showMegaSena30]);

  // Schedule local notifications (1 day before + live).
  useMegaSena30Notifications(showMegaSena30);

  // Track official estimated prize and toast on changes.
  const { prizeCompact: mega30PrizeCompact, prizeFull: mega30PrizeFull } = useMegaSena30Prize(showMegaSena30);

  const { data: lotteryResults, isLoading, error, refetch, isFetching } = useLotteryResults();

  // Use API data or fallback to static data
  const results = useMemo(() => {
    if (lotteryResults && lotteryResults.length > 0) {
      return lotteryResults;
    }
    return fallbackResults;
  }, [lotteryResults]);

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
      <Helmet>
        <title>Lottos - Resultados &amp; Estatísticas das Loterias</title>
        <meta name="description" content="Acompanhe resultados ao vivo, estatísticas e gere palpites inteligentes para todas as loterias da Caixa Econômica Federal." />
        <link rel="canonical" href="https://grupolottoxp.com/" />
        <meta property="og:title" content="Lottos - Resultados &amp; Estatísticas das Loterias" />
        <meta property="og:description" content="Acompanhe resultados ao vivo, estatísticas e gere palpites inteligentes para todas as loterias da Caixa." />
        <meta property="og:url" content="https://grupolottoxp.com/" />
      </Helmet>
      <JsonLd
        data={[
          buildBreadcrumb([{ name: "Início", url: `${SITE_URL}/` }]),
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Lottos",
            url: "https://grupolottoxp.com/",
            description:
              "Resultados, estatísticas e gerador de palpites para todas as loterias da Caixa Econômica Federal.",
            inLanguage: "pt-BR",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://grupolottoxp.com/historico?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Sobre as Loterias da Caixa",
            description:
              "Guia informativo sobre as loterias da Caixa Econômica Federal, suas modalidades e como o Lottos analisa resultados.",
            inLanguage: "pt-BR",
            mainEntityOfPage: "https://grupolottoxp.com/",
            author: { "@type": "Organization", name: "Lottos" },
            publisher: {
              "@type": "Organization",
              name: "Lottos",
              logo: {
                "@type": "ImageObject",
                url: "https://grupolottoxp.com/apple-touch-icon.png",
              },
            },
            image: "https://grupolottoxp.com/og-image.jpg",
            datePublished: "2025-01-01",
            dateModified: new Date().toISOString().slice(0, 10),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "O Lottos tem vínculo com a Caixa Econômica Federal?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Não. O Lottos é uma plataforma independente de informação e estatística sobre loterias e não possui vínculo institucional com a Caixa Econômica Federal.",
                },
              },
              {
                "@type": "Question",
                name: "Quais loterias o Lottos acompanha?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Acompanhamos Mega-Sena, Quina, Lotofácil, Lotomania, Dupla Sena, Timemania, Dia de Sorte, Super Sete, +Milionária, Loteca e Federal.",
                },
              },
              {
                "@type": "Question",
                name: "O gerador de palpites garante prêmios?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Não. Loterias são jogos de azar e os sorteios são independentes. O gerador é uma ferramenta estatística e educativa; nenhum método garante prêmios.",
                },
              },
              {
                "@type": "Question",
                name: "Quem pode usar o Lottos?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Apenas maiores de 18 anos. O acesso é bloqueado por verificação de idade conforme a legislação brasileira sobre jogos de azar.",
                },
              },
              {
                "@type": "Question",
                name: "Os resultados são oficiais?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Sim. Os resultados são obtidos diretamente da API pública das Loterias Caixa e atualizados em tempo real.",
                },
              },
            ],
          },
        ]}
      />
      <Header />
      
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <section className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-4">
             {isLiveData ?
            <>
                 <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                 <span className="text-xs text-emerald-400 font-medium">Dados ao vivo da Caixa</span>
               </> :

            <>
                 <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground font-medium">Dados de exemplo</span>
               </>
            }
          </div>
          
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
              <span className="text-gradient">Lottos</span>
              <span className="sr-only"> — Resultados e Estatísticas das Loterias Caixa</span>
            </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Acompanhe os resultados de todas as loterias em tempo real, analise estatísticas de frequência 
            e gere palpites inteligentes baseados em dados históricos. Aproveite também o nosso conferidor de apostas !
          </p>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
            <div className="p-2.5 sm:p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-lg sm:text-2xl font-bold text-gradient">
                  R$ {(totalPrize / 1000000).toFixed(0)}M+
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Prêmios Acumulados</p>
            </div>
            
            <div className="p-2.5 sm:p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span className="text-lg sm:text-2xl font-bold text-emerald-400">11</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Loterias Disponíveis</p>
            </div>
            
            <div className="p-2.5 sm:p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="text-lg sm:text-2xl font-bold text-purple-400">100+</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sorteios Analisados</p>
            </div>
          </div>
        </section>

        {/* Quick Bet Generator */}
        <section
          className="mb-8 sm:mb-12 animate-fade-in">

          <div id="quick-bet-generator" className="max-w-lg mx-auto px-1">
            <QuickBetGenerator lotteries={results} preselectedId={quickBetPreselect} />
          </div>
        </section>

        {/* Ad - Leaderboard (após gerador de palpites) */}
        <AdBanner format="leaderboard" slot="8331815579" className="mb-6 sm:mb-8 rounded-xl" />

        {/* Special Draw Banner */}
        {showDuplaDePascoa &&
        <section
          className="mb-8 animate-fade-in">
          
          <button
            onClick={() => setSpecialDrawOpen(true)}
            className="w-full group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-600/10 via-amber-500/10 to-violet-600/10 hover:from-rose-600/20 hover:via-amber-500/15 hover:to-violet-600/20 transition-all duration-300 p-4 sm:p-5">
            
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
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Dupla de Páscoa</h2>
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
        </section>
        }

        {showMegaSena30 &&
        <section className="mb-8 animate-fade-in">
          <MegaSena30Banner
            status={megaSena30Status}
            onClick={() => setMegaSena30Open(true)}
            prizeCompact={mega30PrizeCompact}
          />
        </section>
        }

        {/* Lottery Results Grid */}
        <section className="mb-8 sm:mb-12">
           <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-3">
                <span className="text-accent">Últimos</span>
                <span className="text-gradient">Resultados</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <ResultsSummaryModal lotteries={results} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {results.map((lottery, idx) =>
            <div
              key={lottery.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}>

                    <LotteryCard
                result={lottery}
                onClick={() => handleCardClick(lottery)} />

                  </div>
            )}
              </div>
          }
        </section>

        {/* Ad - Inline */}
        <AdBanner format="inline" className="mb-8" />

        {/* Prize Ranking */}
        <section
          className="mb-12 animate-fade-in">

          <PrizeRanking lotteries={results} />
        </section>

        {/* Registration Section */}
        <section
          className="mb-12 animate-fade-in">

           <div className="max-w-xl mx-auto">
            <RegistrationForm />
          </div>
        </section>

        {/* Prize Checker */}
        <section
          className="mb-8 sm:mb-12 animate-fade-in">
          <div className="max-w-lg mx-auto px-1">
            <PrizeChecker />
          </div>
        </section>

        {/* Bet Prices Table */}
        <section className="mb-8 sm:mb-12 animate-fade-in">
          <div className="max-w-lg mx-auto px-1">
            <BetPricesCard />
          </div>
        </section>

        {/* Editorial: Sobre as Loterias da Caixa */}
        <section className="mb-8 sm:mb-12 animate-fade-in">
          <div className="max-w-3xl mx-auto px-1">
            <article className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Sobre as Loterias da Caixa</h2>
              <p>
                As Loterias Caixa são administradas pela Caixa Econômica Federal e fazem parte da história do Brasil há
                décadas. Modalidades como Mega-Sena, Quina, Lotofácil, Lotomania, Dupla Sena, Timemania, Dia de Sorte,
                Super Sete, +Milionária, Loteca e Federal sorteiam prêmios milionários semanalmente, e parte significativa
                da arrecadação é destinada à seguridade social, esporte, cultura, segurança pública e financiamento
                estudantil — convertendo cada aposta em recursos para programas sociais.
              </p>
              <p>
                O Lottos é uma plataforma independente de informação e estatística. Reunimos resultados oficiais
                atualizados em tempo real, histórico de concursos, frequência de números (quentes e frios), atrasos,
                rankings de prêmios acumulados e ferramentas educativas como gerador de palpites e conferidor de apostas.
                Nosso objetivo é ajudar o apostador a tomar decisões mais informadas, entender padrões estatísticos e
                acompanhar de perto o que acontece em cada modalidade.
              </p>
              <p>
                <strong className="text-foreground">Importante:</strong> nenhum método garante prêmios em jogos de azar.
                Loterias são produtos de sorte e os sorteios são independentes entre si. As análises do Lottos têm caráter
                estritamente informativo e não substituem o site oficial da Caixa Econômica Federal, com quem não
                possuímos vínculo institucional.
              </p>
              <p>
                O acesso ao Lottos é restrito a maiores de 18 anos. Jogue com responsabilidade: defina um orçamento, nunca
                aposte mais do que pode perder e procure ajuda especializada se sentir que o jogo está prejudicando sua
                vida financeira ou pessoal.
              </p>
            </article>
          </div>
        </section>

        {/* Instructions */}
        <section className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Clique em qualquer loteria para ver estatísticas detalhadas e gerar palpites inteligentes
          </p>
        </section>
      </main>

      <TesterEngagementOptIn />
      <Footer />

      <LotteryDetailModal
        lottery={selectedLottery}
        open={modalOpen}
        onOpenChange={setModalOpen} />

      {showDuplaDePascoa &&
      <SpecialDrawModal
        open={specialDrawOpen}
        onOpenChange={setSpecialDrawOpen}
        onGeneratePicks={() => {
          setSpecialDrawOpen(false);
          setQuickBetPreselect("duplasena");
          setTimeout(() => {
            document.getElementById("quick-bet-generator")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }} />

      }

      {showMegaSena30 &&
      <MegaSena30Modal
        open={megaSena30Open}
        onOpenChange={setMegaSena30Open}
        prizeCompact={mega30PrizeCompact}
        prizeFull={mega30PrizeFull}
        onGeneratePicks={() => {
          setMegaSena30Open(false);
          setQuickBetPreselect("megasena");
          setTimeout(() => {
            document.getElementById("quick-bet-generator")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
        }} />
      }

    </div>);

};

export default Index;
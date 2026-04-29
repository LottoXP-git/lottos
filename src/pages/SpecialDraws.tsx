import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Flame, Calendar, Gift, Trophy, Star, Clover, Heart, CalendarDays, Dribbble } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdSenseScript } from "@/hooks/useAdSenseScript";
import { AdBanner } from "@/components/AdBanner";

interface SpecialDrawRule {
  id: string;
  name: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeClass: string;
  bannerClass: string;
  description: string;
  rules: string[];
  examples: string[];
  prize: string;
}

const specialDrawRules: SpecialDrawRule[] = [
  {
    id: "megasena",
    name: "Mega-Sena",
    icon: <Star className="w-5 h-5" />,
    colorClass: "border-emerald-500/30",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    bannerClass: "from-emerald-600 to-emerald-400",
    description:
      "A Mega-Sena realiza concursos especiais nos sorteios cujo número termina em 0 ou 5, incluindo a famosa Mega da Virada no último concurso do ano.",
    rules: [
      "Concursos com final 0 ou 5 são considerados especiais",
      "A Mega da Virada ocorre no último sorteio do ano (31 de dezembro)",
      "O prêmio da Mega da Virada não acumula — é dividido entre os acertadores ou rateado nas faixas inferiores",
      "Concursos especiais intermediários costumam ter premiações maiores que os comuns",
    ],
    examples: [
      "Concurso 2.800 → Especial (final 0)",
      "Concurso 2.795 → Especial (final 5)",
      "Concurso 2.810 → Especial (final 0)",
    ],
    prize: "Prêmios frequentemente acima de R$ 100 milhões na Mega da Virada",
  },
  {
    id: "lotofacil",
    name: "Lotofácil",
    icon: <Sparkles className="w-5 h-5" />,
    colorClass: "border-purple-500/30",
    badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bannerClass: "from-purple-600 to-purple-400",
    description:
      "A Lotofácil promove concursos especiais quando o número do sorteio termina em 0, oferecendo premiações diferenciadas e maior visibilidade.",
    rules: [
      "Concursos com final 0 são considerados especiais",
      "Esses concursos costumam ter acúmulo intencional ou premiações especiais",
      "A Lotofácil da Independência ocorre em setembro, próxima ao dia 7",
      "O prêmio da Lotofácil da Independência não acumula",
    ],
    examples: [
      "Concurso 3.250 → Especial (final 0)",
      "Concurso 3.260 → Especial (final 0)",
      "Concurso 3.270 → Especial (final 0)",
    ],
    prize: "Lotofácil da Independência costuma ultrapassar R$ 200 milhões",
  },
  {
    id: "quina",
    name: "Quina",
    icon: <Trophy className="w-5 h-5" />,
    colorClass: "border-blue-500/30",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bannerClass: "from-blue-600 to-blue-400",
    description:
      "A Quina realiza concursos especiais quando o número do sorteio termina em 5, incluindo a tradicional Quina de São João no mês de junho.",
    rules: [
      "Concursos com final 5 são considerados especiais",
      "A Quina de São João acontece no dia 24 de junho",
      "O prêmio da Quina de São João não acumula",
      "É o segundo maior concurso especial das loterias Caixa",
    ],
    examples: [
      "Concurso 6.575 → Especial (final 5)",
      "Concurso 6.565 → Especial (final 5)",
      "Concurso 6.555 → Especial (final 5)",
    ],
    prize: "Quina de São João frequentemente supera R$ 200 milhões",
  },
  {
    id: "duplasena",
    name: "Dupla Sena",
    icon: <Gift className="w-5 h-5" />,
    colorClass: "border-rose-500/30",
    badgeClass: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    bannerClass: "from-rose-600 to-rose-400",
    description:
      "A Dupla Sena possui um concurso especial anual chamado Dupla de Páscoa, realizado próximo à data da Páscoa cristã.",
    rules: [
      "A Dupla de Páscoa ocorre na semana que antecede o Domingo de Páscoa",
      "O prêmio da Dupla de Páscoa não acumula",
      "A data varia a cada ano, pois a Páscoa segue o calendário lunar",
      "Funciona com dois sorteios independentes, como a Dupla Sena comum",
    ],
    examples: [
      "2025: Páscoa em 20 de abril → Dupla de Páscoa na semana anterior",
      "2026: Páscoa em 5 de abril → Dupla de Páscoa na semana anterior",
    ],
    prize: "Prêmios estimados acima de R$ 30 milhões",
  },
  {
    id: "timemania",
    name: "Timemania",
    icon: <Heart className="w-5 h-5" />,
    colorClass: "border-green-500/30",
    badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
    bannerClass: "from-green-600 to-green-400",
    description:
      "A Timemania não possui concursos especiais recorrentes, mas contribui com parte da arrecadação para clubes de futebol brasileiros.",
    rules: [
      "Não possui regra fixa de concursos especiais por final de número",
      "Cada aposta inclui a escolha de um Time do Coração",
      "O acertador do Time do Coração recebe premiação mesmo sem acertar números",
      "Eventualmente pode participar de promoções especiais da Caixa",
    ],
    examples: [],
    prize: "Prêmios acumulados podem ultrapassar R$ 15 milhões",
  },
  {
    id: "diadesorte",
    name: "Dia de Sorte",
    icon: <CalendarDays className="w-5 h-5" />,
    colorClass: "border-amber-500/30",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bannerClass: "from-amber-600 to-amber-400",
    description:
      "O Dia de Sorte não possui concursos especiais recorrentes baseados no número do concurso, mas inclui o sorteio de um Mês da Sorte em cada concurso.",
    rules: [
      "Não possui regra fixa de concursos especiais",
      "Todo concurso inclui o sorteio de um Mês da Sorte",
      "O Mês da Sorte premiado garante acerto adicional ao apostador",
      "Pode participar de promoções especiais sazonais",
    ],
    examples: [],
    prize: "Prêmios acumulados podem chegar a R$ 5 milhões",
  },
  {
    id: "maismilionaria",
    name: "+Milionária",
    icon: <Clover className="w-5 h-5" />,
    colorClass: "border-indigo-500/30",
    badgeClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    bannerClass: "from-indigo-600 to-indigo-400",
    description:
      "A +Milionária é a loteria com os maiores prêmios do Brasil. Embora não possua concursos especiais definidos por número, seus prêmios frequentemente superam centenas de milhões.",
    rules: [
      "Não possui regra fixa de concursos especiais",
      "Inclui o sorteio de Trevos além das dezenas",
      "Os prêmios acumulam com mais frequência devido à dificuldade",
      "Prêmio mínimo garantido de R$ 10 milhões",
    ],
    examples: [],
    prize: "Prêmios frequentemente acima de R$ 200 milhões",
  },
  {
    id: "loteca",
    name: "Loteca",
    icon: <Dribbble className="w-5 h-5" />,
    colorClass: "border-red-500/30",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    bannerClass: "from-red-600 to-red-400",
    description:
      "A Loteca é baseada em jogos de futebol e não possui concursos especiais recorrentes. O apostador deve acertar os resultados de 14 partidas.",
    rules: [
      "Não possui regra fixa de concursos especiais",
      "Os 14 jogos são selecionados pela Caixa a cada rodada",
      "O resultado pode ser Coluna 1 (mandante vence), Empate ou Coluna 2 (visitante vence)",
      "Acumulações frequentes tornam os prêmios atrativos",
    ],
    examples: [],
    prize: "Prêmios acumulados podem ultrapassar R$ 3 milhões",
  },
];

export default function SpecialDraws() {
  useAdSenseScript();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Guia Completo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Concursos Especiais
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça as regras e datas dos concursos especiais de cada modalidade das Loterias Caixa.
            Esses sorteios oferecem premiações diferenciadas e são os mais esperados do ano.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-muted-foreground">Concurso Especial</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <Flame className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Prêmio Acumulado</span>
          </div>
        </div>

        {/* Ad - leaderboard antes do grid de cards */}
        <AdBanner format="leaderboard" slot="8331815579" className="rounded-xl" />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialDrawRules.map((rule) => (
            <Card
              key={rule.id}
              className={cn(
                "card-glass border-2 transition-all duration-300 hover:shadow-lg overflow-hidden",
                rule.colorClass
              )}
            >
              {/* Banner */}
              <div
                className={cn(
                  "bg-gradient-to-r py-3 px-4 flex items-center gap-3",
                  rule.bannerClass
                )}
              >
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  {rule.icon}
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">{rule.name}</h2>
                  <p className="text-white/80 text-xs">{rule.prize}</p>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {rule.description}
                </p>

                {/* Rules */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Regras
                  </h3>
                  <ul className="space-y-1.5">
                    {rule.rules.map((r, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Examples */}
                {rule.examples.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      Exemplos
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.examples.map((ex, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={cn("text-[10px] font-mono", rule.badgeClass)}
                        >
                          {ex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

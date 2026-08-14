import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotteryBall } from "@/components/LotteryBall";
import { JsonLd } from "@/components/JsonLd";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLotteryHistory } from "@/hooks/useLotteryResults";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";
import { ArrowLeft, Flame, Snowflake, Trophy, Calculator, ListChecks, HelpCircle } from "lucide-react";

type Variant =
  | "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena"
  | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";

interface ModalityCopy {
  name: string;
  variant: Variant;
  maxNumber: number;
  selectCount: number;
  /** P(prêmio principal) já em formato "1 em X" */
  oddsMain: string;
  /** Preço da aposta mínima em reais */
  minBetPrice: string;
  /** Frase chave que casa com o título da página */
  intro: string;
  faqs: { q: string; a: string }[];
}

const MODALITIES: Record<string, ModalityCopy> = {
  lotofacil: {
    name: "Lotofácil",
    variant: "lotofacil",
    maxNumber: 25,
    selectCount: 15,
    oddsMain: "1 em 3.268.760",
    minBetPrice: "R$ 3,50",
    intro:
      "A Lotofácil é a loteria mais acessível da Caixa: você marca 15 dezenas entre 25 e leva prêmio acertando 11, 12, 13, 14 ou 15 números. Por isso é a queridinha de quem quer ganhar com mais frequência.",
    faqs: [
      {
        q: "Quais os números mais sorteados da Lotofácil?",
        a: "Historicamente as dezenas que mais aparecem ficam entre 10, 13, 20 e 25, mas a lista muda a cada concurso. Confira a frequência atualizada nas estatísticas abaixo.",
      },
      {
        q: "O que é fechamento na Lotofácil?",
        a: "Fechamento é uma técnica que distribui de 16 a 20 dezenas em várias apostas para garantir o acerto de uma faixa de prêmio (ex.: garantir 13 pontos se acertar 14). Use bolões para diluir o custo.",
      },
      {
        q: "Qual a melhor estratégia para a Lotofácil?",
        a: "Combine dezenas quentes (mais sorteadas) com algumas frias, equilibre pares e ímpares (em geral 7/8 ou 8/7) e distribua entre as 5 colunas e 5 linhas do volante. Evite sequências longas.",
      },
      {
        q: "Quanto custa apostar mais dezenas?",
        a: "16 dezenas = R$ 56, 17 dezenas = R$ 280, 18 dezenas = R$ 1.120, 19 dezenas = R$ 3.920 e 20 dezenas = R$ 11.760. O preço cresce de forma combinatória.",
      },
    ],
  },
  megasena: {
    name: "Mega-Sena",
    variant: "megasena",
    maxNumber: 60,
    selectCount: 6,
    oddsMain: "1 em 50.063.860",
    minBetPrice: "R$ 5,00",
    intro:
      "A Mega-Sena é a loteria mais famosa do Brasil. Você marca 6 dezenas entre 60 e disputa o prêmio principal acertando todas. Quadra (4 acertos) e quina (5) também pagam.",
    faqs: [
      {
        q: "Qual a probabilidade de ganhar na Mega-Sena?",
        a: "Com 6 dezenas, a chance de acertar a sena é de 1 em 50.063.860. Apostando 7 dezenas (R$ 35), a chance sobe para 1 em 7.151.980.",
      },
      {
        q: "Quais os números mais sorteados da Mega-Sena?",
        a: "Dezenas como 10, 53, 5, 23, 33 e 4 lideram o ranking histórico. Veja a frequência completa, atualizada a cada sorteio, na seção de estatísticas.",
      },
      {
        q: "Como funciona o bolão da Mega-Sena?",
        a: "Um bolão divide o custo de uma aposta com mais dezenas entre vários participantes. A casa lotérica cobra uma comissão de até 35% sobre cada cota.",
      },
      {
        q: "Vale mais a pena jogar 6 ou 7 dezenas?",
        a: "Estatisticamente, jogar 7 dezenas multiplica por 7 a chance de prêmio principal pagando 7x o valor de uma aposta simples. A relação custo/benefício é a mesma — mas você cobre mais combinações.",
      },
    ],
  },
  quina: {
    name: "Quina",
    variant: "quina",
    maxNumber: 80,
    selectCount: 5,
    oddsMain: "1 em 24.040.016",
    minBetPrice: "R$ 2,50",
    intro:
      "A Quina sorteia 5 dezenas entre 80 todos os dias (segunda a sábado). Premia a partir de 2 acertos (duque) — uma das loterias com mais faixas de prêmio.",
    faqs: [
      {
        q: "Quais os números mais sorteados da Quina?",
        a: "Os números 51, 4, 53, 5 e 17 estão entre os mais frequentes. A lista atualizada está na seção de estatísticas.",
      },
      {
        q: "Quanto paga a duque da Quina?",
        a: "A duque (2 acertos) costuma pagar entre R$ 2 e R$ 5. O valor varia conforme arrecadação e número de ganhadores.",
      },
      {
        q: "Qual estratégia funciona na Quina?",
        a: "Misture dezenas das 8 dezenas (1-10, 11-20, etc.) e evite agrupar 5 números em um só bloco. Inclua 2-3 dezenas quentes recentes.",
      },
    ],
  },
  lotomania: {
    name: "Lotomania", variant: "lotomania", maxNumber: 100, selectCount: 50,
    oddsMain: "1 em 11.372.635", minBetPrice: "R$ 3,00",
    intro: "Você marca 50 dezenas de 0 a 99 e ganha acertando 20, 19, 18, 17, 16 ou… nenhuma. Sim: zero acertos paga prêmio.",
    faqs: [
      { q: "Como ganhar na Lotomania acertando zero?", a: "Marque 50 dezenas que historicamente caem MENOS — as 'dezenas frias'. Essa é a única loteria em que apostar nas frias é estatisticamente vantajoso." },
      { q: "Qual a probabilidade de acertar 20 na Lotomania?", a: "1 em 11.372.635 — uma das melhores chances entre as loterias federais para o prêmio principal." },
    ],
  },
  duplasena: {
    name: "Dupla Sena", variant: "duplasena", maxNumber: 50, selectCount: 6,
    oddsMain: "1 em 15.890.700", minBetPrice: "R$ 3,00",
    intro: "Dois sorteios em um só concurso. Você marca 6 dezenas entre 50 e concorre duas vezes ao prêmio principal.",
    faqs: [
      { q: "Como funciona a Dupla Sena?", a: "Cada concurso tem dois sorteios independentes. Sua aposta vale para os dois — duplicando as chances de premiação." },
      { q: "Qual a melhor estratégia para Dupla Sena?", a: "Como há dois sorteios, equilibre dezenas pares/ímpares e distribua entre dezenas baixas (1-25) e altas (26-50)." },
    ],
  },
  diadesorte: {
    name: "Dia de Sorte", variant: "diadesorte", maxNumber: 31, selectCount: 7,
    oddsMain: "1 em 2.629.575", minBetPrice: "R$ 2,50",
    intro: "Marque 7 dezenas entre 31 e escolha um Mês da Sorte. Acertando os 7 números você fatura o prêmio principal.",
    faqs: [
      { q: "Como escolher o Mês da Sorte?", a: "O mês não influencia o prêmio principal — só vale para a faixa especial. Escolha o de aniversário ou um aleatório." },
    ],
  },
  supersete: {
    name: "Super Sete", variant: "supersete", maxNumber: 9, selectCount: 7,
    oddsMain: "1 em 10.000.000", minBetPrice: "R$ 2,50",
    intro: "Marque um número de 0 a 9 em cada uma das 7 colunas. É possível marcar até 3 números por coluna.",
    faqs: [
      { q: "Qual estratégia para a Super Sete?", a: "Marcar 2 números em algumas colunas dobra a chance ao custo de R$ 5. Equilibre números altos e baixos." },
    ],
  },
  maismilionaria: {
    name: "+Milionária", variant: "maismilionaria", maxNumber: 50, selectCount: 6,
    oddsMain: "1 em 238.360.500", minBetPrice: "R$ 6,00",
    intro: "Marque 6 dezenas entre 50 e 2 trevos entre 6. Prêmio mínimo garantido de R$ 10 milhões.",
    faqs: [
      { q: "Como funcionam os trevos da +Milionária?", a: "Os 2 trevos são sorteados separadamente. É preciso acertar dezenas E trevos para o prêmio principal." },
    ],
  },
  timemania: {
    name: "Timemania", variant: "timemania", maxNumber: 80, selectCount: 10,
    oddsMain: "1 em 26.472.637", minBetPrice: "R$ 3,50",
    intro: "Marque 10 dezenas entre 80 e escolha seu Time do Coração. Acertando 7 dezenas, leva o prêmio principal.",
    faqs: [
      { q: "Como funciona o Time do Coração?", a: "Acertar apenas o Time do Coração paga R$ 7,50. É uma faixa de prêmio extra além das 10 dezenas." },
    ],
  },
  federal: {
    name: "Loteria Federal", variant: "federal", maxNumber: 99999, selectCount: 5,
    oddsMain: "1 em 100.000", minBetPrice: "R$ 5,00",
    intro: "Cada bilhete tem um número de 5 dígitos. São 5 prêmios principais por concurso, mais milhares de prêmios menores.",
    faqs: [
      { q: "Como escolher um bilhete da Federal?", a: "Você compra um bilhete físico ou online com número pré-definido. Não há aposta — escolha o número que combinar com você." },
    ],
  },
  loteca: {
    name: "Loteca", variant: "loteca", maxNumber: 14, selectCount: 14,
    oddsMain: "1 em 4.782.969", minBetPrice: "R$ 3,00",
    intro: "Acerte o resultado (Coluna 1, Coluna do Meio ou Coluna 2) de 14 jogos de futebol. Prêmio também por 13 acertos.",
    faqs: [
      { q: "Como aumentar as chances na Loteca?", a: "Marcar duplas ou triplas em jogos incertos multiplica as combinações. Estude estatísticas dos times e mando de campo." },
    ],
  },
};

/** Compute hot/cold from real history. */
function computeFrequency(numbers: number[][], maxNumber: number) {
  const counts = new Map<number, number>();
  for (const draw of numbers) for (const n of draw) counts.set(n, (counts.get(n) ?? 0) + 1);
  const all = Array.from({ length: maxNumber }, (_, i) => ({
    n: i + 1,
    f: counts.get(i + 1) ?? 0,
  })).sort((a, b) => b.f - a.f);
  return { hot: all.slice(0, 8), cold: all.slice(-8).reverse() };
}

export default function HowToWin() {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const meta = lotteryId ? MODALITIES[lotteryId] : undefined;

  if (!lotteryId || !meta) return <Navigate to="/404" replace />;

  const { data: history, isLoading } = useLotteryHistory(lotteryId, 100);

  const stats = useMemo(() => {
    if (!history?.length || meta.maxNumber > 100) return null;
    return computeFrequency(history.map((d) => d.numbers), meta.maxNumber);
  }, [history, meta.maxNumber]);

  const latest = history?.[0];
  const pageUrl = `${SITE_URL}/como-ganhar/${lotteryId}`;
  const title = `Como ganhar na ${meta.name}: dicas e estatísticas`;
  const headline = `Como ganhar na ${meta.name}: estratégias, dicas e números mais sorteados`;
  const description = `Guia completo de como ganhar na ${meta.name}: probabilidade, dezenas mais sorteadas, fechamento, bolão e estratégias atualizadas a partir dos últimos 100 concursos.`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Lottos" />
        <meta property="og:locale" content="pt_BR" />
      </Helmet>

      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Início", url: `${SITE_URL}/` },
            { name: meta.name, url: `${SITE_URL}/?loteria=${lotteryId}` },
            { name: `Como ganhar na ${meta.name}`, url: pageUrl },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline,
            description,
            inLanguage: "pt-BR",
            mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
            url: pageUrl,
            datePublished: "2025-01-01",
            dateModified: new Date().toISOString().slice(0, 10),
            author: { "@type": "Organization", name: "Lottos" },
            publisher: {
              "@type": "Organization",
              name: "Lottos",
              url: SITE_URL,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-touch-icon.png` },
            },
            about: { "@type": "Thing", name: `Estratégias para ganhar na ${meta.name}` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: meta.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </Link>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Guia {meta.name}</p>
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-3">
            Como ganhar na <span className="text-primary">{meta.name}</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{meta.intro}</p>
        </header>

        <article className="space-y-8">
          {/* Quick facts */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-[10px] uppercase text-muted-foreground">Dezenas</p>
              <p className="text-sm sm:text-base font-bold">{meta.selectCount} de {meta.maxNumber}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-[10px] uppercase text-muted-foreground">Probabilidade</p>
              <p className="text-sm sm:text-base font-bold text-primary">{meta.oddsMain}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-[10px] uppercase text-muted-foreground">Aposta mínima</p>
              <p className="text-sm sm:text-base font-bold">{meta.minBetPrice}</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-[10px] uppercase text-muted-foreground">Último concurso</p>
              {latest ? (
                <Link to={`/${lotteryId}/${latest.concurso}`} className="text-sm sm:text-base font-bold text-primary underline underline-offset-2">
                  #{latest.concurso}
                </Link>
              ) : (
                <p className="text-sm font-bold text-muted-foreground">—</p>
              )}
            </div>
          </section>

          {/* Hot/Cold numbers */}
          {stats && (
            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Números mais sorteados da {meta.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Frequência calculada com base nos últimos {history!.length} concursos sorteados.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3 text-orange-500">
                    <Flame className="w-4 h-4" /> Dezenas quentes (top 8)
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {stats.hot.map((x) => (
                      <div key={x.n} className="flex flex-col items-center gap-0.5">
                        <LotteryBall number={x.n} size="sm" variant={meta.variant} />
                        <span className="text-[10px] text-muted-foreground">{x.f}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3 text-blue-500">
                    <Snowflake className="w-4 h-4" /> Dezenas frias (menos sorteadas)
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {stats.cold.map((x) => (
                      <div key={x.n} className="flex flex-col items-center gap-0.5">
                        <LotteryBall number={x.n} size="sm" variant={meta.variant} />
                        <span className="text-[10px] text-muted-foreground">{x.f}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {isLoading && <Skeleton className="h-48 w-full rounded-xl" />}

          {/* Strategy */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Estratégias para apostar na {meta.name}
            </h2>
            <ul className="space-y-3 text-sm sm:text-base">
              <li className="p-3 rounded-lg bg-secondary/30 border border-border">
                <strong className="text-primary">1. Combine quentes e frias.</strong> Dezenas quentes têm momentum recente; frias podem estar "atrasadas". Misturar reduz vieses.
              </li>
              <li className="p-3 rounded-lg bg-secondary/30 border border-border">
                <strong className="text-primary">2. Equilibre pares e ímpares.</strong> Padrões 50/50 são mais frequentes do que apostas só pares ou só ímpares.
              </li>
              <li className="p-3 rounded-lg bg-secondary/30 border border-border">
                <strong className="text-primary">3. Distribua no volante.</strong> Espalhe as dezenas entre as colunas e linhas — evite agrupar tudo em um canto.
              </li>
              <li className="p-3 rounded-lg bg-secondary/30 border border-border">
                <strong className="text-primary">4. Faça bolão.</strong> Aposte mais dezenas dividindo o custo. Aumenta as chances sem pesar no bolso.
              </li>
              <li className="p-3 rounded-lg bg-secondary/30 border border-border">
                <strong className="text-primary">5. Não persiga concursos passados.</strong> Cada sorteio é independente — o que caiu ontem não influencia hoje.
              </li>
            </ul>
          </section>

          {/* Tools CTA */}
          <section className="p-4 sm:p-6 rounded-xl bg-primary/5 border border-primary/20">
            <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Ferramentas grátis para sua aposta
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Use os geradores do Lottos para criar palpites baseados em estatísticas reais.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/">Gerador inteligente</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/estatisticas">Estatísticas completas</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/historico">Histórico de resultados</Link>
              </Button>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Perguntas frequentes sobre a {meta.name}
            </h2>
            <div className="space-y-3">
              {meta.faqs.map((f, i) => (
                <details key={i} className="p-3 rounded-lg bg-secondary/30 border border-border group">
                  <summary className="text-sm sm:text-base font-semibold cursor-pointer">{f.q}</summary>
                  <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Internal links to other guides */}
          <section className="pt-4 border-t border-border">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Guias de outras loterias
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MODALITIES)
                .filter(([id]) => id !== lotteryId)
                .map(([id, m]) => (
                  <Link
                    key={id}
                    to={`/como-ganhar/${id}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    Como ganhar na {m.name}
                  </Link>
                ))}
            </div>
          </section>

          <section className="text-xs text-muted-foreground border-t border-border pt-4">
            <p>
              Este App não possui vínculo oficial com a Caixa Econômica Federal. Conteúdo informativo
              baseado em dados públicos da Caixa. Aposte com responsabilidade — proibido para menores de 18 anos.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotteryBall } from "@/components/LotteryBall";
import { JsonLd } from "@/components/JsonLd";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLotteryDraw } from "@/hooks/useLotteryResults";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";
import { Calendar, Trophy, MapPin, ArrowLeft, Clover, Heart, CalendarDays, Flame, TrendingUp } from "lucide-react";

const LOTTERY_META: Record<
  string,
  { name: string; variant: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca" }
> = {
  megasena: { name: "Mega-Sena", variant: "megasena" },
  lotofacil: { name: "Lotofácil", variant: "lotofacil" },
  quina: { name: "Quina", variant: "quina" },
  lotomania: { name: "Lotomania", variant: "lotomania" },
  duplasena: { name: "Dupla Sena", variant: "duplasena" },
  diadesorte: { name: "Dia de Sorte", variant: "diadesorte" },
  supersete: { name: "Super Sete", variant: "supersete" },
  maismilionaria: { name: "+Milionária", variant: "maismilionaria" },
  timemania: { name: "Timemania", variant: "timemania" },
  federal: { name: "Federal", variant: "federal" },
  loteca: { name: "Loteca", variant: "loteca" },
};

/** Convert "DD/MM/YYYY" → "YYYY-MM-DD" for Schema.org datePublished. */
function toIsoDate(brDate: string): string | undefined {
  if (!brDate) return undefined;
  const m = brDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export default function LotteryDraw() {
  const { lotteryId, concurso } = useParams<{ lotteryId: string; concurso: string }>();
  const meta = lotteryId ? LOTTERY_META[lotteryId] : undefined;
  const concursoNum = concurso ? parseInt(concurso, 10) : NaN;

  // Invalid slug or non-numeric concurso → 404
  if (!meta || !Number.isFinite(concursoNum) || concursoNum <= 0) {
    return <Navigate to="/404" replace />;
  }

  const { data: draw, isLoading, error } = useLotteryDraw(lotteryId!, concursoNum);

  const pageUrl = `${SITE_URL}/${lotteryId}/${concursoNum}`;
  const title = `Resultado ${meta.name} Concurso ${concursoNum}${draw?.date ? ` - ${draw.date}` : ""}`;
  const description = draw
    ? `Resultado oficial do concurso ${concursoNum} da ${meta.name} sorteado em ${draw.date}. Números sorteados, ganhadores, premiação e estatísticas.`
    : `Resultado do concurso ${concursoNum} da ${meta.name}. Confira números sorteados, ganhadores e premiação.`;
  const datePublishedIso = draw ? toIsoDate(draw.date) : undefined;

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
        {datePublishedIso && (
          <meta property="article:published_time" content={datePublishedIso} />
        )}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      {draw && (
        <JsonLd
          data={[
            buildBreadcrumb([
              { name: "Início", url: `${SITE_URL}/` },
              { name: meta.name, url: `${SITE_URL}/?loteria=${lotteryId}` },
              { name: `Concurso ${concursoNum}`, url: pageUrl },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: title,
              description,
              inLanguage: "pt-BR",
              mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
              url: pageUrl,
              datePublished: datePublishedIso,
              dateModified: datePublishedIso,
              author: { "@type": "Organization", name: "Lottos" },
              publisher: {
                "@type": "Organization",
                name: "Lottos",
                url: SITE_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${SITE_URL}/apple-touch-icon.png`,
                },
              },
              about: {
                "@type": "Thing",
                name: `${meta.name} concurso ${concursoNum}`,
              },
            },
          ]}
        />
      )}

      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para resultados
        </Link>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{meta.name}</p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Resultado {meta.name} Concurso{" "}
            <span className="text-primary">#{concursoNum}</span>
            {draw?.date && <span className="text-muted-foreground"> — {draw.date}</span>}
          </h1>
        </header>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Não foi possível carregar este concurso.</p>
            <Button asChild variant="outline">
              <Link to="/">Voltar para o início</Link>
            </Button>
          </div>
        )}

        {draw && (
          <article className="space-y-4 sm:space-y-6">
            {/* Numbers */}
            <section className="p-4 sm:p-6 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Sorteado em {draw.date}</span>
              </div>

              {lotteryId === "federal" ? (
                <ol className="space-y-2">
                  {draw.numbers.map((num, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20"
                    >
                      <span className="text-xs font-medium text-muted-foreground">{idx + 1}º Prêmio</span>
                      <span className="font-mono font-bold text-sky-400 text-sm sm:text-lg">
                        {String(num).padStart(5, "0")}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : lotteryId === "duplasena" ? (
                <>
                  <p className="text-xs text-center text-muted-foreground font-medium mb-1">1º Sorteio</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    {draw.numbers.slice(0, 6).map((num, idx) => (
                      <LotteryBall key={`s1-${idx}`} number={num} size="md" variant={meta.variant} />
                    ))}
                  </div>
                  <p className="text-xs text-center text-muted-foreground font-medium mb-1">2º Sorteio</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {draw.numbers.slice(6).map((num, idx) => (
                      <LotteryBall key={`s2-${idx}`} number={num} size="md" variant={meta.variant} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
                  {draw.numbers.map((num, idx) => (
                    <LotteryBall
                      key={idx}
                      number={num}
                      size={draw.numbers.length > 10 ? "sm" : "md"}
                      variant={meta.variant}
                    />
                  ))}
                </div>
              )}

              {lotteryId === "maismilionaria" && draw.trevos && draw.trevos.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clover className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">Trevos</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {draw.trevos.map((t, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-sm font-bold text-emerald-400"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lotteryId === "timemania" && draw.timeCoracao && (
                <div className="flex items-center justify-center gap-2 py-2 mt-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Heart className="w-4 h-4 text-green-400 fill-green-400" />
                  <span className="text-sm font-semibold text-green-400">{draw.timeCoracao}</span>
                </div>
              )}

              {lotteryId === "diadesorte" && draw.mesSorte && (
                <div className="flex items-center justify-center gap-2 py-2 mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <CalendarDays className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-muted-foreground">Mês da Sorte:</span>
                  <span className="text-sm font-semibold text-amber-400">{draw.mesSorte}</span>
                </div>
              )}
            </section>

            {/* Prize summary */}
            <section className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Trophy className="w-3.5 h-3.5" /> Prêmio principal
                </div>
                <p className="text-base sm:text-lg font-bold text-primary">{draw.prize}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {draw.winners > 0 ? `${draw.winners} ganhador(es)` : "Acumulou"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Próximo prêmio
                </div>
                <p className="text-base sm:text-lg font-bold text-foreground">{draw.nextPrize}</p>
                {draw.accumulated && (
                  <p className="flex items-center gap-1 text-[10px] font-semibold text-yellow-500 mt-1">
                    <Flame className="w-3 h-3" /> Acumulado
                  </p>
                )}
              </div>
            </section>

            {/* Prize tiers */}
            {draw.premiacoes && draw.premiacoes.length > 0 && (
              <section className="p-4 rounded-xl bg-secondary/30 border border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary" /> Faixas de Premiação
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Faixa</th>
                        <th className="text-center py-2 text-muted-foreground font-medium">Ganh.</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Prêmio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draw.premiacoes.map((p, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="py-2">{p.descricao}</td>
                          <td className="py-2 text-center">
                            <span className={p.ganhadores > 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
                              {p.ganhadores}
                            </span>
                          </td>
                          <td className="py-2 text-right font-mono">
                            R$ {p.valorPremio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Winner locations */}
            {draw.localGanhadores && draw.localGanhadores.length > 0 && lotteryId !== "federal" && (
              <section className="p-4 rounded-xl bg-secondary/30 border border-border">
                <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" /> Locais dos Ganhadores
                </h2>
                <ul className="space-y-2">
                  {draw.localGanhadores.map((loc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        {loc.nomeLoteria && (
                          <span className="text-sm font-medium truncate">{loc.nomeLoteria}</span>
                        )}
                        <span className="text-xs text-muted-foreground truncate">
                          {loc.municipio}/{loc.uf}
                        </span>
                      </div>
                      {loc.ganhadores > 0 && (
                        <span className="text-xs font-semibold text-primary whitespace-nowrap">
                          {loc.ganhadores} {loc.ganhadores === 1 ? "ganhador" : "ganhadores"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="text-xs text-muted-foreground border-t border-border pt-4">
              <p>
                Este App não possui vínculo oficial com a Caixa Econômica Federal. Resultados informativos
                obtidos da API pública de loterias.
              </p>
            </section>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
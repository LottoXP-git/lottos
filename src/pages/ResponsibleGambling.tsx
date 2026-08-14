import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeartHandshake, AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";

export default function ResponsibleGambling() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Jogo Responsável - Lottos</title>
        <meta
          name="description"
          content="Oriente-se sobre jogo responsável: sinais de alerta, dicas e canais de ajuda. Loterias são restritas a maiores de 18 anos."
        />
        <link rel="canonical" href="https://grupolottoxp.com/jogo-responsavel" />
        <meta property="og:title" content="Jogo Responsável - Lottos" />
        <meta property="og:url" content="https://grupolottoxp.com/jogo-responsavel" />
      </Helmet>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Início", url: `${SITE_URL}/` },
            { name: "Jogo Responsável", url: `${SITE_URL}/jogo-responsavel` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Jogo Responsável",
            url: `${SITE_URL}/jogo-responsavel`,
            inLanguage: "pt-BR",
            description:
              "Orientações sobre jogo responsável, sinais de alerta e canais de apoio no Brasil.",
          },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <HeartHandshake className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Jogo Responsável</h1>
        </div>

        <div className="p-4 mb-6 rounded-lg border border-destructive/30 bg-destructive/5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Loterias e jogos de azar são restritos a maiores de 18 anos.</strong>{" "}
            Apostar deve ser sempre uma forma de entretenimento, nunca uma fonte
            de renda ou solução para problemas financeiros.
          </p>
        </div>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Aposte com consciência</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Defina um orçamento mensal para apostas e respeite o limite</li>
              <li>Nunca aposte dinheiro destinado a necessidades básicas</li>
              <li>Não tente recuperar prejuízos apostando mais</li>
              <li>Faça pausas frequentes e evite jogar sob estresse ou álcool</li>
              <li>Lembre-se: as chances reais de premiação são muito baixas</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Sinais de alerta</h2>
            <p>Procure ajuda se você ou alguém próximo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aposta valores cada vez maiores para sentir emoção</li>
              <li>Sente irritação ou ansiedade ao tentar parar</li>
              <li>Mente sobre o quanto joga ou perde</li>
              <li>Pega dinheiro emprestado para apostar</li>
              <li>Negligencia trabalho, família ou estudos por causa do jogo</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Canais de ajuda</h2>

            <div className="not-prose grid gap-3 sm:grid-cols-2">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">CVV — 188</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apoio emocional gratuito, 24h por dia.{" "}
                  <a
                    href="https://www.cvv.org.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    cvv.org.br <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Jogadores Anônimos</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Grupos de ajuda mútua no Brasil.{" "}
                  <a
                    href="https://jogadoresanonimos.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    jogadoresanonimos.com.br <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Nosso compromisso</h2>
            <p>
              O Lottos é uma ferramenta informativa. Não vendemos apostas e não
              prometemos resultados. As estatísticas e palpites apresentados não
              alteram a probabilidade matemática real de cada sorteio.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Info, Mail, MapPin, ShieldCheck, BarChart3 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "@/components/JsonLd";
import { buildBreadcrumb, SITE_URL } from "@/lib/breadcrumb";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Sobre o Lottos - Quem somos</title>
        <meta
          name="description"
          content="O Lottos é uma plataforma independente de informação e estatística sobre as Loterias da Caixa. Conheça nossa missão, equipe e contato."
        />
        <link rel="canonical" href="https://grupolottoxp.com/sobre" />
        <meta property="og:title" content="Sobre o Lottos" />
        <meta property="og:description" content="Plataforma independente de estatísticas das Loterias Caixa." />
        <meta property="og:url" content="https://grupolottoxp.com/sobre" />
      </Helmet>
      <JsonLd
        data={[
          buildBreadcrumb([
            { name: "Início", url: `${SITE_URL}/` },
            { name: "Sobre", url: `${SITE_URL}/sobre` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Sobre o Lottos",
            url: `${SITE_URL}/sobre`,
            inLanguage: "pt-BR",
            description:
              "Plataforma independente de informação e estatística sobre as Loterias da Caixa Econômica Federal.",
            publisher: {
              "@type": "Organization",
              name: "Lottos",
              email: "grupolottoxp@gmail.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Olinda",
                addressRegion: "PE",
                addressCountry: "BR",
              },
            },
          },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Info className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Sobre o Lottos</h1>
        </div>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Nossa missão</h2>
            <p>
              O <strong className="text-foreground">Lottos</strong> nasceu para
              centralizar resultados, estatísticas e ferramentas de análise das
              loterias brasileiras em um só lugar — de forma rápida, gratuita e
              fácil de entender. Acreditamos que informação clara ajuda o
              apostador a jogar com mais consciência.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> O que oferecemos
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Resultados atualizados de todas as modalidades da Caixa</li>
              <li>Estatísticas de frequência, números quentes e frios</li>
              <li>Gerador de palpites com diferentes estratégias</li>
              <li>Conferência de apostas e ranking de prêmios</li>
              <li>Guias e conteúdo educativo sobre cada loteria</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Independência
            </h2>
            <p>
              O Lottos é uma plataforma <strong className="text-foreground">independente</strong>{" "}
              e <strong className="text-foreground">não possui vínculo oficial com a Caixa
              Econômica Federal</strong>. Não realizamos vendas de apostas. Para apostar,
              utilize os canais oficiais da Caixa ou casas lotéricas credenciadas.
            </p>
            <p>
              Acreditamos no jogo responsável. Consulte nossa página de{" "}
              <Link to="/jogo-responsavel" className="text-primary hover:underline">
                Jogo Responsável
              </Link>{" "}
              para orientações e canais de apoio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Quem somos</h2>
            <p>
              Somos uma pequena equipe de desenvolvedores e entusiastas brasileiros
              sediados em Olinda/PE. Construímos o Lottos como um projeto
              independente, mantido pela receita de publicidade exibida no site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Contato</h2>
            <ul className="space-y-2 not-prose">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:grupolottoxp@gmail.com" className="text-foreground hover:text-primary">
                  grupolottoxp@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Olinda/PE - Brasil</span>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
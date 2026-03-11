import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Termos de Uso</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Aceitação dos termos</h2>
            <p>Ao acessar e utilizar o site Lottos, você concorda com estes Termos de Uso. Caso não concorde com qualquer parte destes termos, recomendamos que não utilize o site.


            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Descrição do serviço</h2>
            <p>O Lottos é uma plataforma informativa que apresenta resultados, estatísticas e ferramentas de geração de palpites para as loterias da Caixa Econômica Federal.

            </p>
            <p className="font-medium text-foreground">
              Este site NÃO possui vínculo oficial com a Caixa Econômica Federal e NÃO realiza vendas de apostas ou jogos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Uso permitido</h2>
            <p>Ao utilizar o site, você concorda em:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar o serviço apenas para fins pessoais e informativos</li>
              <li>Não reproduzir, distribuir ou modificar o conteúdo sem autorização</li>
              <li>Não utilizar o site para atividades ilegais ou prejudiciais</li>
              <li>Fornecer informações verdadeiras em formulários de cadastro</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Isenção de responsabilidade</h2>
            <p>
              Os resultados e estatísticas apresentados são meramente informativos. Não garantimos a precisão ou atualidade das informações.
              Os palpites gerados são aleatórios e não representam garantia de premiação.
            </p>
            <p>O Lottos não se responsabiliza por decisões de apostas tomadas com base nas informações disponibilizadas neste site. Jogue com responsabilidade.


            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Publicidade</h2>
            <p>
              O site pode exibir anúncios de terceiros, incluindo anúncios veiculados pelo Google AdSense. Esses anúncios podem usar cookies
              para personalizar o conteúdo exibido. Consulte nossa <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a> para mais detalhes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Propriedade intelectual</h2>
            <p>Todo o conteúdo do site, incluindo textos, gráficos, logotipos e código-fonte, é de propriedade do Lottos e protegido por leis de direitos autorais. As marcas e logotipos das loterias são de propriedade da Caixa Econômica Federal.


            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações entram em vigor imediatamente após a publicação no site.
              O uso continuado do site após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
            <p>
              Dúvidas sobre estes termos podem ser enviadas para: <span className="text-foreground font-medium">

              </span>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>);}
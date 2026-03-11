import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. Informações que coletamos</h2>
            <p>Podemos coletar as seguintes informações quando você utiliza nosso site:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo, e-mail, telefone e data de nascimento (quando fornecidos via formulário de cadastro)</li>
              <li>Preferências de loterias favoritas</li>
              <li>Dados de navegação e uso do site (cookies, endereço IP, tipo de navegador)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. Como utilizamos seus dados</h2>
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Personalizar sua experiência no site</li>
              <li>Enviar notificações sobre resultados e promoções (mediante consentimento)</li>
              <li>Melhorar nossos serviços e funcionalidades</li>
              <li>Exibir anúncios relevantes por meio do Google AdSense</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. Cookies e tecnologias de rastreamento</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário e exibir anúncios personalizados.
              Parceiros de publicidade, incluindo o Google, podem usar cookies para veicular anúncios com base em visitas anteriores.
            </p>
            <p>
              Você pode gerenciar suas preferências de cookies nas configurações do seu navegador. Para mais informações sobre como o Google utiliza dados,
              visite <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Políticas de Privacidade do Google</a>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. Compartilhamento de dados</h2>
            <p>
              Não vendemos, trocamos ou transferimos suas informações pessoais a terceiros, exceto quando necessário para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cumprir obrigações legais</li>
              <li>Proteger nossos direitos e segurança</li>
              <li>Fornecer serviços por meio de parceiros de confiança (como provedores de hospedagem e publicidade)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. Segurança dos dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado,
              alteração, divulgação ou destruição.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. Seus direitos (LGPD)</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Revogar o consentimento para comunicações de marketing</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato pelo e-mail: <span className="text-foreground font-medium">contato@lotus.com.br</span></p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. Alterações nesta política</h2>
            <p>
              Reservamo-nos o direito de atualizar esta Política de Privacidade a qualquer momento. Alterações significativas serão comunicadas por meio do site.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

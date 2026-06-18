import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Heart, Mail, MapPin, ExternalLink, Share2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

async function handleShareApp() {
  const shareData = {
    title: "Lottos - Resultados das Loterias",
    text: "Acompanhe resultados, estatísticas e gere palpites inteligentes para todas as loterias da Caixa!",
    url: "https://play.google.com/store/apps/details?id=com.lottos.app&pcampaignid=web_share",
  };
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    toast({ title: "Link copiado!", description: "Compartilhe o Lottos com seus amigos." });
  } catch {
    toast({ title: "Erro", description: "Não foi possível compartilhar.", variant: "destructive" });
  }
}

const usefulLinks = [
{ label: "Loterias Caixa", href: "https://loterias.caixa.gov.br", external: true },
{ label: "Resultados Oficiais", href: "https://loterias.caixa.gov.br/Paginas/default.aspx", external: true },
{ label: "Como Jogar", href: "https://loterias.caixa.gov.br/Paginas/Como-Jogar.aspx", external: true },
{ label: "Probabilidades", href: "https://loterias.caixa.gov.br/Paginas/Probabilidades.aspx", external: true }];


const lotteryLinks = [
{ label: "Mega-Sena", href: "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx", external: true },
{ label: "Lotofácil", href: "https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx", external: true },
{ label: "Quina", href: "https://loterias.caixa.gov.br/Paginas/Quina.aspx", external: true },
{ label: "+Milionária", href: "https://loterias.caixa.gov.br/Paginas/Mais-Milionaria.aspx", external: true }];


const guideLinks = [
  { label: "Como ganhar na Lotofácil", to: "/como-ganhar/lotofacil" },
  { label: "Como ganhar na Mega-Sena", to: "/como-ganhar/megasena" },
  { label: "Como ganhar na Quina", to: "/como-ganhar/quina" },
  { label: "Como ganhar na Lotomania", to: "/como-ganhar/lotomania" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Acompanhe resultados, estatísticas e gere palpites inteligentes para todas as loterias da Caixa.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Feito com</span>
              <Heart className="w-3 h-3 text-primary fill-primary" />
              <span>no Brasil</span>
            </div>
            <Button
              onClick={handleShareApp}
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar o app
            </Button>
          </div>

          {/* Links Úteis */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Links Úteis</h3>
            <ul className="space-y-2.5">
              {usefulLinks.map((link) =>
              <li key={link.label}>
                  <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Loterias */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Loterias</h3>
            <ul className="space-y-2.5">
              {lotteryLinks.map((link) =>
              <li key={link.label}>
                  <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              )}
            </ul>
            <h3 className="text-sm font-semibold text-foreground pt-2">Guias</h3>
            <ul className="space-y-2.5">
              {guideLinks.map((g) => (
                <li key={g.to}>
                  <Link
                    to={g.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {g.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>grupolottoxp@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Olinda/PE - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lottos. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
            <span>•</span>
            <Link to="/jogo-responsavel" className="hover:text-primary transition-colors">Jogo Responsável</Link>
            <span>•</span>
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <span>•</span>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
          </div>
          <p className="text-xs text-muted-foreground text-center font-bold">
            Este App não possui vínculo oficial com a Caixa Econômica Federal.
          </p>
        </div>

        {/* Aviso de jogo responsável (exigência AdSense para conteúdo de loterias) */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">+18.</strong> Jogue com responsabilidade. Se precisar de apoio, ligue para o{" "}
            <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              CVV 188
            </a>
            {" "}ou consulte nossa página de{" "}
            <Link to="/jogo-responsavel" className="text-primary hover:underline">Jogo Responsável</Link>.
          </span>
        </div>
      </div>
    </footer>);}
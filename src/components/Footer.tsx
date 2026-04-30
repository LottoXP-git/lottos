import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Heart, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { ShareButton } from "./ShareButton";

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
            <div className="flex items-center gap-2 pt-2">
              <ShareButton
                title="Lottos - Resultados das Loterias"
                text="Acompanhe resultados, estatísticas e gere palpites inteligentes para todas as loterias da Caixa!"
                url="https://lottos.lovable.app"
                variant="outline"
                size="sm"
                className="w-auto px-3 gap-2"
              />
              <span className="text-xs text-muted-foreground">Compartilhe o app</span>
            </div>
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
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <span>•</span>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
          </div>
          <p className="text-xs text-muted-foreground text-center font-bold">
            Este App não possui vínculo oficial com a Caixa Econômica Federal.
          </p>
        </div>
      </div>
    </footer>);}
import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type AdFormat = "leaderboard" | "inline" | "sidebar" | "interstitial";

interface AdBannerProps {
  format?: AdFormat;
  className?: string;
}

const adContent: Record<AdFormat, { title: string; cta: string; desc: string; accent: string }[]> = {
  leaderboard: [
    { title: "💰 Aposte com Responsabilidade", cta: "Saiba Mais", desc: "Loterias Caixa — Jogue consciente", accent: "from-primary/80 to-primary/40" },
    { title: "📊 Planilha Inteligente de Apostas", cta: "Baixar Grátis", desc: "Organize seus jogos e aumente suas chances", accent: "from-emerald-600/70 to-emerald-400/30" },
  ],
  inline: [
    { title: "🎯 Grupo de Bolão Online", cta: "Participar", desc: "Aumente suas chances jogando em grupo", accent: "from-purple-600/60 to-purple-400/20" },
    { title: "📱 App de Conferência", cta: "Instalar", desc: "Confira seus jogos automaticamente", accent: "from-amber-600/60 to-amber-400/20" },
  ],
  sidebar: [
    { title: "🔔 Alertas VIP", cta: "Ativar", desc: "Receba notificações de prêmios acumulados", accent: "from-primary/70 to-primary/20" },
  ],
  interstitial: [
    { title: "⭐ Premium — Sem Anúncios", cta: "Assinar", desc: "Estatísticas avançadas e palpites exclusivos por R$ 9,90/mês", accent: "from-amber-500/80 to-primary/50" },
  ],
};

const formatStyles: Record<AdFormat, string> = {
  leaderboard: "w-full py-3 px-4",
  inline: "w-full py-3 px-4 rounded-xl",
  sidebar: "w-full py-3 px-4 rounded-xl",
  interstitial: "w-full py-4 px-5 rounded-2xl",
};

export function AdBanner({ format = "leaderboard", className }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [adIndex] = useState(() => Math.floor(Math.random() * adContent[format].length));

  if (dismissed) return null;

  const ad = adContent[format][adIndex];

  return (
    <div
      className={cn(
        "relative group border border-border/50 bg-gradient-to-r backdrop-blur-sm overflow-hidden transition-all duration-300",
        ad.accent,
        formatStyles[format],
        className
      )}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 z-10"
        aria-label="Fechar anúncio"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{ad.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{ad.desc}</p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground border border-foreground/10 transition-colors">
          {ad.cta}
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Ad label */}
      <span className="absolute bottom-1 right-2 text-[9px] text-muted-foreground/50 uppercase tracking-wider">
        Anúncio
      </span>
    </div>
  );
}

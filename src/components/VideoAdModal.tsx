import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoAdModalProps {
  open: boolean;
  onComplete: () => void;
}

const AD_DURATION = 10; // seconds

const adVideos = [
  {
    title: "💰 Aposte com Responsabilidade",
    desc: "Loterias Caixa — Jogue consciente e com moderação. A sorte favorece quem joga com inteligência.",
    gradient: "from-primary/90 to-yellow-600/80",
  },
  {
    title: "📊 Planilha Inteligente de Apostas",
    desc: "Organize seus jogos, controle seus gastos e aumente suas chances com nossa ferramenta gratuita.",
    gradient: "from-emerald-600/80 to-teal-500/70",
  },
  {
    title: "⭐ Assine o Premium",
    desc: "Sem anúncios, estatísticas avançadas e palpites exclusivos por apenas R$ 9,90/mês.",
    gradient: "from-amber-500/80 to-primary/70",
  },
];

export function VideoAdModal({ open, onComplete }: VideoAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);
  const [adIndex] = useState(() => Math.floor(Math.random() * adVideos.length));
  const [isPlaying, setIsPlaying] = useState(false);

  const ad = adVideos[adIndex];

  useEffect(() => {
    if (!open) {
      setTimeLeft(AD_DURATION);
      setIsPlaying(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-primary/30 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className={cn("relative w-full aspect-video bg-gradient-to-br flex flex-col items-center justify-center text-center p-6 gap-4", ad.gradient)}>
          {/* Animated bg elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-32 h-32 rounded-full bg-white/10 -top-10 -left-10 animate-pulse" />
            <div className="absolute w-24 h-24 rounded-full bg-white/5 bottom-5 right-5 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          {!isPlaying ? (
            <>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{ad.title}</p>
              <p className="text-sm text-white/80 max-w-xs">{ad.desc}</p>
              <Button
                onClick={handlePlay}
                size="lg"
                className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                Assistir Anúncio
              </Button>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-white drop-shadow-lg animate-pulse">{ad.title}</p>
              <p className="text-sm text-white/80 max-w-xs">{ad.desc}</p>
              <div className="flex items-center gap-2 mt-2">
                <Timer className="w-4 h-4 text-white/70" />
                <div className="w-40 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((AD_DURATION - timeLeft) / AD_DURATION) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/70 font-mono w-5">{timeLeft}s</span>
              </div>
            </>
          )}

          {/* Ad label */}
          <span className="absolute top-2 left-3 text-[9px] text-white/40 uppercase tracking-wider">
            Anúncio
          </span>
        </div>

        <div className="p-4 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {timeLeft > 0
              ? isPlaying
                ? "Aguarde o término do anúncio para liberar mais palpites..."
                : "Assista ao anúncio para liberar mais 2 palpites gratuitos"
              : "🎉 Anúncio concluído! Seus palpites foram liberados!"}
          </p>
          <Button
            onClick={onComplete}
            disabled={timeLeft > 0}
            className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-primary-foreground font-bold"
          >
            {timeLeft > 0 ? `Aguarde ${timeLeft}s` : "Gerar Palpites"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

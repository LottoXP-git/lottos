import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Calendar, Clock, TrendingUp, Sparkles, Star, PartyPopper } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MEGA_SENA_30_DATE, getMegaSena30Status } from "@/utils/megaSena30Date";
import { MegaSena30ModalSkeleton } from "./MegaSena30ModalSkeleton";

interface MegaSena30ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGeneratePicks?: () => void;
}

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getCountdown(targetDate: Date): CountdownValues {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

const SPECIAL = {
  name: "Mega-Sena 30 Anos",
  lottery: "Mega-Sena • Concurso Especial",
  date: MEGA_SENA_30_DATE,
  prize: "R$ 150.000.000,00",
  description:
    "A Mega-Sena celebra 30 anos com um sorteio histórico! Prêmio que não acumula — se ninguém acertar a Sena, o valor desce para a faixa da Quina.",
  highlights: [
    "Prêmio histórico de R$ 150 milhões",
    "Comemoração dos 30 anos da Mega-Sena",
    "Não acumula — desce para a Quina se ninguém acertar",
    "Aposta mínima a partir de R$ 6,00",
  ],
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-emerald-500"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-1 sm:mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function MegaSena30Modal({ open, onOpenChange, onGeneratePicks }: MegaSena30ModalProps) {
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown(SPECIAL.date));
  const [status, setStatus] = useState(() => getMegaSena30Status());
  const [isLoading, setIsLoading] = useState(true);

  // Simulated load — when wired to a real API, replace with useQuery state.
  useEffect(() => {
    if (!open) {
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || isLoading) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(SPECIAL.date));
      setStatus(getMegaSena30Status());
    }, 1000);
    return () => clearInterval(interval);
  }, [open, isLoading]);

  const isExpired = useMemo(() => {
    return countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  }, [countdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card border-border p-0 gap-0">
        {isLoading ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Carregando concurso especial</DialogTitle>
              <DialogDescription>Aguarde enquanto os dados são carregados.</DialogDescription>
            </DialogHeader>
            <MegaSena30ModalSkeleton />
          </>
        ) : (<>
        {/* Hero Poster — inspirado no cartaz oficial */}
        <div
          className="relative overflow-hidden rounded-t-lg"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, #1f6b3a 0%, #0f3d22 45%, #051a0e 100%)",
          }}
        >
          {/* Diagonal light streak */}
          <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] opacity-25 pointer-events-none rotate-[-18deg] bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
          {/* Grain glow */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,215,120,0.18), transparent 45%), radial-gradient(circle at 75% 75%, rgba(255,215,120,0.12), transparent 50%)",
            }}
          />

          {/* Floating decorative balls (gold) */}
          <motion.div
            className="absolute top-3 left-4 w-4 h-6 sm:w-6 sm:h-8 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 30%, #FFE7A0, #B07A1C)" }}
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-6 right-6 sm:right-10 w-5 h-7 sm:w-7 sm:h-9 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 30%, #FFE7A0, #B07A1C)" }}
            animate={{ y: [3, -3, 3] }}
            transition={{ duration: 4.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-4 right-4 w-4 h-6 sm:w-5 sm:h-7 rounded-full opacity-80 pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 30%, #FFE7A0, #B07A1C)" }}
            animate={{ y: [-2, 4, -2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          <div className="relative px-4 sm:px-6 pt-5 sm:pt-7 pb-5 sm:pb-7 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-[0.2em]">
                Concurso Especial
              </span>
            </div>

            {status !== "upcoming" && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mb-2 ml-1.5 border text-[10px] font-extrabold uppercase tracking-wider ${
                  status === "one-day"
                    ? "bg-amber-400 border-amber-300 text-emerald-950 animate-pulse"
                    : status === "live"
                    ? "bg-rose-500 border-rose-400 text-white animate-pulse"
                    : "bg-emerald-400 border-emerald-300 text-emerald-950"
                }`}
              >
                {status === "one-day" && "Falta 1 dia"}
                {status === "live" && "Ao vivo agora"}
                {status === "finished" && "Sorteio realizado"}
              </div>
            )}

            <DialogHeader>
              <DialogTitle asChild>
                <div className="flex items-end justify-center gap-1.5 sm:gap-2 leading-none mt-1">
                  <div className="font-black text-lime-300 text-left drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                    <div className="text-2xl sm:text-3xl md:text-4xl tracking-tight">MEGA</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl tracking-tight -mt-1">SENA</div>
                  </div>
                  <div className="relative flex items-end">
                    <span className="font-black text-white text-5xl sm:text-6xl md:text-7xl leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                      30
                    </span>
                    <svg viewBox="0 0 64 64" className="mega30-clover absolute -top-1 -right-3 sm:-right-4 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-lime-300" aria-hidden>
                      <g fill="currentColor">
                        <path d="M32 32c-3-9 3-18 11-18 6 0 10 5 9 11-1 7-9 11-20 7z" />
                        <path d="M32 32c9-3 18 3 18 11 0 6-5 10-11 9-7-1-11-9-7-20z" />
                        <path d="M32 32c3 9-3 18-11 18-6 0-10-5-9-11 1-7 9-11 20-7z" />
                        <path d="M32 32c-9 3-18-3-18-11 0-6 5-10 11-9 7 1 11 9 7 20z" />
                      </g>
                    </svg>
                    <span className="ml-1 sm:ml-2 mb-0.5 sm:mb-1 italic font-light text-lime-300 text-sm sm:text-base">anos</span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription className="sr-only">
                Mega-Sena 30 Anos — sorteio especial em 24 de Maio de 2026 com prêmio estimado de R$ 150 milhões.
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mt-3 sm:mt-4"
            >
              <span className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-[0.25em]">
                Prêmio Estimado
              </span>
              <div
                className="mega30-shimmer font-black text-4xl sm:text-5xl md:text-6xl leading-none mt-1 bg-clip-text text-transparent drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, #B07A1C 0%, #F0C24C 30%, #FFF6D5 50%, #F0C24C 70%, #B07A1C 100%)",
                }}
              >
                R$ 150
              </div>
              <div
                className="font-black text-xl sm:text-2xl md:text-3xl leading-none mt-0.5 sm:mt-1 italic bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(180deg, #FFE69A 0%, #C99528 100%)",
                }}
              >
                MILHÕES
              </div>
              <div className="mt-2 text-[11px] italic text-lime-300/90">não acumula</div>
            </motion.div>
          </div>

          {/* Bottom accent */}
          <div className="relative h-1 bg-gradient-to-r from-lime-400 via-amber-300 to-lime-400" />
        </div>

        <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
          {/* Countdown */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {status === "finished"
                  ? "Sorteio realizado!"
                  : status === "live"
                  ? "Sorteio acontecendo agora"
                  : status === "one-day"
                  ? "Última chance — falta 1 dia"
                  : "Contagem Regressiva"}
              </span>
            </div>

            {!isExpired && status !== "live" && status !== "finished" && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
                <CountdownUnit value={countdown.days} label="Dias" />
                <span className="text-base sm:text-xl font-bold text-muted-foreground mt-[-16px] sm:mt-[-20px]">:</span>
                <CountdownUnit value={countdown.hours} label="Horas" />
                <span className="text-base sm:text-xl font-bold text-muted-foreground mt-[-16px] sm:mt-[-20px]">:</span>
                <CountdownUnit value={countdown.minutes} label="Min" />
                <span className="text-base sm:text-xl font-bold text-muted-foreground mt-[-16px] sm:mt-[-20px]">:</span>
                <CountdownUnit value={countdown.seconds} label="Seg" />
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg sm:rounded-xl bg-secondary/50 border border-border">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs sm:text-sm text-foreground font-medium text-center">
              <span className="sm:hidden">Dom, 24/05/2026 · 11h</span>
              <span className="hidden sm:inline">Sorteio: Domingo, 24 de Maio de 2026 às 11h</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
            {SPECIAL.description}
          </p>

          <div className="space-y-2">
            {SPECIAL.highlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  {idx === 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> :
                   idx === 1 ? <PartyPopper className="w-3.5 h-3.5 text-emerald-500" /> :
                   idx === 2 ? <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> :
                   <Gift className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <span className="text-xs sm:text-sm text-foreground leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>

          <Button
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold gap-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-amber-600 text-white shadow-lg"
            onClick={() => onGeneratePicks ? onGeneratePicks() : onOpenChange(false)}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Gerar Palpites para a Mega-Sena 30 Anos
          </Button>
        </div>
        </>)}
      </DialogContent>
    </Dialog>
  );
}
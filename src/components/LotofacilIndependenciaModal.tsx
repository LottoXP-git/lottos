import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Calendar, Clock, TrendingUp, Sparkles, PartyPopper } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LOTOFACIL_INDEPENDENCIA_DATE,
  getLotofacilIndependenciaStatus,
} from "@/utils/lotofacilIndependenciaDate";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGeneratePicks?: () => void;
  prizeCompact?: string;
  prizeFull?: string;
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
  description:
    "A Lotofácil da Independência é o maior prêmio do ano da Lotofácil! Prêmio que não acumula — se ninguém acertar as 15 dezenas, o valor desce para a faixa de 14 acertos.",
  highlights: [
    "Prêmio histórico de R$ 300 milhões",
    "Comemoração do 7 de Setembro",
    "Não acumula — desce para 14 acertos se ninguém ganhar",
    "Aposta mínima a partir de R$ 3,50",
  ],
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-pink-600"
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

export function LotofacilIndependenciaModal({
  open,
  onOpenChange,
  onGeneratePicks,
  prizeCompact = "R$ 300",
  prizeFull = "R$ 300.000.000,00",
}: Props) {
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown(LOTOFACIL_INDEPENDENCIA_DATE));
  const [status, setStatus] = useState(() => getLotofacilIndependenciaStatus());

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(LOTOFACIL_INDEPENDENCIA_DATE));
      setStatus(getLotofacilIndependenciaStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const isExpired = useMemo(() => {
    return countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  }, [countdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card border-border p-0 gap-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Lotofácil da Independência</DialogTitle>
          <DialogDescription className="sr-only">
            Lotofácil da Independência — sorteio especial em 15 de Setembro de 2026 com prêmio estimado de {prizeFull}.
          </DialogDescription>
        </DialogHeader>

        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-t-lg"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, hsl(310 80% 48%) 0%, hsl(310 80% 38%) 40%, hsl(310 85% 28%) 80%, hsl(310 90% 16%) 100%)",
          }}
        >
          <div className="relative px-4 sm:px-6 pt-5 sm:pt-7 pb-5 sm:pb-7 flex flex-col items-center gap-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 border border-pink-200 shadow">
              <Trophy className="w-3.5 h-3.5 text-pink-700" />
              <span className="text-[10px] font-bold text-pink-700 uppercase tracking-[0.18em]">
                Concurso Especial #3780
              </span>
            </div>
            <div className="font-black text-white leading-[0.95] mt-1">
              <div className="text-2xl sm:text-3xl">lotofácil da</div>
              <div className="text-3xl sm:text-4xl italic" style={{ color: "#FFD1E8" }}>
                INDEPENDÊNCIA
              </div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-pink-50">
                Prêmio Estimado
              </div>
              <div className="font-black text-white text-4xl sm:text-5xl leading-none mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {prizeCompact} Milhões
              </div>
              <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-white/95 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-pink-700 shadow">
                NÃO ACUMULA
              </div>
            </div>
          </div>
          <div className="relative h-1 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-400" />
        </div>

        <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
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

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg sm:rounded-xl bg-secondary/50 border border-border">
            <Calendar className="w-4 h-4 text-pink-600" />
            <span className="text-xs sm:text-sm text-foreground font-medium text-center">
              <span className="sm:hidden">Ter, 15/09/2026 · 11h</span>
              <span className="hidden sm:inline">Sorteio: Terça, 15 de Setembro de 2026 às 11h</span>
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
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-pink-500/5 border border-pink-500/10"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                  {idx === 0 ? <TrendingUp className="w-3.5 h-3.5 text-pink-600" /> :
                   idx === 1 ? <PartyPopper className="w-3.5 h-3.5 text-pink-600" /> :
                   idx === 2 ? <Sparkles className="w-3.5 h-3.5 text-pink-600" /> :
                   <Gift className="w-3.5 h-3.5 text-pink-600" />}
                </div>
                <span className="text-xs sm:text-sm text-foreground leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>

          <Button
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold gap-2 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-400 hover:from-pink-700 hover:via-pink-600 hover:to-pink-500 text-white shadow-lg"
            onClick={() => onGeneratePicks ? onGeneratePicks() : onOpenChange(false)}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Gerar Palpites para a Lotofácil da Independência
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
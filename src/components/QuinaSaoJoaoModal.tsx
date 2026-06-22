import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Calendar, Clock, TrendingUp, Sparkles, PartyPopper } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUINA_SAO_JOAO_DATE, getQuinaSaoJoaoStatus } from "@/utils/quinaSaoJoaoDate";
import poster from "@/assets/quina-sao-joao-260m.jpg.asset.json";

interface QuinaSaoJoaoModalProps {
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
  name: "Quina de São João",
  description:
    "A Quina de São João traz o maior prêmio do ano para os apostadores da Quina! Prêmio que não acumula — se ninguém acertar, o valor desce para a faixa de 4 acertos.",
  highlights: [
    "Prêmio histórico de R$ 260 milhões",
    "Tradicional festa junina das loterias",
    "Não acumula — desce para a quadra se ninguém acertar",
    "Aposta mínima a partir de R$ 3,00",
  ],
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-orange-500"
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

export function QuinaSaoJoaoModal({
  open,
  onOpenChange,
  onGeneratePicks,
  prizeCompact = "R$ 250",
  prizeFull = "R$ 250.000.000,00",
}: QuinaSaoJoaoModalProps) {
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown(QUINA_SAO_JOAO_DATE));
  const [status, setStatus] = useState(() => getQuinaSaoJoaoStatus());

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(QUINA_SAO_JOAO_DATE));
      setStatus(getQuinaSaoJoaoStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const isExpired = useMemo(() => {
    return countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  }, [countdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card border-border p-0 gap-0">
        {/* Hero — official poster */}
        <div className="relative overflow-hidden rounded-t-lg bg-[#1B5FB8]">
          <img
            src={poster.url}
            alt="Cartaz oficial Quina de São João 2026 — Prêmio estimado R$ 250 milhões"
            className="w-full h-auto block"
            loading="eager"
          />
          {/* Top badge overlay */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/95 border border-orange-300 shadow-lg">
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-[0.18em]">
                Concurso Especial
              </span>
            </div>
            {status !== "upcoming" && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider shadow-lg ${
                  status === "one-day"
                    ? "bg-amber-400 border-amber-300 text-blue-950 animate-pulse"
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
          </div>

          <DialogHeader>
            <DialogTitle className="sr-only">Quina de São João</DialogTitle>
            <DialogDescription className="sr-only">
              Quina de São João — sorteio especial em 28 de Junho de 2026 com prêmio estimado de {prizeFull}.
            </DialogDescription>
          </DialogHeader>
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
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs sm:text-sm text-foreground font-medium text-center">
              <span className="sm:hidden">Dom, 28/06/2026 · 11h</span>
              <span className="hidden sm:inline">Sorteio: Domingo, 28 de Junho de 2026 às 11h</span>
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
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  {idx === 0 ? <TrendingUp className="w-3.5 h-3.5 text-orange-500" /> :
                   idx === 1 ? <PartyPopper className="w-3.5 h-3.5 text-orange-500" /> :
                   idx === 2 ? <Sparkles className="w-3.5 h-3.5 text-orange-500" /> :
                   <Gift className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <span className="text-xs sm:text-sm text-foreground leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>

          <Button
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 hover:from-orange-600 hover:via-orange-700 hover:to-blue-700 text-white shadow-lg"
            onClick={() => onGeneratePicks ? onGeneratePicks() : onOpenChange(false)}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Gerar Palpites para a Quina de São João
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
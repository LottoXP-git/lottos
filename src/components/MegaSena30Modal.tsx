import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Gift, Calendar, Clock, TrendingUp, Sparkles, Star, PartyPopper } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MEGA_SENA_30_DATE } from "@/utils/megaSena30Date";

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
    "Aposta mínima a partir de R$ 5,00",
  ],
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-3xl font-bold font-mono text-emerald-500"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function MegaSena30Modal({ open, onOpenChange, onGeneratePicks }: MegaSena30ModalProps) {
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown(SPECIAL.date));

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(SPECIAL.date));
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const isExpired = useMemo(() => {
    return countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  }, [countdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-amber-500/20 to-emerald-700/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />

          <div className="absolute top-3 left-4 text-amber-400/40 animate-pulse">
            <Star className="w-5 h-5" />
          </div>
          <div className="absolute top-6 right-8 text-emerald-400/40 animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-4 left-8 text-amber-400/30 animate-pulse" style={{ animationDelay: "1s" }}>
            <Star className="w-3 h-3" />
          </div>

          <div className="relative px-6 pt-10 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-3">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Concurso Especial · 30 Anos
              </span>
            </div>

            <DialogHeader>
              <DialogTitle className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                {SPECIAL.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {SPECIAL.lottery}
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mt-4"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Prêmio Estimado</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 mt-1">
                {SPECIAL.prize}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Countdown */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {isExpired ? "Sorteio realizado!" : "Contagem Regressiva"}
              </span>
            </div>

            {!isExpired && (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <CountdownUnit value={countdown.days} label="Dias" />
                <span className="text-xl font-bold text-muted-foreground mt-[-20px]">:</span>
                <CountdownUnit value={countdown.hours} label="Horas" />
                <span className="text-xl font-bold text-muted-foreground mt-[-20px]">:</span>
                <CountdownUnit value={countdown.minutes} label="Min" />
                <span className="text-xl font-bold text-muted-foreground mt-[-20px]">:</span>
                <CountdownUnit value={countdown.seconds} label="Seg" />
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary/50 border border-border">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-foreground font-medium">
              Sorteio: Domingo, 24 de Maio de 2026 às 11h
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {SPECIAL.description}
          </p>

          <div className="space-y-2">
            {SPECIAL.highlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  {idx === 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> :
                   idx === 1 ? <PartyPopper className="w-3.5 h-3.5 text-emerald-500" /> :
                   idx === 2 ? <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> :
                   <Gift className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>

          <Button
            className="w-full h-12 text-base font-bold gap-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-amber-600 text-white shadow-lg"
            onClick={() => onGeneratePicks ? onGeneratePicks() : onOpenChange(false)}
          >
            <Sparkles className="w-5 h-5" />
            Gerar Palpites para a Mega-Sena 30 Anos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
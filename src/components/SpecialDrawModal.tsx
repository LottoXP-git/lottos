import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Egg, Gift, Calendar, Clock, TrendingUp, Sparkles, Star, PartyPopper } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpecialDrawModalProps {
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

// Dupla de Páscoa 2025 config
const SPECIAL_DRAW = {
  name: "Dupla de Páscoa",
  lottery: "Dupla Sena",
  concurso: 2774,
  date: new Date("2026-04-04T20:00:00-03:00"), // Sábado de Páscoa 2026
  prize: "R$ 35.000.000,00",
  prizeValue: 35000000,
  description: "O maior prêmio da história da Dupla Sena! Dois sorteios com chances dobradas de ganhar!",
  highlights: [
    "Prêmio estimado de R$ 35 milhões",
    "Dois sorteios independentes",
    "Chances dobradas de ganhar",
    "Não acumula — prêmio é dividido",
  ],
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-3xl font-bold font-mono text-primary"
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

export function SpecialDrawModal({ open, onOpenChange, onGeneratePicks }: SpecialDrawModalProps) {
  const [countdown, setCountdown] = useState<CountdownValues>(getCountdown(SPECIAL_DRAW.date));

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCountdown(getCountdown(SPECIAL_DRAW.date));
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
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600/30 via-amber-500/20 to-violet-600/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          
          {/* Decorative elements */}
          <div className="absolute top-3 left-4 text-amber-400/40 animate-pulse">
            <Star className="w-5 h-5" />
          </div>
          <div className="absolute top-6 right-8 text-rose-400/40 animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute bottom-4 left-8 text-violet-400/30 animate-pulse" style={{ animationDelay: "1s" }}>
            <Star className="w-3 h-3" />
          </div>
          
          <div className="relative px-6 pt-10 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 mb-3">
              <Egg className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Concurso Especial</span>
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                {SPECIAL_DRAW.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {SPECIAL_DRAW.lottery} • Concurso {SPECIAL_DRAW.concurso}
              </DialogDescription>
            </DialogHeader>

            {/* Prize */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mt-4"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Prêmio Estimado</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-rose-400 mt-1">
                {SPECIAL_DRAW.prize}
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

          {/* Date info */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary/50 border border-border">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">
              Sorteio: Sábado, 04 de Abril de 2026 às 20h
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {SPECIAL_DRAW.description}
          </p>

          {/* Highlights */}
          <div className="space-y-2">
            {SPECIAL_DRAW.highlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/10"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {idx === 0 ? <TrendingUp className="w-3.5 h-3.5 text-primary" /> :
                   idx === 1 ? <Gift className="w-3.5 h-3.5 text-primary" /> :
                   idx === 2 ? <Sparkles className="w-3.5 h-3.5 text-primary" /> :
                   <PartyPopper className="w-3.5 h-3.5 text-primary" />}
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <Button
            className="w-full h-12 text-base font-bold gap-2 bg-gradient-to-r from-rose-500 via-primary to-amber-500 hover:from-rose-600 hover:via-primary hover:to-amber-600 text-primary-foreground shadow-lg"
            onClick={() => onGeneratePicks ? onGeneratePicks() : onOpenChange(false)}
          >
            <Sparkles className="w-5 h-5" />
            Gerar Palpites para a Dupla de Páscoa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

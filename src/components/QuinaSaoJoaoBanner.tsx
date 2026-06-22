import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import type { QuinaSaoJoaoStatus } from "@/utils/quinaSaoJoaoDate";

interface Props {
  status: QuinaSaoJoaoStatus;
  onClick: () => void;
  prizeCompact?: string;
}

export function QuinaSaoJoaoBanner({ status, onClick, prizeCompact = "R$ 260" }: Props) {
  const statusBadge =
    status === "live"
      ? { label: "AO VIVO", cls: "bg-rose-500 text-white animate-pulse" }
      : status === "one-day"
      ? { label: "FALTA 1 DIA", cls: "bg-amber-400 text-blue-950 animate-pulse" }
      : status === "finished"
      ? { label: "REALIZADO", cls: "bg-emerald-400 text-emerald-950" }
      : null;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group w-full relative overflow-hidden rounded-3xl border border-orange-400/30 shadow-[0_20px_60px_-20px_rgba(27,95,184,0.6)] text-left"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #2a7bd1 0%, #1B5FB8 40%, #134784 80%, #0c2f5e 100%)",
      }}
    >
      {/* Pattern overlay (subtle São João stars) */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 28%, rgba(255,255,255,0.25), transparent 35%), radial-gradient(circle at 82% 72%, rgba(242,106,31,0.3), transparent 45%)",
        }}
      />
      {/* Light streak */}
      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] pointer-events-none mega30-glint bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Floating orange firework accents */}
      <motion.div
        className="absolute top-3 left-[10%] text-orange-400/70 pointer-events-none"
        animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.div>
      <motion.div
        className="absolute top-2 right-[14%] text-orange-300/70 pointer-events-none"
        animate={{ rotate: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        aria-hidden
      >
        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      </motion.div>
      <motion.div
        className="absolute bottom-3 right-[8%] text-orange-400/60 pointer-events-none"
        animate={{ y: [-2, 3, -2] }}
        transition={{ duration: 4.5, repeat: Infinity }}
        aria-hidden
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-[12%] text-white/60 pointer-events-none"
        animate={{ rotate: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        aria-hidden
      >
        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
      </motion.div>

      <div className="relative px-4 py-5 sm:px-7 sm:py-6 flex items-center gap-4 sm:gap-6">
        {/* LEFT: Brand block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Concurso Especial
            </span>
            {statusBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            )}
          </div>

          <div className="font-black text-white leading-[0.95] drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
            <div className="text-2xl sm:text-4xl tracking-tight">quina de</div>
            <div className="text-3xl sm:text-5xl tracking-tight italic" style={{ color: "#FFD8A8" }}>
              SÃO JOÃO
            </div>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 border border-white/25 backdrop-blur">
            <Sparkles className="w-3 h-3 text-orange-300" />
            <span className="text-[10px] sm:text-xs font-bold text-white tracking-wider">FAÇA A FESTA</span>
          </div>

          <div className="mt-3 hidden sm:block text-xs text-orange-100/80 italic">
            {status === "live"
              ? "Sorteio acontecendo agora — acompanhe os números!"
              : status === "finished"
              ? "Sorteio realizado · Confira o resultado"
              : status === "one-day"
              ? "Última chance — sorteio amanhã às 11h"
              : "Domingo, 28 de Junho · 11h · Não acumula"}
          </div>
        </div>

        {/* RIGHT: Prize "starburst" */}
        <div className="shrink-0 text-right relative">
          {/* Decorative orange burst behind prize */}
          <div
            className="absolute -inset-2 sm:-inset-3 pointer-events-none opacity-90"
            style={{
              background:
                "radial-gradient(circle, rgba(242,106,31,0.55) 0%, rgba(242,106,31,0.25) 50%, transparent 70%)",
              filter: "blur(2px)",
            }}
          />
          <div className="relative">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-orange-100">
              Prêmio Estimado
            </div>
            <div className="font-black text-white text-3xl sm:text-5xl leading-none mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {prizeCompact}
            </div>
            <div className="font-black text-orange-100 text-base sm:text-2xl leading-none mt-0.5 italic">
              MILHÕES
            </div>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-white/95 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-orange-700 shadow">
              NÃO ACUMULA
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/20 backdrop-blur ml-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80">Sorteio</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">28/06</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent strip */}
      <div className="relative h-1 bg-gradient-to-r from-orange-400 via-orange-300 to-orange-500" />
    </motion.button>
  );
}
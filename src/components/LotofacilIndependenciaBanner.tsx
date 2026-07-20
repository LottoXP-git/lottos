import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import type { LotofacilIndependenciaStatus } from "@/utils/lotofacilIndependenciaDate";

interface Props {
  status: LotofacilIndependenciaStatus;
  onClick: () => void;
  prizeCompact?: string;
}

export function LotofacilIndependenciaBanner({ status, onClick, prizeCompact = "R$ 300" }: Props) {
  const statusBadge =
    status === "live"
      ? { label: "AO VIVO", cls: "bg-white text-pink-700 animate-pulse" }
      : status === "one-day"
      ? { label: "FALTA 1 DIA", cls: "bg-pink-200 text-pink-900 animate-pulse" }
      : status === "finished"
      ? { label: "REALIZADO", cls: "bg-white text-pink-700" }
      : null;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group w-full relative overflow-hidden rounded-3xl border border-pink-300/40 shadow-[0_20px_60px_-20px_rgba(190,24,93,0.6)] text-left"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, hsl(310 80% 48%) 0%, hsl(310 80% 38%) 40%, hsl(310 85% 28%) 80%, hsl(310 90% 16%) 100%)",
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 28%, rgba(255,255,255,0.25), transparent 35%), radial-gradient(circle at 82% 72%, rgba(255,192,203,0.4), transparent 45%)",
        }}
      />
      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] pointer-events-none mega30-glint bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <motion.div
        className="absolute top-3 left-[10%] text-pink-100/70 pointer-events-none"
        animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-hidden
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.div>
      <motion.div
        className="absolute top-2 right-[14%] text-white/70 pointer-events-none"
        animate={{ rotate: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        aria-hidden
      >
        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      </motion.div>
      <motion.div
        className="absolute bottom-3 right-[8%] text-pink-100/60 pointer-events-none"
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

      <div className="relative px-4 py-4 sm:px-7 sm:py-6 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6 text-center sm:text-left">
        <div className="w-full sm:flex-1 sm:min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-pink-100">
              Concurso Especial · #3780
            </span>
            {statusBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            )}
          </div>

          <div className="font-black text-white leading-[0.95] drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
            <div className="text-xl sm:text-4xl tracking-tight">lotofácil da</div>
            <div className="text-2xl sm:text-5xl tracking-tight italic" style={{ color: "#FFD1E8" }}>
              INDEPENDÊNCIA
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 border border-white/25 backdrop-blur">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-[10px] sm:text-xs font-bold text-white tracking-wider">7 DE SETEMBRO</span>
            </div>
            <div className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/20 backdrop-blur">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">Sorteio</span>
              <span className="text-[10px] font-extrabold text-white">15/09</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] sm:text-xs text-pink-50/80 italic">
            {status === "live"
              ? "Sorteio acontecendo agora — acompanhe os números!"
              : status === "finished"
              ? "Sorteio realizado · Confira o resultado"
              : status === "one-day"
              ? "Última chance — sorteio amanhã às 11h"
              : "Ter, 15 de Setembro · 11h · Não acumula"}
          </div>
        </div>

        <div className="w-full sm:w-auto sm:shrink-0 text-center sm:text-right relative">
          <div
            className="absolute -inset-2 sm:-inset-3 pointer-events-none opacity-90"
            style={{
              background:
                "radial-gradient(circle, rgba(255,182,203,0.5) 0%, rgba(255,182,203,0.22) 50%, transparent 70%)",
              filter: "blur(2px)",
            }}
          />
          <div className="relative flex flex-col items-center sm:items-end">
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-pink-50">
              Prêmio Estimado
            </div>
            <div className="font-black text-white text-2xl sm:text-5xl leading-none mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {prizeCompact}
            </div>
            <div className="font-black text-pink-100 text-sm sm:text-2xl leading-none mt-0.5 italic">
              MILHÕES
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <div className="inline-block px-2 py-0.5 rounded-md bg-white/95 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-pink-700 shadow">
                NÃO ACUMULA
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/20 backdrop-blur">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80">Sorteio</span>
                <span className="text-xs sm:text-sm font-extrabold text-white">15/09</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-1 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-400" />
    </motion.button>
  );
}
import { motion } from "framer-motion";
import megaPoster from "@/assets/mega30-poster.jpg";
import type { MegaSena30Status } from "@/utils/megaSena30Date";

interface Props {
  status: MegaSena30Status;
  onClick: () => void;
}

function CloverIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <g fill="currentColor">
        <path d="M32 32c-3-9 3-18 11-18 6 0 10 5 9 11-1 7-9 11-20 7z" />
        <path d="M32 32c9-3 18 3 18 11 0 6-5 10-11 9-7-1-11-9-7-20z" />
        <path d="M32 32c3 9-3 18-11 18-6 0-10-5-9-11 1-7 9-11 20-7z" />
        <path d="M32 32c-9 3-18-3-18-11 0-6 5-10 11-9 7 1 11 9 7 20z" />
        <circle cx="32" cy="32" r="3" />
      </g>
    </svg>
  );
}

function Balloon({ className = "", variant = 1, gradientId }: { className?: string; variant?: 1 | 2 | 3 | 4; gradientId: string }) {
  const variantCls = variant === 2 ? "mega30-balloon-2" : variant === 3 ? "mega30-balloon-3" : variant === 4 ? "mega30-balloon-4" : "";
  return (
    <div className={`absolute pointer-events-none mega30-balloon ${variantCls} ${className}`} aria-hidden>
      <svg viewBox="0 0 40 56" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFE7A0" />
            <stop offset="40%" stopColor="#E2B14A" />
            <stop offset="100%" stopColor="#7A5210" />
          </radialGradient>
        </defs>
        <ellipse cx="20" cy="20" rx="16" ry="19" fill={`url(#${gradientId})`} />
        <ellipse cx="14" cy="13" rx="4" ry="6" fill="#FFF6D5" opacity="0.6" />
        <path d="M20 39 L18 44 L22 44 Z" fill="#8B6314" />
        <path d="M20 44 Q18 50 20 56 Q22 50 20 44" stroke="#C9A24E" strokeWidth="0.6" fill="none" />
      </svg>
    </div>
  );
}

export function MegaSena30Banner({ status, onClick }: Props) {
  const statusBadge =
    status === "live"
      ? { label: "AO VIVO", cls: "bg-rose-500 text-white animate-pulse" }
      : status === "one-day"
      ? { label: "FALTA 1 DIA", cls: "bg-amber-400 text-emerald-950 animate-pulse" }
      : status === "finished"
      ? { label: "REALIZADO", cls: "bg-emerald-400 text-emerald-950" }
      : null;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group w-full relative overflow-hidden rounded-3xl border border-emerald-400/30 shadow-[0_20px_60px_-20px_rgba(16,75,40,0.6)] text-left"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #1f6b3a 0%, #0f3d22 40%, #082817 80%, #051a0e 100%)",
      }}
    >
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,215,120,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,215,120,0.1), transparent 50%)",
        }}
      />
      {/* Diagonal light streak */}
      <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] pointer-events-none mega30-glint bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />

      {/* Decorative balloons */}
      <Balloon className="w-6 h-9 sm:w-8 sm:h-12 top-3 left-[12%]" variant={1} gradientId="mega30-b1" />
      <Balloon className="w-5 h-7 sm:w-7 sm:h-10 top-1 left-[28%] opacity-80" variant={2} gradientId="mega30-b2" />
      <Balloon className="w-7 h-10 sm:w-9 sm:h-13 top-4 right-[18%]" variant={3} gradientId="mega30-b3" />
      <Balloon className="w-5 h-7 sm:w-6 sm:h-9 bottom-2 right-[8%] opacity-70" variant={4} gradientId="mega30-b4" />

      <div className="relative px-4 py-5 sm:px-7 sm:py-6 flex items-center gap-4 sm:gap-6">
        {/* LEFT: Brand block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/80">
              Concurso Especial
            </span>
            {statusBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            )}
          </div>

          <div className="flex items-end gap-2 sm:gap-3 leading-none">
            <div className="font-black text-lime-300 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]">
              <div className="text-2xl sm:text-4xl tracking-tight">MEGA</div>
              <div className="text-2xl sm:text-4xl tracking-tight -mt-1">SENA</div>
            </div>
            <div className="relative flex items-end">
              <span className="font-black text-white text-5xl sm:text-7xl leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                30
              </span>
              <CloverIcon className="mega30-clover absolute -top-1 -right-3 sm:-right-4 w-5 h-5 sm:w-7 sm:h-7 text-lime-300" />
              <span className="ml-1 sm:ml-2 mb-1 sm:mb-2 italic font-light text-lime-300 text-xs sm:text-base">
                anos
              </span>
            </div>
          </div>

          <div className="mt-3 hidden sm:block text-xs text-emerald-100/80 italic">
            {status === "live"
              ? "Sorteio acontecendo agora — acompanhe os números!"
              : status === "finished"
              ? "Sorteio realizado · Confira o resultado"
              : status === "one-day"
              ? "Última chance — sorteio amanhã às 11h"
              : "Domingo, 24 de Maio · 11h · Não acumula"}
          </div>
        </div>

        {/* RIGHT: Prize + date */}
        <div className="shrink-0 text-right">
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/70">
            Prêmio estimado
          </div>
          <div
            className="mega30-shimmer font-black text-3xl sm:text-5xl leading-none mt-1 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            style={{
              backgroundImage:
                "linear-gradient(110deg, #B07A1C 0%, #F0C24C 30%, #FFF6D5 50%, #F0C24C 70%, #B07A1C 100%)",
            }}
          >
            R$ 150
          </div>
          <div
            className="font-black text-base sm:text-2xl leading-none mt-0.5 bg-clip-text text-transparent italic"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #FFE69A 0%, #C99528 100%)",
            }}
          >
            MILHÕES
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/20 backdrop-blur">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80">Sorteio</span>
            <span className="text-xs sm:text-sm font-extrabold text-white">24/05</span>
          </div>
        </div>
      </div>

      {/* Bottom accent strip */}
      <div className="relative h-1 bg-gradient-to-r from-lime-400 via-amber-300 to-lime-400" />
    </motion.button>
  );
}

// Re-export poster path so other modules (e.g. modal) can use it.
export { megaPoster };

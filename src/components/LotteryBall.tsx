import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
  animated?: boolean;
  delay?: number;
}

const sizeClasses = {
  // Auto-scaling based on screen density:
  // - Compact phones (<375px): smaller balls
  // - Normal phones (375-413px): medium balls
  // - Large phones (≥414px): larger balls
  // - Tablets/desktop (sm+): even larger
  xs: "w-6 h-6 text-[10px] min-[375px]:w-7 min-[375px]:h-7 min-[375px]:text-xs min-[414px]:w-8 min-[414px]:h-8 min-[414px]:text-sm sm:w-8 sm:h-8 sm:text-sm",
  sm: "w-8 h-8 text-xs min-[375px]:w-10 min-[375px]:h-10 min-[375px]:text-sm min-[414px]:w-11 min-[414px]:h-11 min-[414px]:text-base sm:w-11 sm:h-11 sm:text-base",
  md: "w-10 h-10 text-sm min-[375px]:w-12 min-[375px]:h-12 min-[375px]:text-base min-[414px]:w-14 min-[414px]:h-14 min-[414px]:text-lg sm:w-14 sm:h-14 sm:text-lg",
  lg: "w-12 h-12 text-base min-[375px]:w-14 min-[375px]:h-14 min-[375px]:text-lg min-[414px]:w-16 min-[414px]:h-16 min-[414px]:text-xl sm:w-16 sm:h-16 sm:text-xl",
};

const variantClasses = {
  default: "bg-gradient-to-br from-primary to-orange-600",
  megasena: "bg-gradient-to-br from-lottery-megasena to-emerald-800",
  lotofacil: "bg-gradient-to-br from-lottery-lotofacil to-fuchsia-900",
  quina: "bg-gradient-to-br from-lottery-quina to-indigo-900",
  lotomania: "bg-gradient-to-br from-lottery-lotomania to-orange-700",
  duplasena: "bg-gradient-to-br from-lottery-duplasena to-rose-800",
  diadesorte: "bg-gradient-to-br from-amber-500 to-amber-700",
  supersete: "bg-gradient-to-br from-lime-500 to-lime-700",
  maismilionaria: "bg-gradient-to-br from-indigo-500 to-indigo-800",
  timemania: "bg-gradient-to-br from-green-500 to-green-700",
  federal: "bg-gradient-to-br from-sky-500 to-sky-700",
  loteca: "bg-gradient-to-br from-red-500 to-red-800",
};

export function LotteryBall({
  number,
  size = "md",
  variant = "default",
  animated = true,
  delay = 0,
}: LotteryBallProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-mono font-bold shadow-lg transition-all duration-300 hover:scale-110 text-white leading-none",
        sizeClasses[size],
        variantClasses[variant],
        animated && "animate-bounce-in opacity-0"
      )}
      style={{
        ...(animated ? { animationDelay: `${delay}ms`, animationFillMode: "forwards" } : {}),
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
}

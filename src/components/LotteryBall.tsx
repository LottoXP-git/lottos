import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
  animated?: boolean;
  delay?: number;
  temperature?: "hot" | "warm" | "cold";
  title?: string;
  entrance?: "bounce" | "cascade" | "flip" | "pop" | "spin";
}

const sizeClasses = {
  // Auto-scaling based on screen density:
  // - Compact phones (<375px): smaller balls
  // - Normal phones (375-413px): medium balls
  // - Large phones (≥414px): larger balls
  // - Tablets/desktop (sm+): even larger
  xs: "w-7 h-7 text-xs min-[375px]:w-8 min-[375px]:h-8 min-[375px]:text-sm min-[414px]:w-9 min-[414px]:h-9 min-[414px]:text-base sm:w-9 sm:h-9 sm:text-base",
  sm: "w-9 h-9 text-sm min-[375px]:w-10 min-[375px]:h-10 min-[375px]:text-base min-[414px]:w-12 min-[414px]:h-12 min-[414px]:text-lg sm:w-12 sm:h-12 sm:text-lg",
  md: "w-11 h-11 text-base min-[375px]:w-13 min-[375px]:h-13 min-[375px]:text-lg min-[414px]:w-14 min-[414px]:h-14 min-[414px]:text-xl sm:w-14 sm:h-14 sm:text-xl",
  lg: "w-13 h-13 text-lg min-[375px]:w-14 min-[375px]:h-14 min-[375px]:text-xl min-[414px]:w-16 min-[414px]:h-16 min-[414px]:text-2xl sm:w-16 sm:h-16 sm:text-2xl",
};

const variantClasses = {
  // Darker, deeper gradients for stronger contrast against white text in any lighting
  default: "bg-gradient-to-br from-orange-600 to-orange-800",
  megasena: "bg-gradient-to-br from-emerald-700 to-emerald-900",
  lotofacil: "bg-gradient-to-br from-purple-700 to-fuchsia-900",
  quina: "bg-gradient-to-br from-blue-800 to-indigo-950",
  lotomania: "bg-gradient-to-br from-orange-600 to-orange-800",
  duplasena: "bg-gradient-to-br from-rose-700 to-rose-900",
  diadesorte: "bg-gradient-to-br from-amber-600 to-amber-800",
  supersete: "bg-gradient-to-br from-lime-700 to-green-900",
  maismilionaria: "bg-gradient-to-br from-indigo-700 to-indigo-950",
  timemania: "bg-gradient-to-br from-green-700 to-green-900",
  federal: "bg-gradient-to-br from-sky-700 to-blue-900",
  loteca: "bg-gradient-to-br from-red-700 to-red-900",
};

const temperatureRingClasses: Record<NonNullable<LotteryBallProps["temperature"]>, string> = {
  hot: "ring-2 ring-orange-400 shadow-[0_0_8px_hsl(25_95%_55%/0.6)]",
  warm: "ring-2 ring-yellow-300/80",
  cold: "ring-2 ring-sky-300 shadow-[0_0_8px_hsl(200_90%_60%/0.5)]",
};

export function LotteryBall({
  number,
  size = "md",
  variant = "default",
  animated = true,
  delay = 0,
  temperature,
  title,
  entrance = "bounce",
}: LotteryBallProps) {
  const entranceClass = {
    bounce: "ball-entrance-bounce",
    cascade: "ball-entrance-cascade",
    flip: "ball-entrance-flip",
    pop: "ball-entrance-pop",
    spin: "ball-entrance-spin",
  }[entrance];
  return (
    <div
      title={title}
      className={cn(
        "rounded-full flex items-center justify-center font-mono font-extrabold shadow-lg transition-all duration-300 hover:scale-110 text-white leading-none",
        temperature ? temperatureRingClasses[temperature] : "ring-2 ring-white/90",
        sizeClasses[size],
        variantClasses[variant],
        animated && entranceClass
      )}
      style={{
        ...(animated ? { animationDelay: `${delay}ms`, animationFillMode: "forwards" } : {}),
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textShadow: "0 1px 2px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.5)",
      }}
    >
      {variant === "supersete" ? number.toString() : number.toString().padStart(2, "0")}
    </div>
  );
}

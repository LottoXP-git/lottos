import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria";
  animated?: boolean;
  delay?: number;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
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
        "rounded-full flex items-center justify-center font-mono font-bold shadow-lg transition-all duration-300 hover:scale-110 text-white",
        sizeClasses[size],
        variantClasses[variant],
        animated && "animate-bounce-in opacity-0"
      )}
      style={animated ? { animationDelay: `${delay}ms`, animationFillMode: "forwards" } : undefined}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena";
  animated?: boolean;
  delay?: number;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
};

const variantClasses = {
  default: "bg-gradient-to-br from-primary to-yellow-600",
  megasena: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  lotofacil: "bg-gradient-to-br from-purple-500 to-purple-700",
  quina: "bg-gradient-to-br from-blue-500 to-blue-700",
  lotomania: "bg-gradient-to-br from-orange-500 to-orange-700",
  duplasena: "bg-gradient-to-br from-rose-500 to-rose-700",
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

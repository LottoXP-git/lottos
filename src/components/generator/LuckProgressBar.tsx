import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LuckLevel } from "@/hooks/useLuckProgress";

interface LuckProgressBarProps {
  level: LuckLevel;
  nextLevel?: LuckLevel;
  xp: number;
  progress: number; // 0..100
  streakDays: number;
  totalPicks: number;
}

export function LuckProgressBar({
  level,
  nextLevel,
  xp,
  progress,
  streakDays,
  totalPicks,
}: LuckProgressBarProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-2.5 sm:p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base sm:text-lg leading-none" aria-hidden>
            {level.emoji}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] sm:text-xs font-bold text-foreground truncate leading-tight">
              {level.name}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">
              {nextLevel
                ? `${xp} / ${nextLevel.threshold} XP`
                : `${xp} XP — nível máximo`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <motion.div
            animate={
              streakDays > 0
                ? { scale: [1, 1.15, 1] }
                : {}
            }
            transition={{ duration: 1.4, repeat: Infinity }}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-bold",
              streakDays > 0
                ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
                : "bg-muted/30 border-border text-muted-foreground"
            )}
            title={streakDays > 0 ? `Sequência de ${streakDays} dia${streakDays > 1 ? "s" : ""}` : "Gere um palpite hoje para iniciar sua sequência"}
          >
            <Flame className="w-3 h-3" />
            {streakDays}
          </motion.div>
          <div
            className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] sm:text-xs font-bold text-primary"
            title={`Você gerou ${totalPicks} palpite${totalPicks !== 1 ? "s" : ""}`}
          >
            <Sparkles className="w-3 h-3" />
            {totalPicks}
          </div>
        </div>
      </div>

      <div className="h-1.5 sm:h-2 rounded-full bg-secondary/60 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-yellow-500 to-amber-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}
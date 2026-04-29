import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RarityInfo } from "@/lib/pickRarity";

interface PickRarityBadgeProps {
  info: RarityInfo;
  className?: string;
}

export function PickRarityBadge({ info, className }: PickRarityBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 16 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-bold",
        info.badgeClass,
        className
      )}
      title={info.description}
    >
      <span aria-hidden>{info.emoji}</span>
      <span>Palpite {info.label}</span>
    </motion.div>
  );
}
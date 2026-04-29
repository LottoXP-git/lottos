import type { BetAnalysis } from "./lotteryStats";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface RarityInfo {
  level: Rarity;
  label: string;
  emoji: string;
  /** Tailwind classes for badge background + text */
  badgeClass: string;
  /** Tailwind classes for the glow ring around the bet area */
  glowClass: string;
  /** Short copy displayed near the badge */
  description: string;
}

const RARITY_MAP: Record<Rarity, Omit<RarityInfo, "level">> = {
  common: {
    label: "Comum",
    emoji: "🎲",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    glowClass: "",
    description: "Combinação típica.",
  },
  rare: {
    label: "Raro",
    emoji: "✨",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    glowClass: "shadow-[0_0_25px_-5px_hsl(200_90%_60%/0.5)]",
    description: "Distribuição equilibrada.",
  },
  epic: {
    label: "Épico",
    emoji: "💜",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    glowClass: "shadow-[0_0_30px_-5px_hsl(280_80%_65%/0.55)]",
    description: "Mix raro de quentes e frias.",
  },
  legendary: {
    label: "Lendário",
    emoji: "👑",
    badgeClass:
      "bg-gradient-to-r from-amber-400/30 to-yellow-500/30 text-amber-200 border-amber-400/60",
    glowClass:
      "shadow-[0_0_40px_-5px_hsl(45_95%_60%/0.7)] ring-1 ring-amber-400/40",
    description: "Combinação muito incomum!",
  },
};

/**
 * Heuristic rarity score based on:
 *  - balance of hot/warm/cold (more diversity = rarer)
 *  - sum inside expected range
 *  - even/odd balance
 *  - low/high balance
 * Plus a tiny random spice so two equal-looking palpites can still feel distinct.
 */
export function computeRarity(analysis: BetAnalysis): RarityInfo {
  let score = 0;

  const total = analysis.hotCount + analysis.warmCount + analysis.coldCount;
  if (total > 0) {
    const distinctTemps =
      (analysis.hotCount > 0 ? 1 : 0) +
      (analysis.warmCount > 0 ? 1 : 0) +
      (analysis.coldCount > 0 ? 1 : 0);
    score += distinctTemps; // 1..3
  }

  if (analysis.sumInRange) score += 1;
  if (Math.abs(analysis.evenCount - analysis.oddCount) <= 1) score += 1;
  if (Math.abs(analysis.lowCount - analysis.highCount) <= 1) score += 1;

  // tiny chaos so feeling isn't deterministic
  score += Math.random() < 0.12 ? 1 : 0;

  let level: Rarity = "common";
  if (score >= 6) level = "legendary";
  else if (score >= 5) level = "epic";
  else if (score >= 3) level = "rare";

  return { level, ...RARITY_MAP[level] };
}

export function rarityInfo(level: Rarity): RarityInfo {
  return { level, ...RARITY_MAP[level] };
}
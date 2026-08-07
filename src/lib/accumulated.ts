import type { LotteryResult } from "@/data/lotteryData";

/** Converte "R$ 42.350.000,00" em número. */
export function parsePrizeValue(prize: string | undefined): number {
  if (!prize) return 0;
  const cleaned = prize.replace(/[R$\s.]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Regra única de "ACUMULOU": sem ganhadores na faixa principal e o prêmio
 * estimado do próximo concurso maior que o da faixa principal atual.
 * Federal nunca acumula.
 */
export function isAccumulated(result: Pick<LotteryResult, "id" | "winners" | "prize" | "nextPrize">): boolean {
  if (result.id === "federal") return false;
  if (result.winners !== 0) return false;
  return parsePrizeValue(result.nextPrize) > parsePrizeValue(result.prize);
}

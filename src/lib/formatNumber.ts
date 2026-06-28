/**
 * Format a lottery number for display. Super Sete uses single digits 0-9;
 * all other lotteries use two-digit zero-padding (e.g. 07, 12).
 */
export function formatLotteryNumber(n: number, lotteryId?: string): string {
  if (lotteryId === "supersete") return n.toString();
  return n.toString().padStart(2, "0");
}
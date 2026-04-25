import type { NumberFrequency } from "@/data/lotteryData";

export type Temperature = "hot" | "warm" | "cold";

/** C(n, k) using a numerically safe loop. Returns Infinity if overflow risk. */
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i;
  }
  return Math.round(result);
}

/** Returns the odds denominator (e.g. 50063860 for Mega-Sena 6/60). */
export function calculateOdds(maxNumber: number, selectCount: number): number {
  return combinations(maxNumber, selectCount);
}

/** Format odds as "1 em X" using pt-BR thousands separator. */
export function formatOdds(odds: number): string {
  if (!isFinite(odds) || odds <= 0) return "—";
  return `1 em ${odds.toLocaleString("pt-BR")}`;
}

/**
 * Builds a Map<number, Temperature> by classifying each number into thirds:
 * top 33% by frequency = hot, middle 34% = warm, bottom 33% = cold.
 */
export function buildTemperatureMap(
  frequencyData: NumberFrequency[]
): Map<number, Temperature> {
  const sorted = [...frequencyData].sort((a, b) => b.frequency - a.frequency);
  const total = sorted.length;
  const hotCutoff = Math.floor(total / 3);
  const warmCutoff = Math.floor((total * 2) / 3);
  const map = new Map<number, Temperature>();
  sorted.forEach((item, idx) => {
    if (idx < hotCutoff) map.set(item.number, "hot");
    else if (idx < warmCutoff) map.set(item.number, "warm");
    else map.set(item.number, "cold");
  });
  return map;
}

export interface BetAnalysis {
  odds: number;
  oddsLabel: string;
  hotCount: number;
  warmCount: number;
  coldCount: number;
  sum: number;
  expectedSumMin: number;
  expectedSumMax: number;
  sumInRange: boolean;
  evenCount: number;
  oddCount: number;
  lowCount: number;
  highCount: number;
  midpoint: number;
  justification: string;
  perNumber: Array<{ number: number; frequency: number; temperature: Temperature }>;
}

export function analyzeBet(
  numbers: number[],
  frequencyData: NumberFrequency[],
  maxNumber: number,
  selectCount: number,
  strategy: "hot" | "cold" | "balanced"
): BetAnalysis {
  const tempMap = buildTemperatureMap(frequencyData);
  const freqMap = new Map(frequencyData.map((f) => [f.number, f.frequency]));

  const perNumber = numbers.map((n) => ({
    number: n,
    frequency: freqMap.get(n) ?? 0,
    temperature: (tempMap.get(n) ?? "warm") as Temperature,
  }));

  const hotCount = perNumber.filter((p) => p.temperature === "hot").length;
  const warmCount = perNumber.filter((p) => p.temperature === "warm").length;
  const coldCount = perNumber.filter((p) => p.temperature === "cold").length;

  const sum = numbers.reduce((acc, n) => acc + n, 0);
  // Expected sum range: roughly mean ± 15% of (selectCount * maxNumber / 2)
  const expectedMean = (selectCount * (maxNumber + 1)) / 2;
  const spread = expectedMean * 0.18;
  const expectedSumMin = Math.round(expectedMean - spread);
  const expectedSumMax = Math.round(expectedMean + spread);
  const sumInRange = sum >= expectedSumMin && sum <= expectedSumMax;

  const evenCount = numbers.filter((n) => n % 2 === 0).length;
  const oddCount = numbers.length - evenCount;

  const midpoint = Math.ceil(maxNumber / 2);
  const lowCount = numbers.filter((n) => n <= midpoint).length;
  const highCount = numbers.length - lowCount;

  const odds = calculateOdds(maxNumber, selectCount);

  // Build justification
  const parts: string[] = [];
  if (strategy === "hot") {
    parts.push(`Estratégia "Quentes": ${hotCount} de ${selectCount} dezenas estão entre as mais sorteadas historicamente.`);
  } else if (strategy === "cold") {
    parts.push(`Estratégia "Frias": ${coldCount} de ${selectCount} dezenas estão entre as menos sorteadas, com base na teoria do "atraso".`);
  } else {
    parts.push(`Palpite equilibrado com ${hotCount} quente${hotCount !== 1 ? "s" : ""}, ${warmCount} morna${warmCount !== 1 ? "s" : ""} e ${coldCount} fria${coldCount !== 1 ? "s" : ""}.`);
  }
  if (sumInRange) {
    parts.push(`Soma ${sum} dentro da faixa típica (${expectedSumMin}–${expectedSumMax}).`);
  } else {
    parts.push(`Soma ${sum} fora da faixa típica (${expectedSumMin}–${expectedSumMax}) — combinação menos comum.`);
  }
  const balanceParImpar = Math.abs(evenCount - oddCount) <= 1;
  if (balanceParImpar) {
    parts.push(`Pares e ímpares equilibrados (${evenCount}/${oddCount}).`);
  }
  const balanceLowHigh = Math.abs(lowCount - highCount) <= 1;
  if (balanceLowHigh) {
    parts.push(`Distribuição entre baixas e altas equilibrada (${lowCount}/${highCount}).`);
  }

  return {
    odds,
    oddsLabel: formatOdds(odds),
    hotCount,
    warmCount,
    coldCount,
    sum,
    expectedSumMin,
    expectedSumMax,
    sumInRange,
    evenCount,
    oddCount,
    lowCount,
    highCount,
    midpoint,
    justification: parts.join(" "),
    perNumber,
  };
}

import { LotteryResult } from "./lotteryData";

// Generate historical results for the last 100 draws of each lottery
const generateHistoricalResults = (
  id: string,
  name: string,
  color: string,
  maxNumber: number,
  selectCount: number,
  startConcurso: number,
  startDate: Date
): LotteryResult[] => {
  const results: LotteryResult[] = [];
  
  for (let i = 0; i < 100; i++) {
    const concurso = startConcurso - i;
    const date = new Date(startDate);
    date.setDate(date.getDate() - (i * 3)); // Approximately 3 days between draws
    
    // Generate random unique numbers
    const numbers: number[] = [];
    while (numbers.length < selectCount) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    numbers.sort((a, b) => a - b);
    
    const prize = (Math.random() * 50 + 1).toFixed(3).replace(".", ",");
    const winners = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
    
    results.push({
      id,
      name,
      concurso,
      date: date.toLocaleDateString("pt-BR"),
      numbers,
      prize: `R$ ${prize}.000,00`,
      winners,
      nextPrize: "",
      nextDate: "",
      color,
      maxNumber,
      selectCount,
    });
  }
  
  return results;
};

export const historicalMegaSena = generateHistoricalResults(
  "megasena",
  "Mega-Sena",
  "lottery-megasena",
  60,
  6,
  2789,
  new Date("2025-02-01")
);

export const historicalLotofacil = generateHistoricalResults(
  "lotofacil",
  "Lotofácil",
  "lottery-lotofacil",
  25,
  15,
  3245,
  new Date("2025-02-01")
);

export const historicalQuina = generateHistoricalResults(
  "quina",
  "Quina",
  "lottery-quina",
  80,
  5,
  6567,
  new Date("2025-02-01")
);

export const historicalLotomania = generateHistoricalResults(
  "lotomania",
  "Lotomania",
  "lottery-lotomania",
  100,
  20,
  2589,
  new Date("2025-01-31")
);

export const historicalDuplaSena = generateHistoricalResults(
  "duplasena",
  "Dupla Sena",
  "lottery-duplasena",
  50,
  6,
  2678,
  new Date("2025-02-01")
);

export const allHistoricalResults: LotteryResult[] = [
  ...historicalMegaSena,
  ...historicalLotofacil,
  ...historicalQuina,
  ...historicalLotomania,
  ...historicalDuplaSena,
].sort((a, b) => {
  const dateA = a.date.split("/").reverse().join("");
  const dateB = b.date.split("/").reverse().join("");
  return dateB.localeCompare(dateA);
});

export const getLotteryHistory = (lotteryId?: string): LotteryResult[] => {
  if (!lotteryId || lotteryId === "all") {
    return allHistoricalResults;
  }
  return allHistoricalResults.filter((r) => r.id === lotteryId);
};

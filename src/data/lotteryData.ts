export interface LotteryResult {
  id: string;
  name: string;
  concurso: number;
  date: string;
  numbers: number[];
  trevos?: number[];
  prize: string;
  winners: number;
  nextPrize: string;
  nextDate: string;
  color: string;
  maxNumber: number;
  selectCount: number;
}

export interface NumberFrequency {
  number: number;
  frequency: number;
  percentage: number;
}

// Simulated recent results (in production, this would come from Caixa API)
export const lotteryResults: LotteryResult[] = [
  {
    id: "megasena",
    name: "Mega-Sena",
    concurso: 2789,
    date: "01/02/2025",
    numbers: [7, 15, 23, 38, 45, 59],
    prize: "R$ 42.350.000,00",
    winners: 0,
    nextPrize: "R$ 55.000.000,00",
    nextDate: "04/02/2025",
    color: "lottery-megasena",
    maxNumber: 60,
    selectCount: 6,
  },
  {
    id: "lotofacil",
    name: "Lotofácil",
    concurso: 3245,
    date: "01/02/2025",
    numbers: [1, 3, 5, 7, 8, 10, 11, 14, 15, 17, 18, 19, 21, 23, 25],
    prize: "R$ 1.890.000,00",
    winners: 2,
    nextPrize: "R$ 1.700.000,00",
    nextDate: "03/02/2025",
    color: "lottery-lotofacil",
    maxNumber: 25,
    selectCount: 15,
  },
  {
    id: "quina",
    name: "Quina",
    concurso: 6567,
    date: "01/02/2025",
    numbers: [12, 28, 45, 56, 72],
    prize: "R$ 8.500.000,00",
    winners: 1,
    nextPrize: "R$ 3.200.000,00",
    nextDate: "03/02/2025",
    color: "lottery-quina",
    maxNumber: 80,
    selectCount: 5,
  },
  {
    id: "lotomania",
    name: "Lotomania",
    concurso: 2589,
    date: "31/01/2025",
    numbers: [2, 5, 11, 18, 23, 29, 34, 41, 48, 55, 62, 69, 74, 78, 82, 87, 91, 94, 97, 99],
    prize: "R$ 4.200.000,00",
    winners: 0,
    nextPrize: "R$ 6.500.000,00",
    nextDate: "03/02/2025",
    color: "lottery-lotomania",
    maxNumber: 100,
    selectCount: 20,
  },
  {
    id: "duplasena",
    name: "Dupla Sena",
    concurso: 2678,
    date: "01/02/2025",
    numbers: [8, 17, 25, 33, 41, 49],
    prize: "R$ 2.100.000,00",
    winners: 0,
    nextPrize: "R$ 3.800.000,00",
    nextDate: "04/02/2025",
    color: "lottery-duplasena",
    maxNumber: 50,
    selectCount: 6,
  },
  {
    id: "diadesorte",
    name: "Dia de Sorte",
    concurso: 1172,
    date: "03/02/2025",
    numbers: [6, 12, 16, 20, 21, 28, 29],
    prize: "R$ 1.500.000,00",
    winners: 0,
    nextPrize: "R$ 2.200.000,00",
    nextDate: "06/02/2025",
    color: "lottery-diadesorte",
    maxNumber: 31,
    selectCount: 7,
  },
  {
    id: "supersete",
    name: "Super Sete",
    concurso: 807,
    date: "04/02/2025",
    numbers: [0, 3, 3, 5, 6, 9, 9],
    prize: "R$ 800.000,00",
    winners: 0,
    nextPrize: "R$ 1.100.000,00",
    nextDate: "07/02/2025",
    color: "lottery-supersete",
    maxNumber: 10,
    selectCount: 7,
  },
  {
    id: "maismilionaria",
    name: "+Milionária",
    concurso: 326,
    date: "04/02/2025",
    numbers: [3, 5, 16, 20, 29, 34, 35, 42],
    prize: "R$ 150.000.000,00",
    winners: 0,
    nextPrize: "R$ 200.000.000,00",
    nextDate: "08/02/2025",
    color: "lottery-maismilionaria",
    maxNumber: 50,
    selectCount: 6,
  },
  {
    id: "timemania",
    name: "Timemania",
    concurso: 2178,
    date: "01/02/2025",
    numbers: [5, 18, 27, 36, 44, 62, 71],
    prize: "R$ 6.500.000,00",
    winners: 0,
    nextPrize: "R$ 8.200.000,00",
    nextDate: "04/02/2025",
    color: "lottery-timemania",
    maxNumber: 80,
    selectCount: 7,
  },
  {
    id: "federal",
    name: "Federal",
    concurso: 5890,
    date: "01/02/2025",
    numbers: [12345, 67890, 54321, 98765, 11223],
    prize: "R$ 500.000,00",
    winners: 5,
    nextPrize: "R$ 500.000,00",
    nextDate: "05/02/2025",
    color: "lottery-federal",
    maxNumber: 99999,
    selectCount: 5,
  },
];

// Simulated historical frequency data (last 100 draws)
export const generateFrequencyData = (maxNumber: number): NumberFrequency[] => {
  return Array.from({ length: maxNumber }, (_, i) => {
    const frequency = Math.floor(Math.random() * 50) + 10;
    return {
      number: i + 1,
      frequency,
      percentage: (frequency / 100) * 100,
    };
  }).sort((a, b) => b.frequency - a.frequency);
};

export const getMostFrequent = (data: NumberFrequency[], count: number): number[] => {
  return data.slice(0, count).map(d => d.number).sort((a, b) => a - b);
};

export const getLeastFrequent = (data: NumberFrequency[], count: number): number[] => {
  return data.slice(-count).map(d => d.number).sort((a, b) => a - b);
};

export const generateSmartPicks = (
  frequencyData: NumberFrequency[],
  count: number,
  strategy: 'hot' | 'cold' | 'balanced'
): number[] => {
  let picks: number[] = [];
  
  switch (strategy) {
    case 'hot':
      // Pick from most frequent numbers
      picks = frequencyData.slice(0, count * 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(d => d.number);
      break;
    case 'cold':
      // Pick from least frequent numbers
      picks = frequencyData.slice(-count * 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(d => d.number);
      break;
    case 'balanced':
      // Mix of hot and cold numbers
      const hotCount = Math.ceil(count / 2);
      const coldCount = count - hotCount;
      const hotPicks = frequencyData.slice(0, hotCount * 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, hotCount)
        .map(d => d.number);
      const coldPicks = frequencyData.slice(-coldCount * 2)
        .sort(() => Math.random() - 0.5)
        .slice(0, coldCount)
        .map(d => d.number);
      picks = [...hotPicks, ...coldPicks];
      break;
  }
  
  return [...new Set(picks)].sort((a, b) => a - b).slice(0, count);
};

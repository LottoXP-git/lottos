export type SimplePrice = { qty: number; price: string };
export type LotecaPrice = { duplos: number; triplos: number; apostas: number; price: string };
export type MilionariaPrice = { numeros: number; trevos: number; apostas: number; price: string };

export const MEGA_SENA_PRICES: SimplePrice[] = [
  { qty: 6, price: "6,00" },
  { qty: 7, price: "42,00" },
  { qty: 8, price: "168,00" },
  { qty: 9, price: "504,00" },
  { qty: 10, price: "1.260,00" },
  { qty: 11, price: "2.772,00" },
  { qty: 12, price: "5.544,00" },
  { qty: 13, price: "10.296,00" },
  { qty: 14, price: "18.018,00" },
  { qty: 15, price: "30.030,00" },
  { qty: 16, price: "48.048,00" },
  { qty: 17, price: "74.256,00" },
  { qty: 18, price: "111.384,00" },
  { qty: 19, price: "162.792,00" },
  { qty: 20, price: "232.560,00" },
];

export const DUPLA_SENA_PRICES: SimplePrice[] = [
  { qty: 6, price: "3,00" },
  { qty: 7, price: "21,00" },
  { qty: 8, price: "84,00" },
  { qty: 9, price: "252,00" },
  { qty: 10, price: "630,00" },
  { qty: 11, price: "1.386,00" },
  { qty: 12, price: "2.772,00" },
  { qty: 13, price: "5.148,00" },
  { qty: 14, price: "9.009,00" },
  { qty: 15, price: "15.015,00" },
];

export const QUINA_PRICES: SimplePrice[] = [
  { qty: 5, price: "3,00" },
  { qty: 6, price: "18,00" },
  { qty: 7, price: "63,00" },
  { qty: 8, price: "168,00" },
  { qty: 9, price: "378,00" },
  { qty: 10, price: "756,00" },
  { qty: 11, price: "1.386,00" },
  { qty: 12, price: "2.376,00" },
  { qty: 13, price: "3.861,00" },
  { qty: 14, price: "6.006,00" },
  { qty: 15, price: "9.009,00" },
];

export const DIA_DE_SORTE_PRICES: SimplePrice[] = [
  { qty: 7, price: "2,50" },
  { qty: 8, price: "20,00" },
  { qty: 9, price: "90,00" },
  { qty: 10, price: "300,00" },
  { qty: 11, price: "825,00" },
  { qty: 12, price: "1.980,00" },
  { qty: 13, price: "4.290,00" },
  { qty: 14, price: "8.580,00" },
  { qty: 15, price: "16.087,50" },
];

export const SUPER_SETE_PRICES: SimplePrice[] = [
  { qty: 7, price: "3,00" },
  { qty: 8, price: "6,00" },
  { qty: 9, price: "12,00" },
  { qty: 10, price: "24,00" },
  { qty: 11, price: "48,00" },
  { qty: 12, price: "96,00" },
  { qty: 13, price: "192,00" },
  { qty: 14, price: "384,00" },
  { qty: 15, price: "576,00" },
  { qty: 16, price: "864,00" },
  { qty: 17, price: "1.296,00" },
  { qty: 18, price: "1.944,00" },
  { qty: 19, price: "2.916,00" },
  { qty: 20, price: "4.374,00" },
  { qty: 21, price: "6.561,00" },
];

export const LOTOFACIL_PRICES: SimplePrice[] = [
  { qty: 15, price: "3,50" },
  { qty: 16, price: "56,00" },
  { qty: 17, price: "476,00" },
  { qty: 18, price: "2.856,00" },
  { qty: 19, price: "13.566,00" },
  { qty: 20, price: "54.264,00" },
];

export const LOTECA_PRICES: LotecaPrice[] = [
  { duplos: 1, triplos: 0, apostas: 2, price: "4,00" },
  { duplos: 2, triplos: 0, apostas: 4, price: "8,00" },
  { duplos: 3, triplos: 0, apostas: 8, price: "16,00" },
  { duplos: 4, triplos: 0, apostas: 16, price: "32,00" },
  { duplos: 5, triplos: 0, apostas: 32, price: "64,00" },
  { duplos: 6, triplos: 0, apostas: 64, price: "128,00" },
  { duplos: 7, triplos: 0, apostas: 128, price: "256,00" },
  { duplos: 8, triplos: 0, apostas: 256, price: "512,00" },
  { duplos: 9, triplos: 0, apostas: 512, price: "1.024,00" },
  { duplos: 0, triplos: 1, apostas: 3, price: "6,00" },
  { duplos: 1, triplos: 1, apostas: 6, price: "12,00" },
  { duplos: 2, triplos: 1, apostas: 12, price: "24,00" },
  { duplos: 3, triplos: 1, apostas: 24, price: "48,00" },
  { duplos: 4, triplos: 1, apostas: 48, price: "96,00" },
  { duplos: 5, triplos: 1, apostas: 96, price: "192,00" },
  { duplos: 6, triplos: 1, apostas: 192, price: "384,00" },
  { duplos: 7, triplos: 1, apostas: 384, price: "768,00" },
  { duplos: 8, triplos: 1, apostas: 768, price: "1.536,00" },
  { duplos: 0, triplos: 2, apostas: 9, price: "18,00" },
  { duplos: 1, triplos: 2, apostas: 18, price: "36,00" },
  { duplos: 2, triplos: 2, apostas: 36, price: "72,00" },
  { duplos: 3, triplos: 2, apostas: 72, price: "144,00" },
  { duplos: 4, triplos: 2, apostas: 144, price: "288,00" },
  { duplos: 5, triplos: 2, apostas: 288, price: "576,00" },
  { duplos: 6, triplos: 2, apostas: 576, price: "1.152,00" },
  { duplos: 0, triplos: 3, apostas: 27, price: "54,00" },
  { duplos: 1, triplos: 3, apostas: 54, price: "108,00" },
  { duplos: 2, triplos: 3, apostas: 108, price: "216,00" },
  { duplos: 3, triplos: 3, apostas: 216, price: "432,00" },
  { duplos: 4, triplos: 3, apostas: 432, price: "864,00" },
  { duplos: 5, triplos: 3, apostas: 864, price: "1.728,00" },
  { duplos: 0, triplos: 4, apostas: 81, price: "162,00" },
  { duplos: 1, triplos: 4, apostas: 162, price: "324,00" },
  { duplos: 2, triplos: 4, apostas: 324, price: "648,00" },
  { duplos: 3, triplos: 4, apostas: 648, price: "1.296,00" },
  { duplos: 0, triplos: 5, apostas: 243, price: "486,00" },
  { duplos: 1, triplos: 5, apostas: 486, price: "972,00" },
  { duplos: 0, triplos: 6, apostas: 729, price: "1.458,00" },
];

export const MILIONARIA_PRICES: MilionariaPrice[] = [
  { numeros: 6, trevos: 2, apostas: 1, price: "6,00" },
  { numeros: 6, trevos: 3, apostas: 3, price: "18,00" },
  { numeros: 6, trevos: 4, apostas: 6, price: "36,00" },
  { numeros: 7, trevos: 2, apostas: 7, price: "42,00" },
  { numeros: 6, trevos: 5, apostas: 10, price: "60,00" },
  { numeros: 6, trevos: 6, apostas: 15, price: "90,00" },
  { numeros: 7, trevos: 3, apostas: 21, price: "126,00" },
  { numeros: 8, trevos: 2, apostas: 28, price: "168,00" },
  { numeros: 7, trevos: 4, apostas: 42, price: "252,00" },
  { numeros: 7, trevos: 5, apostas: 70, price: "420,00" },
  { numeros: 8, trevos: 3, apostas: 84, price: "504,00" },
  { numeros: 9, trevos: 2, apostas: 84, price: "504,00" },
  { numeros: 7, trevos: 6, apostas: 105, price: "630,00" },
  { numeros: 8, trevos: 4, apostas: 168, price: "1.008,00" },
  { numeros: 10, trevos: 2, apostas: 210, price: "1.260,00" },
  { numeros: 9, trevos: 3, apostas: 252, price: "1.512,00" },
  { numeros: 8, trevos: 5, apostas: 280, price: "1.680,00" },
  { numeros: 8, trevos: 6, apostas: 420, price: "2.520,00" },
  { numeros: 11, trevos: 2, apostas: 462, price: "2.772,00" },
  { numeros: 9, trevos: 4, apostas: 504, price: "3.024,00" },
  { numeros: 10, trevos: 3, apostas: 630, price: "3.780,00" },
  { numeros: 9, trevos: 5, apostas: 840, price: "5.040,00" },
  { numeros: 12, trevos: 2, apostas: 924, price: "5.544,00" },
  { numeros: 9, trevos: 6, apostas: 1260, price: "7.560,00" },
  { numeros: 10, trevos: 4, apostas: 1260, price: "7.560,00" },
  { numeros: 11, trevos: 3, apostas: 1386, price: "8.316,00" },
  { numeros: 10, trevos: 5, apostas: 2100, price: "12.600,00" },
  { numeros: 12, trevos: 3, apostas: 2772, price: "16.632,00" },
  { numeros: 11, trevos: 4, apostas: 2772, price: "16.632,00" },
  { numeros: 10, trevos: 6, apostas: 3150, price: "18.900,00" },
  { numeros: 11, trevos: 5, apostas: 4620, price: "27.720,00" },
  { numeros: 12, trevos: 4, apostas: 5544, price: "33.264,00" },
  { numeros: 11, trevos: 6, apostas: 6930, price: "41.580,00" },
  { numeros: 12, trevos: 5, apostas: 9240, price: "55.440,00" },
  { numeros: 12, trevos: 6, apostas: 13860, price: "83.160,00" },
];

export type ModalityKey =
  | "megasena"
  | "lotofacil"
  | "quina"
  | "lotomania"
  | "timemania"
  | "duplasena"
  | "diadesorte"
  | "supersete"
  | "milionaria"
  | "loteca";

export const MODALITY_LABELS: Record<ModalityKey, string> = {
  megasena: "Mega-Sena",
  lotofacil: "Lotofácil",
  quina: "Quina",
  lotomania: "Lotomania",
  timemania: "Timemania",
  duplasena: "Dupla Sena",
  diadesorte: "Dia de Sorte",
  supersete: "Super Sete",
  milionaria: "+Milionária",
  loteca: "Loteca",
};

export const SINGLE_BETS: Partial<Record<ModalityKey, { description: string; price: string }>> = {
  timemania: { description: "10 números + 1 time do coração", price: "3,50" },
  lotomania: { description: "50 números", price: "3,00" },
};
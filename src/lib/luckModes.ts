export type LuckModeId = "random" | "numerology" | "zodiac" | "dream" | "birthday";

export interface LuckMode {
  id: LuckModeId;
  label: string;
  emoji: string;
  description: string;
  /** Requires extra input from the user */
  needsInput?: "date" | "zodiac" | "dream" | "birthday";
}

export const LUCK_MODES: LuckMode[] = [
  { id: "random", label: "Aleatório", emoji: "🎲", description: "Sorteio puro com pitada de estatística." },
  { id: "numerology", label: "Numerologia", emoji: "🔢", description: "Usa uma data como semente da sorte.", needsInput: "date" },
  { id: "zodiac", label: "Signo", emoji: "♈", description: "Vibrações do seu signo do zodíaco.", needsInput: "zodiac" },
  { id: "dream", label: "Sonho", emoji: "🌙", description: "Transforma uma palavra do sonho em números.", needsInput: "dream" },
  { id: "birthday", label: "Aniversário", emoji: "🎂", description: "Combina o dia, mês e ano do aniversário.", needsInput: "birthday" },
];

export const ZODIAC_SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

/** Mulberry32 deterministic PRNG */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Reduce string to its numerology root (sum digits + letters until 1-9) */
export function numerologyRoot(input: string): number {
  const digits = input
    .toLowerCase()
    .split("")
    .map((c) => {
      if (/[0-9]/.test(c)) return parseInt(c, 10);
      if (/[a-z]/.test(c)) return ((c.charCodeAt(0) - 96) % 9) || 9;
      return 0;
    });
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22) {
    sum = String(sum).split("").reduce((a, b) => a + parseInt(b, 10), 0);
  }
  return sum || 7;
}

/** Build a deterministic seed from a luck mode + input. */
export function buildSeed(mode: LuckModeId, input?: string): number {
  if (mode === "random") return Math.floor(Math.random() * 0xffffffff);
  const base = `${mode}|${input ?? ""}`;
  return hashString(base) ^ 0x9e3779b1;
}

/**
 * Pick `count` distinct numbers in [1..max] from a deterministic seed.
 * Lightly biases toward "lucky" anchors derived from the seed.
 */
export function seededPicks(seed: number, max: number, count: number, anchors: number[] = []): number[] {
  const rand = mulberry32(seed);
  const picks = new Set<number>();
  // Insert anchors that fit
  for (const a of anchors) {
    if (a >= 1 && a <= max) picks.add(a);
    if (picks.size >= count) break;
  }
  let safety = count * 50;
  while (picks.size < count && safety-- > 0) {
    picks.add(Math.floor(rand() * max) + 1);
  }
  return Array.from(picks).slice(0, count).sort((a, b) => a - b);
}

/** Anchors derived per mode */
export function buildAnchors(mode: LuckModeId, input: string | undefined, max: number): number[] {
  if (!input) return [];
  const out: number[] = [];
  switch (mode) {
    case "numerology": {
      const root = numerologyRoot(input);
      out.push(root, root * 3, root * 7);
      break;
    }
    case "zodiac": {
      const idx = ZODIAC_SIGNS.indexOf(input as ZodiacSign);
      if (idx >= 0) {
        out.push((idx + 1), (idx + 1) * 2, (idx + 1) * 3 + 1);
      }
      break;
    }
    case "dream": {
      const root = numerologyRoot(input);
      out.push(root, (root * 5) % max || root);
      break;
    }
    case "birthday": {
      const m = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (m) {
        const [, d, mo, y] = m;
        out.push(parseInt(d, 10), parseInt(mo, 10), parseInt(y.slice(-2), 10) || 1);
      } else {
        out.push(numerologyRoot(input));
      }
      break;
    }
  }
  return out.filter((n) => n >= 1 && n <= max);
}

export function generateModePicks(
  mode: LuckModeId,
  input: string | undefined,
  max: number,
  count: number
): number[] {
  const seed = buildSeed(mode, input);
  const anchors = buildAnchors(mode, input, max);
  return seededPicks(seed, max, count, anchors);
}
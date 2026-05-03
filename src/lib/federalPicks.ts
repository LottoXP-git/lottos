export const TICKET_LEN = 6;
export const HISTORY_SIZE = 50;

export type FederalStrategy = "hot" | "cold" | "balanced" | "random";
export type DigitFreq = number[][];

export function emptyFreq(): DigitFreq {
  return Array.from({ length: TICKET_LEN }, () => Array(10).fill(0));
}

export function buildFrequency(tickets: string[]): DigitFreq {
  const freq = emptyFreq();
  for (const raw of tickets) {
    const t = String(raw).replace(/\D/g, "").padStart(TICKET_LEN, "0").slice(-TICKET_LEN);
    for (let i = 0; i < TICKET_LEN; i++) {
      const d = parseInt(t[i], 10);
      if (!isNaN(d)) freq[i][d]++;
    }
  }
  return freq;
}

export function pickByStrategy(freq: DigitFreq, strategy: FederalStrategy): string {
  let bilhete = "";
  for (let i = 0; i < TICKET_LEN; i++) {
    const counts = freq[i];
    const total = counts.reduce((a, b) => a + b, 0);
    let digit = 0;

    if (strategy === "random" || total === 0) {
      digit = Math.floor(Math.random() * 10);
    } else if (strategy === "hot") {
      const ranked = counts
        .map((c, d) => ({ c, d }))
        .sort((a, b) => b.c - a.c)
        .slice(0, 3);
      digit = ranked[Math.floor(Math.random() * ranked.length)].d;
    } else if (strategy === "cold") {
      const ranked = counts
        .map((c, d) => ({ c, d }))
        .sort((a, b) => a.c - b.c)
        .slice(0, 3);
      digit = ranked[Math.floor(Math.random() * ranked.length)].d;
    } else {
      const r = Math.random() * total;
      let acc = 0;
      for (let d = 0; d < 10; d++) {
        acc += counts[d];
        if (r <= acc) { digit = d; break; }
      }
    }
    bilhete += String(digit);
  }
  return bilhete;
}

export async function fetchFederalHistory(size: number): Promise<string[]> {
  const latestRes = await fetch("https://loteriascaixa-api.herokuapp.com/api/federal");
  if (!latestRes.ok) throw new Error("Falha ao buscar último concurso");
  const latestRaw = await latestRes.json();
  const latest = Array.isArray(latestRaw) ? latestRaw[0] : latestRaw;
  const lastConcurso: number = latest.concurso || latest.numero;
  if (!lastConcurso) throw new Error("Concurso atual não encontrado");

  const tickets: string[] = [];
  if (Array.isArray(latest.dezenas)) tickets.push(...latest.dezenas.map(String));

  const promises: Promise<string[]>[] = [];
  for (let i = 1; i < size; i++) {
    const c = lastConcurso - i;
    if (c <= 0) break;
    promises.push(
      fetch(`https://loteriascaixa-api.herokuapp.com/api/federal/${c}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return [];
          const obj = Array.isArray(d) ? d[0] : d;
          return Array.isArray(obj?.dezenas) ? obj.dezenas.map(String) : [];
        })
        .catch(() => [])
    );
  }
  const results = await Promise.all(promises);
  for (const arr of results) tickets.push(...arr);
  return tickets;
}
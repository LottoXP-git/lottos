import type { UpcomingMatch } from "@/components/LotecaUpcomingMatches";

export interface LotecaProgrammingData {
  concurso: number;
  periodoApostas: string;
  dataJogos: string;
  apuracao: string;
  jogos: UpcomingMatch[];
}

const PAGE_URL = "https://loterias.caixa.gov.br/Paginas/Programacao-Loteca.aspx";

// Public CORS proxies used as fallback when the Caixa page blocks direct browser fetch.
const PROXIES = [
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

const ACCENT_MAP: Record<string, string> = {
  ESCOCIA: "Escócia",
  BRASIL: "Brasil",
  "NOVA ZELANDIA": "Nova Zelândia",
  EGITO: "Egito",
  ARGENTINA: "Argentina",
  AUSTRIA: "Áustria",
  FRANCA: "França",
  IRAQUE: "Iraque",
  NORUEGA: "Noruega",
  SENEGAL: "Senegal",
  PORTUGAL: "Portugal",
  UZBEQUISTAO: "Uzbequistão",
  INGLATERRA: "Inglaterra",
  GANA: "Gana",
  PANAMA: "Panamá",
  CROACIA: "Croácia",
  COLOMBIA: "Colômbia",
  CONGO: "Congo",
  SUICA: "Suíça",
  CANADA: "Canadá",
  "BOSNIA HERZEGOVIN": "Bósnia Herzegovina",
  "BOSNIA HERZEGOVINA": "Bósnia Herzegovina",
  CATAR: "Catar",
  MARROCOS: "Marrocos",
  HAITI: "Haiti",
  "AFRICA DO SUL": "África do Sul",
  "COREIA DO SUL": "Coreia do Sul",
  "REPUBLICA TCHECA": "República Tcheca",
  MEXICO: "México",
  CURACAO: "Curaçao",
  "COSTA DO MARFIM": "Costa do Marfim",
  EQUADOR: "Equador",
  ALEMANHA: "Alemanha",
  TUNISIA: "Tunísia",
  HOLANDA: "Holanda",
  JAPAO: "Japão",
  SUECIA: "Suécia",
};

function normalizeTeam(raw: string): string {
  let s = raw.replace(/\u00a0/g, " ").trim();
  s = s.split("/")[0].trim().toUpperCase();
  if (ACCENT_MAP[s]) return ACCENT_MAP[s];
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function parseProgrammingHtml(html: string): LotecaProgrammingData {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Header e.g. "Concurso 1257 (21/06/2026, Domingo)"
  const headerMatch = html.match(/Concurso\s+(\d+)\s*\(([\d/]+),\s*([^\)]+)\)/);
  if (!headerMatch) throw new Error("Cabeçalho do concurso não encontrado");
  const concurso = Number(headerMatch[1]);
  const dataApuracao = headerMatch[2];
  const diaSemana = headerMatch[3].trim();

  const block = doc.getElementById(`conteudoConcurso${concurso}`);
  if (!block) throw new Error("Bloco de jogos não encontrado");
  const blockHtml = block.innerHTML;
  const blockText = block.textContent || "";

  const periodoMatch = blockText.match(/Per[ií]odo de apostas:?\s*([^\n]+?)(?:Realiza|$)/i);
  const realizacaoMatch = blockText.match(/Realiza[cç][aã]o[^:]*:?\s*([^\n]+?)(?:Per[ií]odo|$)/i);
  const periodoApostas = periodoMatch ? periodoMatch[1].replace(/\s+do dia\s+/, " de ").trim() : "";
  const dataJogos = realizacaoMatch ? realizacaoMatch[1].trim() : "";

  let apuracao = "";
  const apMatch = periodoApostas.match(/at[eé]\s+as\s+([\dhH:]+)\s+(?:do\s+dia\s+|de\s+)?([\d/]+)/i);
  if (apMatch) apuracao = `${apMatch[1]} de ${apMatch[2]}`;
  else apuracao = `${dataApuracao} (${diaSemana})`;

  const jogos: UpcomingMatch[] = [];
  const rows = block.querySelectorAll("tr[ng-repeat*='listaJogos']");
  rows.forEach((tr) => {
    const tds = Array.from(tr.querySelectorAll("td")).map((td) =>
      (td.textContent || "").replace(/\s+/g, " ").trim(),
    );
    if (tds.length < 5) return;
    const equipeUm = normalizeTeam(tds[2]);
    const equipeDois = normalizeTeam(tds[4]);
    if (!equipeUm || !equipeDois) return;
    jogos.push({ equipeUm, equipeDois, campeonato: "Copa do Mundo" });
  });

  if (jogos.length === 0) throw new Error("Nenhum jogo encontrado");
  return { concurso, periodoApostas, dataJogos, apuracao, jogos };
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch Loteca upcoming programming directly from Caixa's public page.
 * Falls back through CORS proxies when the browser blocks a direct request.
 */
export async function fetchLotecaProgrammingFromBrowser(): Promise<LotecaProgrammingData | null> {
  const candidates: string[] = [PAGE_URL, ...PROXIES.map((p) => p(PAGE_URL))];
  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;
      const html = await res.text();
      if (!html || html.length < 500) continue;
      return parseProgrammingHtml(html);
    } catch (err) {
      console.warn("[loteca-programming-browser] falhou", url, err);
    }
  }
  return null;
}
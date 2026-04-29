import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LotteryResult } from "@/data/lotteryData";

interface LotteryApiResponse {
  results?: LotteryResult[];
  result?: LotteryResult;
  error?: string;
}

// Lotteries we can fetch directly from Caixa via the user's browser
// (Caixa blocks data-center IPs, so server-side gets stale 3rd-party data).
const BROWSER_FETCH_CONFIGS: Array<{
  id: string;
  name: string;
  apiName: string;
  color: string;
  maxNumber: number;
  selectCount: number;
}> = [
  { id: "megasena", name: "Mega-Sena", apiName: "megasena", color: "lottery-megasena", maxNumber: 60, selectCount: 6 },
  { id: "lotofacil", name: "Lotofácil", apiName: "lotofacil", color: "lottery-lotofacil", maxNumber: 25, selectCount: 15 },
  { id: "quina", name: "Quina", apiName: "quina", color: "lottery-quina", maxNumber: 80, selectCount: 5 },
  { id: "lotomania", name: "Lotomania", apiName: "lotomania", color: "lottery-lotomania", maxNumber: 100, selectCount: 20 },
  { id: "duplasena", name: "Dupla Sena", apiName: "duplasena", color: "lottery-duplasena", maxNumber: 50, selectCount: 6 },
  { id: "diadesorte", name: "Dia de Sorte", apiName: "diadesorte", color: "lottery-diadesorte", maxNumber: 31, selectCount: 7 },
  { id: "supersete", name: "Super Sete", apiName: "supersete", color: "lottery-supersete", maxNumber: 10, selectCount: 7 },
  { id: "maismilionaria", name: "+Milionária", apiName: "maismilionaria", color: "lottery-maismilionaria", maxNumber: 50, selectCount: 6 },
  { id: "timemania", name: "Timemania", apiName: "timemania", color: "lottery-timemania", maxNumber: 80, selectCount: 7 },
  { id: "federal", name: "Federal", apiName: "federal", color: "lottery-federal", maxNumber: 99999, selectCount: 5 },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

const formatPrize = (value: number) => {
  if (!value) return "R$ 0,00";
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Generic Caixa-API browser fetcher for numeric lotteries (not Loteca)
async function fetchLotteryFromCaixa(
  cfg: (typeof BROWSER_FETCH_CONFIGS)[number],
): Promise<LotteryResult | null> {
  const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${cfg.apiName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

    const numbers: number[] = (data.listaDezenas || data.dezenasSorteadasOrdemSorteio || []).map((d: string) =>
      parseInt(d, 10),
    );

    const trevos: number[] =
      cfg.id === "maismilionaria"
        ? (data.trevosSorteados || []).map((t: string) => parseInt(t, 10))
        : [];

    const premiacoes = (data.listaRateioPremio || []).map((p: { descricaoFaixa?: string; faixa?: number; numeroDeGanhadores?: number; valorPremio?: number }) => ({
      descricao: p.descricaoFaixa || "",
      faixa: p.faixa || 0,
      ganhadores: p.numeroDeGanhadores || 0,
      valorPremio: p.valorPremio || 0,
    }));

    const localGanhadores = (data.listaMunicipioUFGanhadores || []).map((l: { posicao?: number; municipio?: string; uf?: string; nomeFatansiaUL?: string; ganhadores?: number }) => ({
      posicao: l.posicao || 0,
      municipio: l.municipio || "",
      uf: l.uf || "",
      nomeLoteria: l.nomeFatansiaUL || "",
      ganhadores: l.ganhadores || 0,
    }));

    const timeCoracao = cfg.id === "timemania" ? data.nomeTimeCoracaoMesSorte || "" : "";
    const mesSorte = cfg.id === "diadesorte" ? data.nomeTimeCoracaoMesSorte || "" : "";

    let prize: string;
    let winners: number;
    let nextPrize: string;
    let accumulated: boolean;

    if (cfg.id === "federal") {
      const firstPrize = premiacoes.length > 0 ? premiacoes[0].valorPremio : 500000;
      prize = formatPrize(firstPrize);
      winners = premiacoes.reduce((sum: number, p: { ganhadores: number }) => sum + (p.ganhadores || 1), 0);
      nextPrize = "R$ 500.000,00";
      accumulated = false;
    } else {
      prize = formatPrize(data.valorAcumuladoProximoConcurso || data.valorEstimadoProximoConcurso || 0);
      winners = premiacoes.length > 0 ? premiacoes[0].ganhadores : 0;
      nextPrize = formatPrize(data.valorEstimadoProximoConcurso || 0);
      accumulated = !!data.acumulado;
    }

    return {
      id: cfg.id,
      name: cfg.name,
      concurso: data.numero || 0,
      date: formatDate(data.dataApuracao || ""),
      numbers: cfg.id === "federal" ? numbers : numbers.sort((a, b) => a - b),
      trevos,
      timeCoracao: timeCoracao || undefined,
      mesSorte: mesSorte || undefined,
      premiacoes,
      localGanhadores: localGanhadores.length > 0 ? localGanhadores : undefined,
      prize,
      winners,
      nextPrize,
      nextDate: formatDate(data.dataProximoConcurso || ""),
      color: cfg.color,
      maxNumber: cfg.maxNumber,
      selectCount: cfg.selectCount,
      accumulated,
    } as LotteryResult;
  } catch (err) {
    console.warn(`[caixa-browser] ${cfg.name} failed:`, err);
    return null;
  }
}

// Fetch Loteca directly from browser (Caixa API blocks server IPs but allows browsers)
async function fetchLotecaFromBrowser(concurso?: number): Promise<LotteryResult | null> {
  const caixaUrl = concurso
    ? `https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca/${concurso}`
    : "https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca";

  try {
    const response = await fetch(caixaUrl);
    if (!response.ok) {
      console.error(`Loteca browser fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    const jogos = (data.listaResultadoEquipeEsportiva || [])
      .sort((a: any, b: any) => a.nuSequencial - b.nuSequencial)
      .map((m: any) => {
        const golUm = m.nuGolEquipeUm ?? 0;
        const golDois = m.nuGolEquipeDois ?? 0;
        let resultado: "coluna1" | "empate" | "coluna2";
        if (golUm > golDois) resultado = "coluna1";
        else if (golUm === golDois) resultado = "empate";
        else resultado = "coluna2";
        return {
          sequencial: m.nuSequencial,
          equipeUm: m.nomeEquipeUm || "",
          equipeDois: m.nomeEquipeDois || "",
          golEquipeUm: golUm,
          golEquipeDois: golDois,
          resultado,
          campeonato: m.nomeCampeonato || "",
          dataJogo: m.dtJogo || "",
        };
      });

    const premiacoes = (data.listaRateioPremio || []).map((p: any) => ({
      descricao: p.descricaoFaixa || "",
      faixa: p.faixa || 0,
      ganhadores: p.numeroDeGanhadores || 0,
      valorPremio: p.valorPremio || 0,
    }));

    const localGanhadores = (data.listaMunicipioUFGanhadores || []).map((l: any) => ({
      posicao: l.posicao || 0,
      municipio: l.municipio || "",
      uf: l.uf || "",
      nomeLoteria: l.nomeFatansiaUL || "",
      ganhadores: l.ganhadores || 0,
    }));

    const firstPrize = premiacoes.length > 0 ? premiacoes[0].valorPremio : 0;
    const firstPrizeWinners = premiacoes.length > 0 ? premiacoes[0].ganhadores : 0;

    return {
      id: "loteca",
      name: "Loteca",
      concurso: data.numero || 0,
      date: formatDate(data.dataApuracao || ""),
      numbers: [],
      jogos,
      trevos: [],
      premiacoes,
      localGanhadores: localGanhadores.length > 0 ? localGanhadores : undefined,
      prize: formatPrize(firstPrize),
      winners: firstPrizeWinners,
      nextPrize: formatPrize(data.valorEstimadoProximoConcurso || 0),
      nextDate: formatDate(data.dataProximoConcurso || ""),
      color: "lottery-loteca",
      maxNumber: 14,
      selectCount: 14,
      accumulated: data.acumulado || false,
    };
  } catch (error) {
    console.error("Error fetching Loteca from browser:", error);
    return null;
  }
}

async function fetchLotteryResults(): Promise<LotteryResult[]> {
  // Fetch edge function (server-side, fast, but may be 1-day stale due to Caixa
  // blocking data-center IPs) AND every lottery directly from the user's browser
  // (always fresh) in parallel. Browser results take priority when newer.
  const [edgeResponse, lotecaResult, browserResults] = await Promise.all([
    supabase.functions.invoke<LotteryApiResponse>("fetch-lottery-results", { body: {} }),
    fetchLotecaFromBrowser(),
    Promise.all(BROWSER_FETCH_CONFIGS.map((cfg) => fetchLotteryFromCaixa(cfg))),
  ]);

  const { data, error } = edgeResponse;

  if (error) {
    console.error("Error fetching lottery results:", error);
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const edgeResults = data?.results || [];

  // Build a map keyed by lottery id, starting from edge results
  const merged = new Map<string, LotteryResult>();
  for (const r of edgeResults) merged.set(r.id, r);

  // Override with browser-fetched Caixa data if it's newer (greater concurso)
  for (const br of browserResults) {
    if (!br) continue;
    const existing = merged.get(br.id);
    if (!existing || br.concurso >= existing.concurso) {
      merged.set(br.id, br);
    }
  }

  // Loteca: always prefer browser result (edge gets 403)
  if (lotecaResult) {
    merged.set("loteca", lotecaResult);
  }

  return Array.from(merged.values());
}
 
 async function fetchLotteryHistory(
   lotteryId: string,
   count: number = 100
 ): Promise<LotteryResult[]> {
   const { data, error } = await supabase.functions.invoke<LotteryApiResponse>(
     "fetch-lottery-results",
     {
       body: {},
       headers: {},
     }
   );
 
   // Use URL params via query string approach
   const response = await fetch(
     `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-lottery-results?lottery=${lotteryId}&mode=history&count=${count}`,
     {
       headers: {
         Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
         "Content-Type": "application/json",
       },
     }
   );
 
   if (!response.ok) {
     throw new Error(`Failed to fetch history: ${response.statusText}`);
   }
 
   const responseData = await response.json();
   return responseData?.results || [];
 }
 
 export function useLotteryResults() {
   return useQuery({
     queryKey: ["lottery-results"],
     queryFn: fetchLotteryResults,
     staleTime: 1000 * 60 * 5, // 5 minutes
     refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
   });
 }
 
 export function useLotteryHistory(lotteryId: string, count: number = 100) {
   return useQuery({
     queryKey: ["lottery-history", lotteryId, count],
     queryFn: () => fetchLotteryHistory(lotteryId, count),
     staleTime: 1000 * 60 * 30, // 30 minutes
     enabled: !!lotteryId,
   });
 }
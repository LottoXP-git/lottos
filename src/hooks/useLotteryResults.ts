import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LotteryResult } from "@/data/lotteryData";

interface LotteryApiResponse {
  results?: LotteryResult[];
  result?: LotteryResult;
  error?: string;
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
  // Fetch edge function results and Loteca from browser in parallel
  const [edgeResponse, lotecaResult] = await Promise.all([
    supabase.functions.invoke<LotteryApiResponse>("fetch-lottery-results", { body: {} }),
    fetchLotecaFromBrowser(),
  ]);

  const { data, error } = edgeResponse;

  if (error) {
    console.error("Error fetching lottery results:", error);
    throw new Error(error.message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const results = data?.results || [];
  
  // Replace or add Loteca with browser-fetched data (real data)
  const withoutLoteca = results.filter(r => r.id !== "loteca");
  if (lotecaResult) {
    return [...withoutLoteca, lotecaResult];
  }
  return results;
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
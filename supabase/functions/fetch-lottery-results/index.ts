 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface LotteryConfig {
   id: string;
   name: string;
   apiName: string;
   color: string;
   maxNumber: number;
   selectCount: number;
 }
 
 const LOTTERY_CONFIGS: LotteryConfig[] = [
   {
     id: "megasena",
     name: "Mega-Sena",
     apiName: "megasena",
     color: "lottery-megasena",
     maxNumber: 60,
     selectCount: 6,
   },
   {
     id: "lotofacil",
     name: "Lotofácil",
     apiName: "lotofacil",
     color: "lottery-lotofacil",
     maxNumber: 25,
     selectCount: 15,
   },
   {
     id: "quina",
     name: "Quina",
     apiName: "quina",
     color: "lottery-quina",
     maxNumber: 80,
     selectCount: 5,
   },
   {
     id: "lotomania",
     name: "Lotomania",
     apiName: "lotomania",
     color: "lottery-lotomania",
     maxNumber: 100,
     selectCount: 20,
   },
   {
     id: "duplasena",
     name: "Dupla Sena",
     apiName: "duplasena",
     color: "lottery-duplasena",
     maxNumber: 50,
     selectCount: 6,
   },
   {
     id: "diadesorte",
     name: "Dia de Sorte",
     apiName: "diadesorte",
     color: "lottery-diadesorte",
     maxNumber: 31,
     selectCount: 7,
   },
   {
     id: "supersete",
     name: "Super Sete",
     apiName: "supersete",
     color: "lottery-supersete",
     maxNumber: 10,
     selectCount: 7,
   },
  {
    id: "maismilionaria",
    name: "+Milionária",
    apiName: "maismilionaria",
    color: "lottery-maismilionaria",
    maxNumber: 50,
    selectCount: 6,
  },
  {
    id: "timemania",
    name: "Timemania",
    apiName: "timemania",
    color: "lottery-timemania",
    maxNumber: 80,
    selectCount: 7,
  },
  {
    id: "federal",
    name: "Federal",
    apiName: "federal",
    color: "lottery-federal",
    maxNumber: 99999,
    selectCount: 5,
  },
  {
    id: "loteca",
    name: "Loteca",
    apiName: "loteca",
    color: "lottery-loteca",
    maxNumber: 14,
    selectCount: 14,
  },
];
 
  // Fetch Loteca from official Caixa API (not supported by loteriascaixa-api)
  async function fetchLotecaResult(config: LotteryConfig, concurso?: number) {
    const baseUrl = "https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca";
    const url = concurso ? `${baseUrl}/${concurso}` : baseUrl;

    console.log(`Fetching Loteca from: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        console.error(`Error fetching Loteca: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log(`Received data for Loteca:`, JSON.stringify(data).substring(0, 200));

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

      // Parse matches
      const jogos = (data.listaResultadoEquipeEsportiva || [])
        .sort((a: any, b: any) => a.nuSequencial - b.nuSequencial)
        .map((m: any) => {
          const golUm = m.nuGolEquipeUm ?? 0;
          const golDois = m.nuGolEquipeDois ?? 0;
          let resultado: string;
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

      // Parse prize tiers
      const premiacoes = (data.listaRateioPremio || []).map((p: any) => ({
        descricao: p.descricaoFaixa || "",
        faixa: p.faixa || 0,
        ganhadores: p.numeroDeGanhadores || 0,
        valorPremio: p.valorPremio || 0,
      }));

      // Parse winner locations
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
        id: config.id,
        name: config.name,
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
        color: config.color,
        maxNumber: config.maxNumber,
        selectCount: config.selectCount,
        accumulated: data.acumulado || false,
      };
    } catch (error) {
      console.error(`Error fetching Loteca:`, error);
      return null;
    }
  }

 async function fetchLotteryResult(config: LotteryConfig, concurso?: number) {
    // Loteca uses a different API
    if (config.id === "loteca") {
      return fetchLotecaResult(config, concurso);
    }

   // Using loterias-api - open source API for Brazilian lotteries
   // GitHub: https://github.com/guto-alves/loterias-api
   const baseUrl = "https://loteriascaixa-api.herokuapp.com/api";
   const url = concurso 
     ? `${baseUrl}/${config.apiName}/${concurso}`
     : `${baseUrl}/${config.apiName}`;
 
   console.log(`Fetching ${config.name} from: ${url}`);
 
   try {
     const response = await fetch(url, {
       headers: {
         "Accept": "application/json",
       },
     });
 
     if (!response.ok) {
       console.error(`Error fetching ${config.name}: ${response.status}`);
       return null;
     }
 
     const rawData = await response.json();
     // Handle both array response (latest) and object response (specific concurso)
     const data = Array.isArray(rawData) ? rawData[0] : rawData;
     
     if (!data) {
       console.error(`No data returned for ${config.name}`);
       return null;
     }
     
     console.log(`Received data for ${config.name}:`, JSON.stringify(data).substring(0, 200));
 
     // Handle different API response formats
     let numbers: number[] = [];
     
     if (data.dezenas) {
       numbers = data.dezenas.map((d: string) => parseInt(d, 10));
     } else if (data.listaDezenas) {
       numbers = data.listaDezenas.map((d: string) => parseInt(d, 10));
     } else if (Array.isArray(data.numeros)) {
       numbers = data.numeros.map((d: string | number) => typeof d === 'string' ? parseInt(d, 10) : d);
     }
 
     // Format date - handle different formats
     const formatDate = (dateStr: string) => {
       if (!dateStr) return "";
       if (dateStr.includes("/")) return dateStr;
       const parts = dateStr.split("-");
       if (parts.length === 3) {
         return `${parts[2]}/${parts[1]}/${parts[0]}`;
       }
       return dateStr;
     };
 
     // Format prize value
     const formatPrize = (value: number) => {
       if (!value) return "R$ 0,00";
       return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
     };
 
      // Extract trevos for +Milionária
      let trevos: number[] = [];
      if (config.id === "maismilionaria" && data.trevos) {
        trevos = data.trevos.map((t: string | number) => typeof t === 'string' ? parseInt(t, 10) : t);
      }

      // Extract special fields
      const timeCoracao = config.id === "timemania" ? (data.timeCoracao || data.nomeTimeCoracaoMesSorte || "") : "";
      const mesSorte = config.id === "diadesorte" ? (data.mesSorte || data.nomeTimeCoracaoMesSorte || "") : "";

      // Extract prize tiers (premiacoes)
      let premiacoes: { descricao: string; faixa: number; ganhadores: number; valorPremio: number }[] = [];
      if (data.premiacoes && Array.isArray(data.premiacoes)) {
        premiacoes = data.premiacoes.map((p: any) => ({
          descricao: p.descricao || p.acertos || "",
          faixa: p.faixa || 0,
          ganhadores: p.ganhadores || 0,
          valorPremio: p.valorPremio || p.premio || 0,
        }));
      }

      // Extract winner locations for all lotteries
      let localGanhadores: { posicao: number; municipio: string; uf: string; nomeLoteria: string; ganhadores: number }[] = [];
      if (data.localGanhadores && Array.isArray(data.localGanhadores)) {
        localGanhadores = data.localGanhadores
          .map((l: any) => ({
            posicao: l.posicao || 0,
            municipio: l.municipio || "",
            uf: l.uf || "",
            nomeLoteria: l.nomeFatansiaUL || l.nomeFantasiaUL || "",
            ganhadores: l.ganhadores || 0,
          }))
          .sort((a: any, b: any) => a.posicao - b.posicao);
      }

      // Federal lottery has special handling
      let prize: string;
      let winners: number;
      let nextPrize: string;
      let nextDate: string;
      let accumulated: boolean;

      if (config.id === "federal") {
        const firstPrize = premiacoes.length > 0 ? premiacoes[0].valorPremio : 500000;
        prize = formatPrize(firstPrize);
        winners = premiacoes.reduce((sum, p) => sum + (p.ganhadores || 1), 0);
        nextPrize = "R$ 500.000,00";
        nextDate = formatDate(data.dataProximoConcurso || "");
        accumulated = false;
        numbers = data.dezenas 
          ? data.dezenas.map((d: string) => parseInt(d, 10))
          : data.dezenasOrdemSorteio 
            ? data.dezenasOrdemSorteio.map((d: string) => parseInt(d, 10))
            : numbers;
      } else {
        prize = formatPrize(data.valor_acumulado || data.valorAcumuladoProximoConcurso || data.valorEstimadoProximoConcurso || 0);
        winners = data.ganhadores || data.quantidadeGanhadores || 0;
        nextPrize = formatPrize(data.valor_estimado_proximo_concurso || data.valorEstimadoProximoConcurso || data.valorAcumuladoProximoConcurso || 0);
        nextDate = formatDate(data.dataProximoConcurso || "");
        accumulated = data.acumulado || data.acumulou || false;
      }

      const result = {
        id: config.id,
        name: config.name,
        concurso: data.concurso || data.numero || 0,
        date: formatDate(data.data || data.dataApuracao || ""),
        numbers: config.id === "federal" ? numbers : numbers.sort((a, b) => a - b),
        trevos,
        timeCoracao: timeCoracao || undefined,
        mesSorte: mesSorte || undefined,
        premiacoes,
        localGanhadores: localGanhadores.length > 0 ? localGanhadores : undefined,
        prize,
        winners,
        nextPrize,
        nextDate,
        color: config.color,
        maxNumber: config.maxNumber,
        selectCount: config.selectCount,
        accumulated,
      };
 
     return result;
   } catch (error) {
     console.error(`Error fetching ${config.name}:`, error);
     return null;
   }
 }
 
 async function fetchHistoricalResults(config: LotteryConfig, count: number = 100) {
   const results = [];
   const latestResult = await fetchLotteryResult(config);
   
   if (!latestResult) return [];
   
   results.push(latestResult);
   
   // Fetch historical concursos
   const startConcurso = latestResult.concurso - 1;
   const endConcurso = Math.max(1, latestResult.concurso - count + 1);
   
   const promises = [];
   for (let concurso = startConcurso; concurso >= endConcurso; concurso--) {
     promises.push(fetchLotteryResult(config, concurso));
   }
   
   // Batch requests to avoid overwhelming the API
   const batchSize = 10;
   for (let i = 0; i < promises.length; i += batchSize) {
     const batch = promises.slice(i, i + batchSize);
     const batchResults = await Promise.all(batch);
     results.push(...batchResults.filter(r => r !== null));
     
     // Small delay between batches
     if (i + batchSize < promises.length) {
       await new Promise(resolve => setTimeout(resolve, 100));
     }
   }
   
   return results.sort((a, b) => b.concurso - a.concurso);
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const url = new URL(req.url);
     const lotteryId = url.searchParams.get("lottery");
     const mode = url.searchParams.get("mode") || "latest"; // 'latest' or 'history'
     const count = parseInt(url.searchParams.get("count") || "100", 10);
 
     console.log(`Request: lottery=${lotteryId}, mode=${mode}, count=${count}`);
 
     if (mode === "history" && lotteryId) {
       // Fetch historical results for a specific lottery
       const config = LOTTERY_CONFIGS.find(c => c.id === lotteryId);
       if (!config) {
         return new Response(
           JSON.stringify({ error: "Lottery not found" }),
           { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
 
       const results = await fetchHistoricalResults(config, count);
       return new Response(
         JSON.stringify({ results }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (lotteryId) {
       // Fetch single lottery latest result
       const config = LOTTERY_CONFIGS.find(c => c.id === lotteryId);
       if (!config) {
         return new Response(
           JSON.stringify({ error: "Lottery not found" }),
           { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
 
       const result = await fetchLotteryResult(config);
       return new Response(
         JSON.stringify({ result }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Fetch all lotteries latest results
     const results = await Promise.all(
       LOTTERY_CONFIGS.map(config => fetchLotteryResult(config))
     );
 
     const validResults = results.filter(r => r !== null);
 
     return new Response(
       JSON.stringify({ results: validResults }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Error in fetch-lottery-results:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });
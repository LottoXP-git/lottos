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
];
 
 async function fetchLotteryResult(config: LotteryConfig, concurso?: number) {
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
       // If already in DD/MM/YYYY format
       if (dateStr.includes("/")) return dateStr;
       // Convert from YYYY-MM-DD to DD/MM/YYYY
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
 
     const result = {
       id: config.id,
       name: config.name,
       concurso: data.concurso || data.numero || 0,
       date: formatDate(data.data || data.dataApuracao || ""),
       numbers: numbers.sort((a, b) => a - b),
       prize: formatPrize(data.valor_acumulado || data.valorAcumuladoProximoConcurso || data.valorEstimadoProximoConcurso || 0),
       winners: data.ganhadores || data.quantidadeGanhadores || 0,
       nextPrize: formatPrize(data.valor_estimado_proximo_concurso || data.valorEstimadoProximoConcurso || data.valorAcumuladoProximoConcurso || 0),
       nextDate: formatDate(data.dataProximoConcurso || ""),
       color: config.color,
       maxNumber: config.maxNumber,
       selectCount: config.selectCount,
       accumulated: data.acumulado || data.acumulou || false,
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
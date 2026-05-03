import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/LotteryBall";
import { Search, Check, X, Loader2, Trophy, AlertCircle, Heart, CalendarDays, Users, ScanSearch, Target, Award, ShieldCheck, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { motion } from "framer-motion";

const MESES_DIA_DE_SORTE = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TIMEMANIA_TEAMS = [
  "ABC", "América (MG)", "América (RN)", "Aparecidense", "Associação Ferroviária",
  "Atlético Acreano", "Atlético Goianiense", "Atlético Mineiro", "Altos (PI)", "Avaí",
  "Boa Esporte", "Boavista", "Botafogo (PB)", "Botafogo (RJ)", "Botafogo (SP)",
  "Bragantino", "Brasiliense", "Brasil de Pelotas", "Brusque",
  "Campinense", "Ceará", "Chapecoense", "Cianorte", "Confiança",
  "Corinthians", "Coritiba", "CRB", "Criciúma", "Cruzeiro", "CSA", "Cuiabá",
  "Figueirense", "Flamengo", "Floresta", "Fluminense",
  "Ferroviário (CE)", "Fortaleza", "Atlético Cearense",
  "Goiás", "Grêmio", "Guarani",
  "Imperatriz", "Internacional", "Ituano",
  "Jacuipense", "Joinville", "Juazeirense", "Juventude",
  "Londrina", "Luverdense",
  "Manaus", "Mirassol", "Moto Club",
  "Náutico", "Novorizontino",
  "Oeste", "Operário (PR)",
  "Palmeiras", "Paraná Clube", "Athletico Paranaense", "Paysandu", "Ponte Preta",
  "Remo",
  "Sampaio Corrêa", "Santa Cruz", "Santos", "São Bento", "São José (RS)",
  "São Paulo", "São Raimundo (RR)", "Caxias do Sul", "Sport",
  "Tombense", "Treze",
  "Vasco", "Vila Nova", "Vitória", "Volta Redonda",
  "Ypiranga (RS)", "Bahia",
];

interface LotteryOption {
  id: string;
  name: string;
  maxNumber: number;
  selectCount: number;
}

const LOTTERIES: LotteryOption[] = [
  { id: "megasena", name: "Mega-Sena", maxNumber: 60, selectCount: 6 },
  { id: "lotofacil", name: "Lotofácil", maxNumber: 25, selectCount: 15 },
  { id: "quina", name: "Quina", maxNumber: 80, selectCount: 5 },
  { id: "lotomania", name: "Lotomania", maxNumber: 100, selectCount: 20 },
  { id: "duplasena", name: "Dupla Sena", maxNumber: 50, selectCount: 6 },
  { id: "diadesorte", name: "Dia de Sorte", maxNumber: 31, selectCount: 7 },
  { id: "supersete", name: "Super Sete", maxNumber: 10, selectCount: 7 },
  { id: "maismilionaria", name: "+Milionária", maxNumber: 50, selectCount: 6 },
  { id: "timemania", name: "Timemania", maxNumber: 80, selectCount: 7 },
  { id: "federal", name: "Federal", maxNumber: 99999, selectCount: 1 },
];

type LotteryVariant = "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania";

const PRIZE_TIERS: Record<string, Record<number, string>> = {
  megasena: { 6: "Sena (1ª Faixa) 🏆", 5: "Quina (2ª Faixa)", 4: "Quadra (3ª Faixa)" },
  lotofacil: { 15: "15 acertos 🏆", 14: "14 acertos", 13: "13 acertos", 12: "12 acertos", 11: "11 acertos" },
  quina: { 5: "Quina (1ª Faixa) 🏆", 4: "Quadra (2ª Faixa)", 3: "Terno (3ª Faixa)", 2: "Duque (4ª Faixa)" },
  lotomania: { 20: "20 acertos 🏆", 19: "19 acertos", 18: "18 acertos", 17: "17 acertos", 16: "16 acertos", 15: "15 acertos", 0: "0 acertos" },
  duplasena: { 6: "Sena 🏆", 5: "Quina", 4: "Quadra", 3: "Terno" },
  diadesorte: { 7: "7 acertos 🏆", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos" },
  supersete: { 7: "7 acertos 🏆", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
  maismilionaria: { 6: "6 acertos 🏆", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos", 2: "2 acertos" },
  timemania: { 7: "7 acertos 🏆", 6: "6 acertos", 5: "5 acertos", 4: "4 acertos", 3: "3 acertos" },
};

interface PrizeTierResult {
  tier: string;
  hits: number;
  combos: number;
  unitPrize: number;
  totalPrize: number;
}

interface DrawResult {
  label?: string;
  drawnNumbers: number[];
  matchedNumbers: number[];
  unmatchedNumbers: number[];
  totalMatches: number;
  prizeTier: string | null;
  prizeValue: number | null;
  allPrizes: PrizeTierResult[];
  betCount: number;
}

interface TrevoResult {
  drawnTrevos: number[];
  matchedTrevos: number[];
  unmatchedTrevos: number[];
}

interface CheckResult {
  concurso: number;
  date: string;
  draws: DrawResult[];
  trevos?: TrevoResult;
  timeCoracao?: { drawn: string; selected: string; matched: boolean };
  mesSorte?: { drawn: string; selected: string; matched: boolean };
  federal?: {
    betBilhete: string;
    tiers: { posicao: number; bilhete: string; valorPremio: number; matched: boolean }[];
    derivedTiers: { key: string; label: string; description: string; matchedWith: string[]; valorPremio: number }[];
    totalWon: number;
  };
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

function findPrizeValue(premiacoes: any[], matches: number, lotteryId: string): number | null {
  if (!premiacoes || premiacoes.length === 0) return null;
  for (const p of premiacoes) {
    const desc = (p.descricao || p.nome || "").toLowerCase();
    const faixa = p.faixa;
    if (lotteryId === "megasena") {
      if (matches === 6 && faixa === 1) return p.valorPremio || 0;
      if (matches === 5 && faixa === 2) return p.valorPremio || 0;
      if (matches === 4 && faixa === 3) return p.valorPremio || 0;
    } else if (lotteryId === "quina") {
      if (matches === 5 && faixa === 1) return p.valorPremio || 0;
      if (matches === 4 && faixa === 2) return p.valorPremio || 0;
      if (matches === 3 && faixa === 3) return p.valorPremio || 0;
      if (matches === 2 && faixa === 4) return p.valorPremio || 0;
    } else if (lotteryId === "duplasena") {
      if (matches === 6 && faixa === 1) return p.valorPremio || 0;
      if (matches === 5 && faixa === 2) return p.valorPremio || 0;
      if (matches === 4 && faixa === 3) return p.valorPremio || 0;
      if (matches === 3 && faixa === 4) return p.valorPremio || 0;
    } else {
      if (desc.includes(`${matches} acerto`) || desc.includes(`${matches} ponto`)) {
        return p.valorPremio || 0;
      }
    }
  }
  return null;
}

// Calculate all prize tiers won considering the number of numbers bet
function calculateAllPrizes(
  lotteryId: string,
  betCount: number,
  matchedCount: number,
  selectCount: number,
  premiacoes: any[]
): { tier: string; hits: number; combos: number; unitPrize: number; totalPrize: number }[] {
  const tiers = PRIZE_TIERS[lotteryId];
  if (!tiers || !premiacoes || premiacoes.length === 0) return [];

  const unmatchedCount = betCount - matchedCount;
  const results: { tier: string; hits: number; combos: number; unitPrize: number; totalPrize: number }[] = [];

  for (const hitsStr of Object.keys(tiers)) {
    const hits = parseInt(hitsStr, 10);
    if (hits > matchedCount) continue;
    // Number of winning combinations: C(matched, hits) * C(unmatched, selectCount - hits)
    const combos = comb(matchedCount, hits) * comb(unmatchedCount, selectCount - hits);
    if (combos <= 0) continue;

    const unitPrize = findPrizeValue(premiacoes, hits, lotteryId);
    if (unitPrize === null) continue;

    results.push({
      tier: tiers[hits],
      hits,
      combos,
      unitPrize,
      totalPrize: combos * unitPrize,
    });
  }

  return results.sort((a, b) => b.hits - a.hits);
}

function buildDrawResult(lotteryId: string, betNumbers: number[], drawnNumbers: number[], selectCount: number, label?: string, premiacoes?: any[]): DrawResult {
  const matched = betNumbers.filter(n => drawnNumbers.includes(n)).sort((a, b) => a - b);
  const unmatched = betNumbers.filter(n => !drawnNumbers.includes(n)).sort((a, b) => a - b);
  const prizeTier = PRIZE_TIERS[lotteryId]?.[matched.length] || null;
  const allPrizes = calculateAllPrizes(lotteryId, betNumbers.length, matched.length, selectCount, premiacoes || []);
  const topPrize = allPrizes.length > 0 ? allPrizes[0] : null;
  return {
    label,
    drawnNumbers,
    matchedNumbers: matched,
    unmatchedNumbers: unmatched,
    totalMatches: matched.length,
    prizeTier,
    prizeValue: topPrize ? topPrize.totalPrize : null,
    allPrizes,
    betCount: betNumbers.length,
  };
}



function DrawResultBlock({ draw, variant }: { draw: DrawResult; variant: LotteryVariant }) {
  return (
    <div className="space-y-2">
      {draw.label && (
        <p className="text-xs sm:text-sm font-semibold text-foreground">{draw.label}</p>
      )}

      {/* Drawn numbers */}
      <div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Números sorteados:</p>
        <div className="flex flex-wrap gap-1.5">
          {draw.drawnNumbers.map((n, i) => (
            <LotteryBall key={i} number={n} size="sm" variant={variant} animated={false} />
          ))}
        </div>
      </div>

      {/* Match summary */}
      <div className="rounded-lg p-3 bg-secondary/50 border border-border">
        <div className="flex items-center gap-2 mb-2">
          {draw.prizeTier ? (
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          )}
          <span className="font-semibold text-sm sm:text-base">
            {draw.totalMatches} acerto{draw.totalMatches !== 1 ? "s" : ""}
          </span>
        </div>

        {draw.allPrizes.length > 0 && (
          <div className="mb-2 space-y-2">
            {draw.betCount > (draw.matchedNumbers.length + draw.unmatchedNumbers.length - draw.unmatchedNumbers.length) && draw.allPrizes.some(p => p.combos > 1) && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Aposta com {draw.betCount} números — prêmio calculado por combinações
              </p>
            )}
            {draw.allPrizes.map((p, i) => (
              <div key={i} className="space-y-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  {p.tier}{p.combos > 1 ? ` (×${p.combos} combinações)` : ""}
                </Badge>
                {p.totalPrize > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-bold text-emerald-400">
                      {p.totalPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      {p.combos > 1 && (
                        <span className="font-normal text-muted-foreground ml-1">
                          ({p.combos}× {p.unitPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {p.unitPrize === 0 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground italic">
                    Nenhum ganhador nesta faixa — prêmio acumula
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {draw.allPrizes.length === 0 && draw.prizeTier && (
          <div className="mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              {draw.prizeTier}
            </Badge>
          </div>
        )}

        {draw.matchedNumbers.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Acertos:
            </p>
            <div className="flex flex-wrap gap-1">
              {draw.matchedNumbers.map(n => (
                <span key={n} className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-bold">
                  {n.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>
        )}

        {draw.unmatchedNumbers.length > 0 && (
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <X className="w-3 h-3 text-destructive" /> Erros:
            </p>
            <div className="flex flex-wrap gap-1">
              {draw.unmatchedNumbers.map(n => (
                <span key={n} className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] sm:text-xs font-bold">
                  {n.toString().padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PrizeChecker() {
  const [selectedLottery, setSelectedLottery] = useState("");
  const [concurso, setConcurso] = useState("");
  const [numbersInput, setNumbersInput] = useState("");
  const [trevosInput, setTrevosInput] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamOpen, setTeamOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [cotas, setCotas] = useState("1");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const lottery = useMemo(() => LOTTERIES.find(l => l.id === selectedLottery), [selectedLottery]);

  const handleCheck = async () => {
    if (!selectedLottery || !numbersInput.trim()) {
      toast.error("Preencha a loteria e os números apostados.");
      return;
    }

    // Federal: a single 5-digit ticket number
    let parsed: number[] = [];
    let federalBilhete = "";
    if (selectedLottery === "federal") {
      const digits = numbersInput.replace(/\D/g, "");
      if (!digits || digits.length === 0 || digits.length > 6) {
        toast.error("Informe um bilhete válido de até 6 dígitos.");
        return;
      }
      federalBilhete = digits.padStart(6, "0");
    } else {
      parsed = numbersInput
        .split(/[\s,;]+/)
        .map(n => parseInt(n.trim(), 10))
        .filter(n => !isNaN(n));

      if (parsed.length === 0) {
        toast.error("Informe números válidos separados por vírgula ou espaço.");
        return;
      }

      if (lottery) {
        const invalid = parsed.filter(n => n < (selectedLottery === "lotomania" ? 0 : 1) || n > lottery.maxNumber);
        if (invalid.length > 0) {
          toast.error(`Números fora do intervalo (1 a ${lottery.maxNumber}): ${invalid.join(", ")}`);
          return;
        }
      }
    }

    setIsChecking(true);
    setResult(null);

    try {
      const concursoParam = concurso.trim() ? `/${concurso.trim()}` : "";
      const url = `https://loteriascaixa-api.herokuapp.com/api/${selectedLottery}${concursoParam}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Concurso não encontrado");

      const data = await response.json();
      const apiData = Array.isArray(data) ? data[0] : data;
      if (!apiData) throw new Error("Dados não encontrados");

      const draws: DrawResult[] = [];
      let federalResult: CheckResult["federal"] | undefined;

      if (selectedLottery === "federal") {
        // Federal: bilhetes vêm em `dezenas` (ou `listaDezenas`), alinhados por
        // índice com `premiacoes` (faixa 1..5). Não há campo `bilhete` dentro
        // de cada premiação na API, então reconstruímos o vínculo posicional.
        const rawBilhetes: string[] = (apiData.dezenas || apiData.listaDezenas || [])
          .map((d: any) => String(d).replace(/\D/g, ""));
        const premiacoes: any[] = Array.isArray(apiData.premiacoes) ? apiData.premiacoes : [];

        // Determina o tamanho de comparação: a API atual usa 6 dígitos, mas
        // bilhetes antigos podiam ter 5. Usamos o maior comprimento encontrado.
        const ticketLen = Math.max(
          5,
          ...rawBilhetes.map((b) => b.length),
          federalBilhete.replace(/^0+/, "").length
        );
        const normalize = (s: string) => s.padStart(ticketLen, "0").slice(-ticketLen);
        const betNormalized = normalize(federalBilhete);

        // Ordena premiações por faixa e pareia com bilhetes pelo índice da faixa.
        const sortedPrem = [...premiacoes].sort(
          (a, b) => (Number(a.faixa) || 0) - (Number(b.faixa) || 0)
        );

        const tiers = sortedPrem.map((p: any, idx: number) => {
          const posicao = Number(p.faixa ?? p.posicao ?? idx + 1);
          // Se a API algum dia incluir `bilhete` na premiação, respeitamos.
          const explicit = String(p.bilhete ?? p.numeroBilhete ?? "").replace(/\D/g, "");
          const fromList = rawBilhetes[posicao - 1] ?? rawBilhetes[idx] ?? "";
          const bilhete = normalize(explicit || fromList);
          return {
            posicao,
            bilhete,
            valorPremio: Number(p.valorPremio) || 0,
            matched: bilhete.length > 0 && bilhete === betNormalized,
          };
        });

        // ===== Faixas derivadas (Milhar, Centena, Dezena, Aproximações,
        // Dezenas Finais, Unidade) — não vêm na API mas são oficiais da Caixa.
        // Calculadas apenas para conferência do bilhete; valores não são
        // exibidos como prêmio porque variam conforme a extração e a Caixa
        // não publica esses rateios na API pública.
        const derivedTiers: { key: string; label: string; description: string; matchedWith: string[]; valorPremio: number }[] = [];
        const bet = betNormalized;
        if (bet.length >= 4 && rawBilhetes.length > 0) {
          const all = rawBilhetes.map((b) => normalize(b));
          const principal = all[0]; // 1º prêmio (base de aproximações/finais/unidade)

          // Milhar: últimos 4 dígitos coincidentes com algum dos 5 prêmios
          const milharBet = bet.slice(-4);
          const milharMatch = all.filter((b) => b.slice(-4) === milharBet);
          if (milharMatch.length > 0) {
            derivedTiers.push({
              key: "milhar",
              label: "Milhar",
              description: "Últimos 4 dígitos iguais a um dos prêmios principais",
              matchedWith: milharMatch,
              valorPremio: 0,
            });
          }

          // Centena: últimos 3 dígitos coincidentes com algum dos 5 prêmios
          const centenaBet = bet.slice(-3);
          const centenaMatch = all.filter((b) => b.slice(-3) === centenaBet);
          if (centenaMatch.length > 0) {
            derivedTiers.push({
              key: "centena",
              label: "Centena",
              description: "Últimos 3 dígitos iguais a um dos prêmios principais",
              matchedWith: centenaMatch,
              valorPremio: 0,
            });
          }

          // Dezena: últimos 2 dígitos coincidentes com algum dos 5 prêmios
          const dezenaBet = bet.slice(-2);
          const dezenaMatch = all.filter((b) => b.slice(-2) === dezenaBet);
          if (dezenaMatch.length > 0) {
            derivedTiers.push({
              key: "dezena",
              label: "Dezena",
              description: "Últimos 2 dígitos iguais a um dos prêmios principais",
              matchedWith: dezenaMatch,
              valorPremio: 0,
            });
          }

          if (principal) {
            const principalNum = parseInt(principal, 10);

            // Aproximações: imediatamente anterior/posterior ao 1º prêmio
            const aproxMatches: string[] = [];
            if (parseInt(bet, 10) === principalNum - 1) aproxMatches.push(principal);
            if (parseInt(bet, 10) === principalNum + 1) aproxMatches.push(principal);
            if (aproxMatches.length > 0) {
              derivedTiers.push({
                key: "aproximacoes",
                label: "Aproximações",
                description: "Bilhete imediatamente anterior ou posterior ao 1º prêmio",
                matchedWith: aproxMatches,
                valorPremio: 0,
              });
            }

            // Dezenas Finais: 3 dezenas anteriores ou 3 posteriores à dezena
            // do 1º prêmio (exceto as já cobertas por aproximação anterior/posterior)
            const dezPrincipal = principalNum % 100;
            const dezBet = parseInt(bet, 10) % 100;
            const isAprox = parseInt(bet, 10) === principalNum - 1 || parseInt(bet, 10) === principalNum + 1;
            const diff = dezBet - dezPrincipal;
            if (!isAprox && diff !== 0 && diff >= -3 && diff <= 3) {
              derivedTiers.push({
                key: "dezenas-finais",
                label: "Dezenas Finais",
                description: "Dezena final entre as 3 anteriores ou 3 posteriores à do 1º prêmio",
                matchedWith: [principal],
                valorPremio: 0,
              });
            }

            // Unidade do 1º prêmio
            if (bet.slice(-1) === principal.slice(-1)) {
              derivedTiers.push({
                key: "unidade",
                label: "Unidade do 1º Prêmio",
                description: "Último dígito igual ao do 1º prêmio",
                matchedWith: [principal],
                valorPremio: 0,
              });
            }
          }
        }

        const totalWon = tiers.filter((t) => t.matched).reduce((s, t) => s + t.valorPremio, 0);
        federalResult = { betBilhete: betNormalized, tiers, derivedTiers, totalWon };
      } else if (selectedLottery === "duplasena") {
        // Dupla Sena: two independent draws
        const draw1Numbers: number[] = (apiData.dezenas || apiData.listaDezenas || [])
          .map((d: string) => parseInt(d, 10));
        
        // Second draw: try dezenas2, listaDezenasSegundoSorteio, or split if numbers > selectCount
        let draw2Numbers: number[] = [];
        if (apiData.dezenas2) {
          draw2Numbers = apiData.dezenas2.map((d: string) => parseInt(d, 10));
        } else if (apiData.listaDezenasSegundoSorteio) {
          draw2Numbers = apiData.listaDezenasSegundoSorteio.map((d: string) => parseInt(d, 10));
        } else if (draw1Numbers.length > 6) {
          // API might concatenate both draws
          draw2Numbers = draw1Numbers.splice(6);
        }

        const premiacoes1 = apiData.premiacoes?.filter((p: any) => p.descricao?.toLowerCase().includes("1º") || p.faixa <= 4) || apiData.premiacoes || [];
        const premiacoes2 = apiData.premiacoes2 || premiacoes1;
        draws.push(buildDrawResult("duplasena", parsed, draw1Numbers, 6, "1º Sorteio", premiacoes1));
        if (draw2Numbers.length > 0) {
          draws.push(buildDrawResult("duplasena", parsed, draw2Numbers, 6, "2º Sorteio", premiacoes2));
        }
      } else {
        const drawnNumbers: number[] = (apiData.dezenas || apiData.listaDezenas || [])
          .map((d: string) => parseInt(d, 10));
        draws.push(buildDrawResult(selectedLottery, parsed, drawnNumbers, lottery?.selectCount || parsed.length, undefined, apiData.premiacoes));
      }

      // Handle trevos for +Milionária
      let trevosResult: TrevoResult | undefined;
      if (selectedLottery === "maismilionaria") {
        const drawnTrevos: number[] = (apiData.trevos || [])
          .map((t: string | number) => typeof t === "string" ? parseInt(t, 10) : t);
        const parsedTrevos = trevosInput
          .split(/[\s,;]+/)
          .map(n => parseInt(n.trim(), 10))
          .filter(n => !isNaN(n));
        if (drawnTrevos.length > 0 && parsedTrevos.length > 0) {
          trevosResult = {
            drawnTrevos,
            matchedTrevos: parsedTrevos.filter(t => drawnTrevos.includes(t)).sort((a, b) => a - b),
            unmatchedTrevos: parsedTrevos.filter(t => !drawnTrevos.includes(t)).sort((a, b) => a - b),
          };
        }
      }

      // Handle Time do Coração for Timemania
      let timeCoracaoResult: { drawn: string; selected: string; matched: boolean } | undefined;
      if (selectedLottery === "timemania" && selectedTeam) {
        const drawnTeam = apiData.timeCoracao || apiData.nomeTimeCoracao || "";
        timeCoracaoResult = {
          drawn: drawnTeam,
          selected: selectedTeam,
          matched: drawnTeam.toLowerCase().includes(selectedTeam.toLowerCase()) || selectedTeam.toLowerCase().includes(drawnTeam.toLowerCase()),
        };
      }

      // Handle Mês da Sorte for Dia de Sorte
      let mesSorteResult: { drawn: string; selected: string; matched: boolean } | undefined;
      if (selectedLottery === "diadesorte" && selectedMonth) {
        const drawnMonth = apiData.mesSorte || apiData.mesSort || "";
        mesSorteResult = {
          drawn: drawnMonth,
          selected: selectedMonth,
          matched: drawnMonth.toLowerCase() === selectedMonth.toLowerCase(),
        };
      }

      const bestDraw = draws.length > 0
        ? draws.reduce((best, d) => d.totalMatches > best.totalMatches ? d : best, draws[0])
        : undefined;

      setResult({
        concurso: apiData.concurso || apiData.numero || 0,
        date: apiData.data || apiData.dataApuracao || "",
        draws,
        trevos: trevosResult,
        timeCoracao: timeCoracaoResult,
        mesSorte: mesSorteResult,
        federal: federalResult,
      });

      const federalWon = !!federalResult && federalResult.totalWon > 0;
      if ((bestDraw && bestDraw.prizeTier) || federalWon) {
        const msg = federalWon
          ? `Parabéns! Seu bilhete foi premiado!`
          : `Parabéns! Você acertou ${bestDraw!.totalMatches} números${draws.length > 1 ? ` no melhor sorteio` : ""}!`;
        toast.success(msg);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao buscar resultado. Verifique o concurso.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setNumbersInput("");
    setTrevosInput("");
    setSelectedTeam("");
    setSelectedMonth("");
    setConcurso("");
    setCotas("1");
  };

  return (
    <Card className="border-border bg-card overflow-hidden relative">
      {/* Decorative floating icons */}
      <div className="absolute top-3 right-4 opacity-10 pointer-events-none">
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
          <Target className="w-14 h-14 sm:w-16 sm:h-16 text-accent" />
        </motion.div>
      </div>
      <div className="absolute bottom-6 left-3 opacity-[0.06] pointer-events-none">
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
          <Award className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
        </motion.div>
      </div>

      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 relative z-10">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            <ScanSearch className="w-5 h-5 sm:w-6 sm:h-6 text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.5)]" />
          </motion.div>
          <span className="text-gradient-blue font-bold">Conferir Aposta</span>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </motion.div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          🎯 Insira seus números para conferir se você ganhou
        </p>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6 relative z-10">
        {/* Lottery Select */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Loteria</Label>
          <Select value={selectedLottery} onValueChange={(v) => { setSelectedLottery(v); setResult(null); }}>
            <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Selecione a loteria" />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="text-xs sm:text-sm">
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contest Number */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Concurso (opcional)</Label>
          <Input
            type="number"
            placeholder="Deixe vazio para o último sorteio"
            value={concurso}
            onChange={e => setConcurso(e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>

        {/* Numbers Input */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">
            {selectedLottery === "federal" ? "Número do bilhete" : "Números apostados"}
            {lottery && selectedLottery !== "federal" && (
              <span className="text-muted-foreground ml-1">
                (1 a {lottery.maxNumber})
              </span>
            )}
            {selectedLottery === "federal" && (
              <span className="text-muted-foreground ml-1">(até 6 dígitos)</span>
            )}
          </Label>
          <Input
            placeholder={selectedLottery === "federal" ? "Ex: 065393" : "Ex: 5, 12, 23, 34, 45, 60"}
            value={numbersInput}
            onChange={e => setNumbersInput(e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
            inputMode={selectedLottery === "federal" ? "numeric" : undefined}
            maxLength={selectedLottery === "federal" ? 6 : undefined}
          />
          {lottery && selectedLottery !== "federal" && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Aposta padrão: {lottery.selectCount} números • Separe por vírgula ou espaço
              {selectedLottery === "duplasena" && " • Mesmos números valem para ambos os sorteios"}
            </p>
          )}
          {selectedLottery === "federal" && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Informe o número do seu bilhete (será comparado com os 5 prêmios sorteados)
            </p>
          )}
        </div>

        {/* Trevos Input - only for +Milionária */}
        {selectedLottery === "maismilionaria" && (
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm">
              Trevos apostados
              <span className="text-muted-foreground ml-1">(1 a 6)</span>
            </Label>
            <Input
              placeholder="Ex: 2, 5"
              value={trevosInput}
              onChange={e => setTrevosInput(e.target.value)}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Aposta padrão: 2 trevos • Separe por vírgula ou espaço
            </p>
          </div>
        )}

        {/* Time do Coração - only for Timemania */}
        {selectedLottery === "timemania" && (
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-primary" />
              Time do Coração
            </Label>
            <Popover open={teamOpen} onOpenChange={setTeamOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={teamOpen}
                  className="w-full justify-between h-9 sm:h-10 text-xs sm:text-sm font-normal"
                >
                  {selectedTeam || "Selecione o time..."}
                  <Search className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar time..." className="h-9 text-xs sm:text-sm" />
                  <CommandList>
                    <CommandEmpty className="text-xs py-4">Nenhum time encontrado.</CommandEmpty>
                    <CommandGroup>
                      {TIMEMANIA_TEAMS.sort().map(team => (
                        <CommandItem
                          key={team}
                          value={team}
                          onSelect={(val) => {
                            setSelectedTeam(val === selectedTeam ? "" : val);
                            setTeamOpen(false);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          <Check className={`mr-2 h-3.5 w-3.5 ${selectedTeam === team ? "opacity-100" : "opacity-0"}`} />
                          {team}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Selecione o time apostado para conferir o Time do Coração
            </p>
          </div>
        )}

        {/* Mês da Sorte - only for Dia de Sorte */}
        {selectedLottery === "diadesorte" && (
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              Mês da Sorte
            </Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Selecione o mês..." />
              </SelectTrigger>
              <SelectContent>
                {MESES_DIA_DE_SORTE.map(mes => (
                  <SelectItem key={mes} value={mes} className="text-xs sm:text-sm">
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Selecione o mês apostado para conferir o Mês da Sorte
            </p>
          </div>
        )}

        {/* Cotas (Bolão) */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            Cotas do bolão (opcional)
          </Label>
          <Input
            type="number"
            min="1"
            placeholder="1"
            value={cotas}
            onChange={e => setCotas(e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Informe o número de cotas para dividir o prêmio (bolão)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheck}
            disabled={isChecking || !selectedLottery || !numbersInput.trim()}
            className="flex-1 h-9 sm:h-10 text-xs sm:text-sm gap-1.5"
          >
            {isChecking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            Conferir
          </Button>
          {result && (
            <Button variant="outline" onClick={handleReset} className="h-9 sm:h-10 text-xs sm:text-sm">
              Limpar
            </Button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-3 pt-2 border-t border-border animate-fade-in">
            {/* Contest info */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                Concurso <span className="font-semibold text-foreground">{result.concurso}</span>
              </span>
              <span className="text-muted-foreground">{result.date}</span>
            </div>

            {/* Draw results */}
            {result.draws?.map((draw, idx) => (
              <DrawResultBlock key={idx} draw={draw} variant={selectedLottery as LotteryVariant} />
            ))}

            {/* Trevos result for +Milionária */}
            {result.trevos && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-foreground">Trevos</p>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Trevos sorteados:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.trevos.drawnTrevos.map((t, i) => (
                      <span key={i} className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-lg">
                        🍀{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm sm:text-base">
                      {result.trevos.matchedTrevos.length} trevo{result.trevos.matchedTrevos.length !== 1 ? "s" : ""} acertado{result.trevos.matchedTrevos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {result.trevos.matchedTrevos.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" /> Acertos:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.trevos.matchedTrevos.map(t => (
                          <span key={t} className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-bold">
                            🍀{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.trevos.unmatchedTrevos.length > 0 && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <X className="w-3 h-3 text-destructive" /> Erros:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.trevos.unmatchedTrevos.map(t => (
                          <span key={t} className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-[10px] sm:text-xs font-bold">
                            🍀{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Time do Coração result for Timemania */}
            {result.timeCoracao && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  Time do Coração
                </p>
                <div className={`rounded-lg p-3 border ${result.timeCoracao.matched ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/5 border-destructive/20"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.timeCoracao.matched ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`font-semibold text-sm sm:text-base ${result.timeCoracao.matched ? "text-emerald-400" : "text-destructive"}`}>
                      {result.timeCoracao.matched ? "Acertou o Time do Coração! 🎉" : "Não acertou o Time do Coração"}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-muted-foreground">
                      Time sorteado: <span className="font-semibold text-foreground">{result.timeCoracao.drawn}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Seu time: <span className="font-semibold text-foreground">{result.timeCoracao.selected}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mês da Sorte result for Dia de Sorte */}
            {result.mesSorte && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Mês da Sorte
                </p>
                <div className={`rounded-lg p-3 border ${result.mesSorte.matched ? "bg-emerald-500/10 border-emerald-500/30" : "bg-destructive/5 border-destructive/20"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.mesSorte.matched ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`font-semibold text-sm sm:text-base ${result.mesSorte.matched ? "text-emerald-400" : "text-destructive"}`}>
                      {result.mesSorte.matched ? "Acertou o Mês da Sorte! 🎉" : "Não acertou o Mês da Sorte"}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-muted-foreground">
                      Mês sorteado: <span className="font-semibold text-foreground">{result.mesSorte.drawn}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Seu mês: <span className="font-semibold text-foreground">{result.mesSorte.selected}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Federal result */}
            {result.federal && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-primary" />
                  Loteria Federal — Bilhete {result.federal.betBilhete}
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  {result.federal.tiers.map((t) => (
                    <div
                      key={t.posicao}
                      className={`flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm border-b border-border last:border-b-0 ${
                        t.matched ? "bg-emerald-500/10" : "bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {t.posicao}º Prêmio
                        </Badge>
                        <span className="font-mono font-semibold text-foreground">{t.bilhete}</span>
                        {t.matched && (
                          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/40 text-[10px] sm:text-xs">
                            ✓ Você ganhou!
                          </Badge>
                        )}
                      </div>
                      <span className={`font-semibold ${t.matched ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {t.valorPremio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  ))}
                </div>
                {result.federal.totalWon === 0 && result.federal.derivedTiers.length === 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground italic flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Seu bilhete não foi premiado neste concurso.
                  </p>
                )}

                {/* Faixas derivadas: Milhar, Centena, Dezena, Aproximações, Dezenas Finais, Unidade */}
                {result.federal.derivedTiers.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] sm:text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Premiações secundárias
                    </p>
                    <div className="space-y-1">
                      {result.federal.derivedTiers.map((dt) => (
                        <div key={dt.key} className="flex items-start justify-between gap-2 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                          <div className="min-w-0">
                            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">{dt.label}</Badge>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{dt.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-muted-foreground">Vínculo</p>
                            <p className="font-mono text-[11px] sm:text-xs font-semibold text-foreground">{dt.matchedWith.join(", ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground italic">
                      ℹ️ Os valores das faixas secundárias variam por extração e não são divulgados pela API. Consulte o site da Caixa para o rateio oficial.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Prize Summary */}
            {(() => {
              const allPrizes = result.draws.flatMap(d => d.allPrizes);
              const drawsTotal = allPrizes.reduce((sum, p) => sum + p.totalPrize, 0);
              const federalTotal = result.federal?.totalWon || 0;
              const totalWon = drawsTotal + federalTotal;
              const hasAnyPrize = allPrizes.length > 0 || federalTotal > 0;
              if (!hasAnyPrize) return null;
              const numCotas = Math.max(1, parseInt(cotas) || 1);
              const totalPerCota = totalWon / numCotas;
              return (
                <div className="rounded-lg p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm sm:text-base text-foreground">Resumo da Conferência</span>
                  </div>

                  <div className="space-y-1.5">
                    {result.draws.map((draw, di) =>
                      draw.allPrizes.map((p, pi) => (
                        <div key={`${di}-${pi}`} className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            {draw.label ? `${draw.label} — ` : ""}{p.tier}
                            {p.combos > 1 ? ` (×${p.combos})` : ""}
                          </span>
                          <span className={`font-semibold ${p.totalPrize > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                            {p.totalPrize > 0
                              ? p.totalPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "Acumulou"}
                          </span>
                        </div>
                      ))
                    )}
                    {result.federal?.tiers.filter(t => t.matched).map(t => (
                      <div key={t.posicao} className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{t.posicao}º Prêmio (bilhete {t.bilhete})</span>
                        <span className="font-semibold text-emerald-400">
                          {t.valorPremio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-primary/20 pt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-foreground">Total bruto:</span>
                      <span className={`font-extrabold text-base sm:text-lg ${totalWon > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {totalWon > 0
                          ? totalWon.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "R$ 0,00 (acumulou)"}
                      </span>
                    </div>
                    {numCotas > 1 && totalWon > 0 && (
                      <div className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2">
                        <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Sua cota ({1}/{numCotas}):
                        </span>
                        <span className="font-extrabold text-base sm:text-lg text-primary">
                          {totalPerCota.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

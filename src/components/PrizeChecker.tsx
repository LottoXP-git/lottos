import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/LotteryBall";
import { Search, Check, X, Loader2, Trophy, AlertCircle, Heart, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

interface DrawResult {
  label?: string;
  drawnNumbers: number[];
  matchedNumbers: number[];
  unmatchedNumbers: number[];
  totalMatches: number;
  prizeTier: string | null;
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
}

function buildDrawResult(lotteryId: string, betNumbers: number[], drawnNumbers: number[], label?: string): DrawResult {
  const matched = betNumbers.filter(n => drawnNumbers.includes(n)).sort((a, b) => a - b);
  const unmatched = betNumbers.filter(n => !drawnNumbers.includes(n)).sort((a, b) => a - b);
  return {
    label,
    drawnNumbers,
    matchedNumbers: matched,
    unmatchedNumbers: unmatched,
    totalMatches: matched.length,
    prizeTier: PRIZE_TIERS[lotteryId]?.[matched.length] || null,
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

        {draw.prizeTier && (
          <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 text-xs">
            {draw.prizeTier}
          </Badge>
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
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const lottery = useMemo(() => LOTTERIES.find(l => l.id === selectedLottery), [selectedLottery]);

  const handleCheck = async () => {
    if (!selectedLottery || !numbersInput.trim()) {
      toast.error("Preencha a loteria e os números apostados.");
      return;
    }

    const parsed = numbersInput
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

      if (selectedLottery === "duplasena") {
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

        draws.push(buildDrawResult("duplasena", parsed, draw1Numbers, "1º Sorteio"));
        if (draw2Numbers.length > 0) {
          draws.push(buildDrawResult("duplasena", parsed, draw2Numbers, "2º Sorteio"));
        }
      } else {
        const drawnNumbers: number[] = (apiData.dezenas || apiData.listaDezenas || [])
          .map((d: string) => parseInt(d, 10));
        draws.push(buildDrawResult(selectedLottery, parsed, drawnNumbers));
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

      const bestDraw = draws.reduce((best, d) => d.totalMatches > best.totalMatches ? d : best, draws[0]);

      setResult({
        concurso: apiData.concurso || apiData.numero || 0,
        date: apiData.data || apiData.dataApuracao || "",
        draws,
        trevos: trevosResult,
        timeCoracao: timeCoracaoResult,
        mesSorte: mesSorteResult,
      });

      if (bestDraw.prizeTier) {
        toast.success(`Parabéns! Você acertou ${bestDraw.totalMatches} números${draws.length > 1 ? ` no melhor sorteio` : ""}!`);
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
  };

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Conferir Aposta
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Insira seus números para conferir se você ganhou
        </p>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
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
            Números apostados
            {lottery && (
              <span className="text-muted-foreground ml-1">
                (1 a {lottery.maxNumber})
              </span>
            )}
          </Label>
          <Input
            placeholder="Ex: 5, 12, 23, 34, 45, 60"
            value={numbersInput}
            onChange={e => setNumbersInput(e.target.value)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          />
          {lottery && (
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Aposta padrão: {lottery.selectCount} números • Separe por vírgula ou espaço
              {selectedLottery === "duplasena" && " • Mesmos números valem para ambos os sorteios"}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

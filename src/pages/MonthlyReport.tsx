import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LotteryBall } from "@/components/LotteryBall";
import { useLotteryResults } from "@/hooks/useLotteryResults";
import {
  buildReportEntriesFromHistory,
  buildReportEntriesFromRange,
  generateMonthlyReportPdf,
} from "@/lib/monthlyReportPdf";
import { generateSmartPicks } from "@/data/lotteryData";
import type { LotteryResult } from "@/data/lotteryData";
import { Download, FileText, Loader2, TrendingUp, TrendingDown, Sparkles, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const NUMERIC_IDS = [
  "megasena", "lotofacil", "quina", "lotomania", "duplasena",
  "diadesorte", "supersete", "maismilionaria", "timemania", "federal",
] as const;

const PERIOD_OPTIONS = [
  { value: "7", label: "7 dias", count: 30 },
  { value: "30", label: "30 dias", count: 60 },
  { value: "90", label: "90 dias", count: 120 },
  { value: "custom", label: "Personalizado", count: 200 },
] as const;

const VARIANT_MAP: Record<string, Parameters<typeof LotteryBall>[0]["variant"]> = {
  megasena: "megasena",
  lotofacil: "lotofacil",
  quina: "quina",
  lotomania: "lotomania",
  duplasena: "duplasena",
  diadesorte: "diadesorte",
  supersete: "supersete",
  maismilionaria: "maismilionaria",
  timemania: "timemania",
  federal: "federal",
};

async function fetchHistory(lotteryId: string, count: number): Promise<LotteryResult[]> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-lottery-results?lottery=${lotteryId}&mode=history&count=${count}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.results || [];
}

export default function MonthlyReport() {
  const { data: results, isLoading } = useLotteryResults();
  const [generating, setGenerating] = useState(false);
  const [periodMode, setPeriodMode] = useState<"7" | "30" | "90" | "custom">("30");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const fetchCount = PERIOD_OPTIONS.find((p) => p.value === periodMode)?.count ?? 60;

  const historyQueries = useQueries({
    queries: NUMERIC_IDS.map((id) => ({
      queryKey: ["lottery-history", id, fetchCount],
      queryFn: () => fetchHistory(id, fetchCount),
      staleTime: 1000 * 60 * 30,
      enabled: !!results,
    })),
  });

  const historyByLottery = useMemo(() => {
    const map: Record<string, LotteryResult[]> = {};
    NUMERIC_IDS.forEach((id, idx) => {
      map[id] = historyQueries[idx].data || [];
    });
    return map;
  }, [historyQueries]);

  const historyLoading = historyQueries.some((q) => q.isLoading);

  const isCustom = periodMode === "custom";
  const customValid = isCustom && !!customRange?.from && !!customRange?.to;
  const periodDays = isCustom
    ? (customValid ? differenceInCalendarDays(customRange!.to!, customRange!.from!) + 1 : 0)
    : Number(periodMode);

  const entries = useMemo(() => {
    if (!results) return [];
    if (isCustom) {
      if (!customValid) return [];
      return buildReportEntriesFromRange(results, historyByLottery, customRange!.from!, customRange!.to!);
    }
    return buildReportEntriesFromHistory(results, historyByLottery, Number(periodMode));
  }, [results, historyByLottery, periodMode, isCustom, customValid, customRange]);

  const now = new Date();
  const monthLabel = `${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`;
  const periodLabel = isCustom
    ? (customValid
        ? `${format(customRange!.from!, "dd/MM/yyyy", { locale: ptBR })} a ${format(customRange!.to!, "dd/MM/yyyy", { locale: ptBR })}`
        : "Período personalizado")
    : `Últimos ${periodMode} dias`;

  const customTriggerLabel = customValid
    ? `${format(customRange!.from!, "dd/MM/yy", { locale: ptBR })} → ${format(customRange!.to!, "dd/MM/yy", { locale: ptBR })}`
    : "Selecionar datas";

  const handleDownload = async () => {
    if (isCustom && !customValid) {
      toast.error("Selecione as datas de início e fim.");
      return;
    }
    if (!entries.length) {
      toast.error("Nenhum concurso encontrado nesse período.");
      return;
    }
    try {
      setGenerating(true);
      // Allow the loader paint
      await new Promise((r) => setTimeout(r, 50));
      generateMonthlyReportPdf(entries, { periodLabel, periodDays });
      toast.success("Relatório gerado!", { description: "O download deve iniciar automaticamente." });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF", { description: "Tente novamente em instantes." });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              Relatório Mensal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequências e Palpites do Mês
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Escolha o período e baixe o PDF com as dezenas mais quentes, mais frias e palpites sugeridos para cada modalidade. Hoje é <strong>{monthLabel}</strong>.
            </p>
          </div>

          <Card className="card-glass border-primary/30">
            <CardContent className="p-6 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-base">Período do relatório</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Frequências calculadas a partir dos concursos realizados na janela selecionada.
                  </p>
                </div>
                <ToggleGroup
                  type="single"
                  value={periodMode}
                  onValueChange={(v) => v && setPeriodMode(v as typeof periodMode)}
                  className="justify-center flex-wrap"
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      aria-label={opt.label}
                      className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              {isCustom && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <span className="text-xs text-muted-foreground sm:min-w-[140px]">
                    Intervalo personalizado:
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full sm:w-[280px]",
                          !customValid && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customTriggerLabel}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={customRange}
                        onSelect={setCustomRange}
                        numberOfMonths={2}
                        locale={ptBR}
                        disabled={(d) => d > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {customValid && (
                    <span className="text-xs text-muted-foreground">
                      {periodDays} dia{periodDays > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/40">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  10 modalidades numéricas · Top 10 quentes/frias · 3 estratégias por modalidade
                  {historyLoading && " · carregando histórico..."}
                </p>
                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={generating || isLoading || historyLoading || !entries.length || (isCustom && !customValid)}
                  className="gap-2 min-w-[220px]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="text-center text-muted-foreground py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando resultados das loterias...
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entries.map(({ result, frequency, drawsCount }) => {
                const variant = VARIANT_MAP[result.id] || "megasena";
                const hot = frequency.slice(0, 5);
                const cold = [...frequency].slice(-5).reverse();
                const balanced = generateSmartPicks(frequency, result.selectCount, "balanced");
                return (
                  <Card key={result.id} className="card-glass">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>{result.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {drawsCount && drawsCount > 1
                            ? `${drawsCount} concursos · ${periodLabel.toLowerCase()}`
                            : `Concurso ${result.concurso}`}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mb-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Top 5 Quentes
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hot.map((f) => (
                            <LotteryBall key={`h-${f.number}`} number={f.number} size="sm" variant={variant} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-1.5">
                          <TrendingDown className="w-3.5 h-3.5" /> Top 5 Frias
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cold.map((f) => (
                            <LotteryBall key={`c-${f.number}`} number={f.number} size="sm" variant={variant} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Palpite Balanceado
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {balanced.map((n) => (
                            <LotteryBall key={`b-${n}`} number={n} size="sm" variant={variant} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground text-center pt-4 border-t border-border/40">
            Este App não possui vínculo oficial com a Caixa Econômica Federal. Conteúdo destinado a maiores de 18 anos. Os palpites são gerados estatisticamente e não garantem premiação.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

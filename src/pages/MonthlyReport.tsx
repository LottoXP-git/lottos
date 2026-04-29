import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/LotteryBall";
import { useLotteryResults } from "@/hooks/useLotteryResults";
import { buildReportEntries, generateMonthlyReportPdf } from "@/lib/monthlyReportPdf";
import { generateSmartPicks } from "@/data/lotteryData";
import { Download, FileText, Loader2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

export default function MonthlyReport() {
  const { data: results, isLoading } = useLotteryResults();
  const [generating, setGenerating] = useState(false);

  const entries = useMemo(() => (results ? buildReportEntries(results) : []), [results]);

  const now = new Date();
  const monthLabel = `${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`;

  const handleDownload = async () => {
    if (!entries.length) {
      toast.error("Aguarde os resultados carregarem antes de gerar o relatório.");
      return;
    }
    try {
      setGenerating(true);
      // Allow the loader paint
      await new Promise((r) => setTimeout(r, 50));
      generateMonthlyReportPdf(entries);
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
              Baixe o PDF atualizado com as dezenas mais quentes, mais frias e palpites sugeridos para cada modalidade — referente a <strong>{monthLabel}</strong>.
            </p>
          </div>

          <Card className="card-glass border-primary/30">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-base">Relatório de {monthLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  10 modalidades numéricas · Top 10 quentes/frias · 3 estratégias de palpite por modalidade
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={generating || isLoading || !entries.length}
                className="gap-2 min-w-[200px]"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Baixar PDF do mês
                  </>
                )}
              </Button>
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
              {entries.map(({ result, frequency }) => {
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
                          Concurso {result.concurso}
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

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { LotteryResult } from "@/data/lotteryData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Check, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LotteryBall } from "@/components/LotteryBall";
import lotusLogo from "@/assets/lotus-logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";

type LotteryVariant = "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";

const variantMap: Record<string, LotteryVariant> = {
  megasena: "megasena", lotofacil: "lotofacil", quina: "quina",
  lotomania: "lotomania", duplasena: "duplasena", diadesorte: "diadesorte",
  supersete: "supersete", maismilionaria: "maismilionaria", timemania: "timemania",
  federal: "federal", loteca: "loteca",
};

interface ResultsSummaryModalProps {
  lotteries: LotteryResult[];
}

function buildShareText(lotteries: LotteryResult[]): string {
  const lines = lotteries.map((l) => {
    const nums = l.id === "federal"
      ? l.numbers.join(" | ")
      : l.numbers.join(" - ");
    let extra = "";
    if (l.trevos?.length) extra += ` | Trevos: ${l.trevos.join(", ")}`;
    if (l.timeCoracao) extra += ` | ${l.timeCoracao}`;
    if (l.mesSorte) extra += ` | ${l.mesSorte}`;
    return `🎯 ${l.name} (${l.concurso}) — ${l.date}\n   ${nums}${extra}\n   💰 Próximo: ${l.nextPrize}`;
  });
  return `🎰 Resultados das Loterias Caixa\n\n${lines.join("\n\n")}`;
}

function SummaryContent({ lotteries, contentRef }: { lotteries: LotteryResult[]; contentRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={contentRef} className="relative space-y-3 bg-background p-4 rounded-xl overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src={lotusLogo}
          alt=""
          className="w-48 h-48 object-contain opacity-[0.06]"
          style={{ filter: "grayscale(100%)" }}
        />
      </div>
      <div className="relative z-10 space-y-3">
      <div className="text-center pb-2 border-b border-border flex flex-col items-center gap-1">
        <img src={lotusLogo} alt="Lotus" className="h-7 w-auto" />
        <h2 className="text-base font-bold text-foreground">Resultados das Loterias Caixa</h2>
        <p className="text-[10px] text-muted-foreground">
          Atualizado em {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
      {lotteries.map((lottery) => {
        const variant = variantMap[lottery.id] || "megasena";
        return (
          <div
            key={lottery.id}
            className="p-3 rounded-xl border border-border bg-card/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{lottery.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  Concurso {lottery.concurso} • {lottery.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Próximo prêmio</p>
                <p className="text-xs font-bold text-primary">{lottery.nextPrize}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {lottery.id === "federal" ? (
                lottery.numbers.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono font-semibold text-foreground">
                    {String(n).padStart(5, "0")}
                  </span>
                ))
              ) : (
                lottery.numbers.map((n, i) => (
                  <LotteryBall key={i} number={n} variant={variant} size="sm" />
                ))
              )}
            </div>

            {lottery.trevos && lottery.trevos.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Trevos:</span>
                {lottery.trevos.map((t, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {lottery.timeCoracao && (
              <p className="text-[11px] text-muted-foreground">❤️ {lottery.timeCoracao}</p>
            )}
            {lottery.mesSorte && (
              <p className="text-[11px] text-muted-foreground">📅 {lottery.mesSorte}</p>
            )}
          </div>
        );
      })}
      <p className="text-[9px] text-muted-foreground text-center pt-1">
        loteriascaixa.app
      </p>
      </div>
    </div>
  );
}

export function ResultsSummaryModal({ lotteries }: ResultsSummaryModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const text = buildShareText(lotteries);
    const shareData = { title: "Resultados das Loterias Caixa", text, url: window.location.href };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ title: "Compartilhado!", description: "Resumo compartilhado com sucesso." });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${text}\n\n${shareData.url}`);
      setCopied(true);
      toast({ title: "Copiado!", description: "Resumo copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("Failed to create blob");

      // Try native share with image on mobile
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "resultados.png", { type: "image/png" })] })) {
        const file = new File([blob], "resultados-loterias.png", { type: "image/png" });
        try {
          await navigator.share({
            title: "Resultados das Loterias Caixa",
            files: [file],
          });
          toast({ title: "Compartilhado!", description: "Imagem compartilhada com sucesso." });
          setExporting(false);
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setExporting(false);
            return;
          }
        }
      }

      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultados-loterias.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Baixado!", description: "Imagem salva com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível exportar a imagem.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Resumo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>Resumo dos Resultados</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={handleExportImage} disabled={exporting} className="gap-2">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? "Gerando..." : "Imagem"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Texto"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[65vh]">
          <SummaryContent lotteries={lotteries} contentRef={contentRef} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

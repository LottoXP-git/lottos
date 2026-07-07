import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { LotteryResult } from "@/data/lotteryData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, FileText, Share2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LotteryBall } from "@/components/LotteryBall";
import lotusLogo from "@/assets/lotus-logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { shareImageToInstagram, shareImageToWhatsApp } from "@/lib/socialShare";
import { MessageCircle, Instagram } from "lucide-react";

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
          role="presentation"
          className="w-48 h-48 object-contain opacity-[0.06]"
          style={{ filter: "grayscale(100%)" }}
        />
      </div>
      <div className="relative z-10 space-y-3">
      <div className="text-center pb-2 border-b border-border flex flex-col items-center gap-1">
        <img src={lotusLogo} alt="Logo Lottos" className="h-7 w-auto" />
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
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [socialBusy, setSocialBusy] = useState<"wa" | "ig" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const buildImageFile = async (): Promise<File | null> => {
    if (!contentRef.current) return null;
    const canvas = await html2canvas(contentRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return null;
    return new File([blob], "resultados-loterias.png", { type: "image/png" });
  };

  const handleSocialShare = async (target: "wa" | "ig") => {
    setSocialBusy(target);
    try {
      const file = await buildImageFile();
      const caption = buildShareText(lotteries) + `\n\n${window.location.href}`;
      if (!file) {
        toast({ title: "Erro", description: "Não foi possível gerar a imagem.", variant: "destructive" });
        return;
      }
      const outcome =
        target === "wa"
          ? await shareImageToWhatsApp(file, caption)
          : await shareImageToInstagram(file, caption);
      if (outcome === "shared") {
        toast({ title: target === "wa" ? "Enviado para o WhatsApp!" : "Enviado para o Instagram!" });
      } else if (outcome === "fallback") {
        toast({
          title: "Imagem baixada",
          description:
            target === "wa"
              ? "Anexe no WhatsApp — a legenda já foi copiada."
              : "Publique no Instagram — a legenda já foi copiada.",
        });
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível compartilhar.", variant: "destructive" });
    } finally {
      setSocialBusy(null);
    }
  };

  const handleShare = async () => {
    if (!contentRef.current) return;
    setSharing(true);
    const text = buildShareText(lotteries);
    const url = window.location.href;
    const title = "Resultados das Loterias Caixa";

    try {
      // Generate image
      let file: File | null = null;
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
        if (blob) file = new File([blob], "resultados-loterias.png", { type: "image/png" });
      } catch {
        // ignore, fallback to text-only share
      }

      // Try native share with image (opens WhatsApp/Instagram/etc.)
      if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title, text, files: [file] });
          toast({ title: "Compartilhado!", description: "Resumo enviado com sucesso." });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }

      // Try native share text-only
      const textData = { title, text, url };
      if (navigator.share && navigator.canShare?.(textData)) {
        try {
          await navigator.share(textData);
          toast({ title: "Compartilhado!", description: "Resumo enviado com sucesso." });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }

      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${url}`);
      setShared(true);
      toast({ title: "Copiado!", description: "Compartilhamento não disponível — texto copiado." });
      setTimeout(() => setShared(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível compartilhar.", variant: "destructive" });
    } finally {
      setSharing(false);
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("wa")}
                disabled={socialBusy !== null || sharing}
                className="gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
              >
                {socialBusy === "wa" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare("ig")}
                disabled={socialBusy !== null || sharing}
                className="gap-1.5 text-white border-0"
                style={{
                  background:
                    "linear-gradient(135deg,#f58529 0%,#dd2a7b 50%,#8134af 100%)",
                }}
              >
                {socialBusy === "ig" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Instagram className="w-4 h-4" />
                )}
                Instagram
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing} className="gap-2">
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : shared ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {sharing ? "Gerando..." : shared ? "Copiado" : "Outros"}
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

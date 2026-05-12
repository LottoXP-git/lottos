import { RefObject, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import lottosLogo from "@/assets/lottos-logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShareResultImageButtonProps {
  targetRef: RefObject<HTMLElement>;
  lotteryName: string;
  lotteryId: string;
  concurso: number;
  date: string;
  nextPrize?: string;
  className?: string;
}

export function ShareResultImageButton({
  targetRef,
  lotteryName,
  lotteryId,
  concurso,
  date,
  nextPrize,
  className,
}: ShareResultImageButtonProps) {
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const safeName = `lottos-${lotteryId}-${concurso}`
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase();

  const buildOffscreen = (): { container: HTMLDivElement; cleanup: () => void } => {
    const node = targetRef.current;
    if (!node) throw new Error("EMPTY_REF");

    const container = document.createElement("div");
    const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
    const fg = getComputedStyle(document.body).color || "#000000";
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: -10000px;
      width: 720px;
      padding: 24px;
      background: ${bg};
      color: ${fg};
      z-index: -1;
      font-family: Inter, system-ui, sans-serif;
    `;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;
      padding:0 4px 12px 4px;margin-bottom:12px;
      border-bottom:1px solid rgba(127,127,127,0.25);
    `;
    header.innerHTML = `
      <img src="${lottosLogo}" alt="Lottos" style="height:36px;width:auto;display:block;" crossorigin="anonymous" />
      <div style="font-weight:600;font-size:14px;opacity:0.75;">${lotteryName} · Concurso ${concurso}</div>
    `;
    container.appendChild(header);

    // Cloned content
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.width = "100%";
    container.appendChild(clone);

    // Footer
    const footer = document.createElement("div");
    footer.style.cssText = `
      margin-top:16px;padding-top:12px;
      border-top:1px solid rgba(127,127,127,0.25);
      display:flex;align-items:center;justify-content:space-between;
      font-size:12px;opacity:0.8;
    `;
    footer.innerHTML = `
      <span>lottos.lovable.app</span>
      <span>Sem vínculo oficial com a Caixa Econômica Federal</span>
    `;
    container.appendChild(footer);

    document.body.appendChild(container);
    return {
      container,
      cleanup: () => {
        if (container.parentNode) container.parentNode.removeChild(container);
      },
    };
  };

  const waitForImages = (root: HTMLElement) =>
    Promise.all(
      Array.from(root.querySelectorAll("img")).map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            }),
      ),
    );

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    if (!targetRef.current) {
      toast({
        title: "Conteúdo indisponível",
        description: "Aguarde o carregamento do resultado e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    const slowToast = window.setTimeout(() => {
      toast({
        title: "Gerando imagem…",
        description: "Isso pode levar alguns segundos.",
      });
    }, 1500);
    let cleanup: (() => void) | null = null;
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const off = buildOffscreen();
      cleanup = off.cleanup;
      await waitForImages(off.container);
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const canvas = await html2canvas(off.container, {
        scale: 2,
        backgroundColor: bg,
        useCORS: true,
        logging: false,
      });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95),
      );
      if (!blob) throw new Error("BLOB_FAILED");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      const msg = (err as Error)?.message;
      toast({
        title: "Erro ao gerar imagem",
        description:
          msg === "EMPTY_REF"
            ? "O conteúdo do modal não está disponível. Reabra o resultado e tente de novo."
            : "Não foi possível gerar a imagem. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      window.clearTimeout(slowToast);
      cleanup?.();
      setBusy(false);
    }
  };

  const caption = `🎰 ${lotteryName} - Concurso ${concurso}\n📅 ${date}${nextPrize ? `\n💰 Próximo: ${nextPrize}` : ""}\n\nlottos.lovable.app`;

  const handleConfirmDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Imagem salva!", description: "O resultado foi baixado em PNG." });
    setPreviewOpen(false);
  };

  const handleConfirmShare = async () => {
    if (!previewBlob) return;
    setSharing(true);
    try {
      const file = new File([previewBlob], `${safeName}.png`, { type: "image/png" });
      const canShareFiles =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });
      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            title: `${lotteryName} - Concurso ${concurso}`,
            text: caption,
          });
          toast({ title: "Compartilhado!", description: "Imagem enviada com sucesso." });
          setPreviewOpen(false);
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          toast({
            title: "Compartilhamento falhou",
            description: "Baixando a imagem como alternativa.",
          });
        }
      } else {
        toast({
          title: "Compartilhamento indisponível",
          description:
            "Seu navegador não suporta compartilhar imagens. A imagem será baixada.",
        });
      }
      handleConfirmDownload();
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGenerate}
              disabled={busy}
              className={className}
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pré-visualizar e compartilhar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Pré-visualização</DialogTitle>
            <DialogDescription>
              Confira a imagem antes de compartilhar ou baixar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center rounded-lg bg-muted/40 p-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt={`Pré-visualização ${lotteryName} concurso ${concurso}`}
                className="max-h-[60vh] w-auto rounded-md shadow-md"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleConfirmDownload} disabled={sharing}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PNG
            </Button>
            <Button onClick={handleConfirmShare} disabled={sharing}>
              {sharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
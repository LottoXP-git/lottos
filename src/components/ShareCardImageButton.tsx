import { Button } from "@/components/ui/button";
import { Share2, Loader2, Download } from "lucide-react";
import { useState, RefObject, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
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
import { SocialShareButtons } from "./SocialShareButtons";
import { isNativePlatform, saveImageNative, shareImageNative } from "@/lib/nativeShare";
import lottosLogo from "@/assets/lottos-logo.png";

interface ShareCardImageButtonProps {
  /** Ref to the DOM node that should be captured (the colored card). */
  targetRef: RefObject<HTMLElement>;
  /** Used as the share title and the downloaded file name. */
  fileName: string;
  /** Caption sent alongside the image when using Web Share. */
  caption: string;
  /** Gradient colors of the lottery, used as the poster background. */
  accentFrom?: string;
  accentTo?: string;
  /** Optional headline shown above the card in the generated poster. */
  headline?: string;
  className?: string;
}

const CANVAS_W = 1080;
const CANVAS_H = 1350;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Wraps text into lines that fit maxWidth, shrinking the font if needed. */
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: string,
  startSize: number,
  minSize: number,
  maxLines: number,
): { lines: string[]; size: number } {
  const font = (s: number) => `${weight} ${s}px Inter, system-ui, sans-serif`;
  for (let size = startSize; size >= minSize; size -= 2) {
    ctx.font = font(size);
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    let ok = true;
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else if (current) {
        lines.push(current);
        current = word;
        if (ctx.measureText(word).width > maxWidth) ok = false;
      } else {
        ok = false;
        current = word;
      }
    }
    if (current) lines.push(current);
    if (ok && lines.length <= maxLines) {
      ctx.font = font(size);
      return { lines, size };
    }
  }
  ctx.font = font(minSize);
  return { lines: [text], size: minSize };
}

/**
 * Captures the lottery card as a PNG (preserving its colored palette) and
 * shares it via the Web Share API, falling back to a download. Uses
 * html2canvas with a transparent background so the card's gradient is the
 * only visible color.
 */
export function ShareCardImageButton({
  targetRef,
  fileName,
  caption,
  accentFrom = "#1e293b",
  accentTo = "#0f172a",
  headline,
  className,
}: ShareCardImageButtonProps) {
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

  const safeName = fileName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

  const handleGeneratePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetRef.current || busy) return;

    setBusy(true);
    try {
      const cardCanvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          doc
            .querySelectorAll<HTMLElement>("[data-share-hide='true']")
            .forEach((el) => {
              el.style.visibility = "hidden";
            });
        },
      });

      const logo = await loadImage(lottosLogo);
      const out = document.createElement("canvas");
      out.width = CANVAS_W;
      out.height = CANVAS_H;
      const ctx = out.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Background: diagonal gradient in the lottery colors
      const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
      grad.addColorStop(0, accentFrom);
      grad.addColorStop(1, accentTo);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Soft light blobs for depth
      const glow = ctx.createRadialGradient(180, 160, 20, 180, 160, 620);
      glow.addColorStop(0, "rgba(255,255,255,0.22)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      const glow2 = ctx.createRadialGradient(
        CANVAS_W - 120,
        CANVAS_H - 180,
        20,
        CANVAS_W - 120,
        CANVAS_H - 180,
        640,
      );
      glow2.addColorStop(0, "rgba(0,0,0,0.25)");
      glow2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Header: logo + headline
      let headerBottom = 90;
      let logoRight = 64;
      if (logo) {
        const logoH = 78;
        const logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
        ctx.drawImage(logo, 64, 60, logoW, logoH);
        headerBottom = 60 + logoH;
        logoRight = 64 + logoW;
      }

      const headlineText = headline ?? "Resultado oficial";
      const sideWidth = CANVAS_W - 64 - (logoRight + 28);
      const inlineFit = fitLines(ctx, headlineText, sideWidth, "600", 34, 24, 2);
      const fitsBesideLogo =
        inlineFit.lines.length <= 2 &&
        inlineFit.lines.every((l) => ctx.measureText(l).width <= sideWidth);

      ctx.fillStyle = "rgba(255,255,255,0.94)";
      if (fitsBesideLogo) {
        ctx.textAlign = "right";
        const lineH = inlineFit.size * 1.25;
        const startY =
          60 + (78 - lineH * (inlineFit.lines.length - 1)) / 2 + inlineFit.size / 2 + 8;
        inlineFit.lines.forEach((line, i) => {
          ctx.fillText(line, CANVAS_W - 64, startY + i * lineH);
        });
        ctx.textAlign = "left";
      } else {
        // Not enough room next to the logo: render full-width below it.
        const fullFit = fitLines(ctx, headlineText, CANVAS_W - 128, "600", 40, 24, 3);
        const lineH = fullFit.size * 1.25;
        ctx.textAlign = "left";
        fullFit.lines.forEach((line, i) => {
          ctx.fillText(line, 64, headerBottom + 44 + i * lineH);
        });
        headerBottom += 20 + lineH * fullFit.lines.length;
      }

      // Card artwork, centered with drop shadow
      const padX = 70;
      const top = headerBottom + 54;
      const bottomReserved = 130;
      const maxW = CANVAS_W - padX * 2;
      const maxH = CANVAS_H - top - bottomReserved;
      const scale = Math.min(maxW / cardCanvas.width, maxH / cardCanvas.height);
      const drawW = cardCanvas.width * scale;
      const drawH = cardCanvas.height * scale;
      const dx = (CANVAS_W - drawW) / 2;
      const dy = top + (maxH - drawH) / 2;

      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 22;
      roundedRectPath(ctx, dx, dy, drawW, drawH, 34);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();
      ctx.restore();

      ctx.save();
      roundedRectPath(ctx, dx, dy, drawW, drawH, 34);
      ctx.clip();
      ctx.drawImage(cardCanvas, dx, dy, drawW, drawH);
      ctx.restore();

      ctx.save();
      roundedRectPath(ctx, dx, dy, drawW, drawH, 34);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Footer
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "700 32px Inter, system-ui, sans-serif";
      ctx.fillText("grupolottoxp.com", 64, CANVAS_H - 76);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillText(
        "Sem vínculo oficial com a Caixa Econômica Federal",
        64,
        CANVAS_H - 40,
      );

      const blob: Blob | null = await new Promise((resolve) =>
        out.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Falha ao gerar imagem");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem do card.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmShare = async () => {
    if (!previewBlob) return;
    setSharing(true);
    try {
      const file = new File([previewBlob], `${safeName}.png`, {
        type: "image/png",
      });
      if (isNativePlatform()) {
        const outcome = await shareImageNative(file, caption, fileName);
        if (outcome === "shared") {
          toast({ title: "Compartilhado!" });
          setPreviewOpen(false);
        } else if (outcome === "error") {
          toast({
            title: "Compartilhamento falhou",
            description: "Tente pelo botão do WhatsApp/Instagram.",
            variant: "destructive",
          });
        }
        return;
      }
      if (
        navigator.canShare?.({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share({
            files: [file],
            title: fileName,
            text: caption,
          });
          toast({
            title: "Compartilhado!",
            description: "Imagem enviada com sucesso.",
          });
          setPreviewOpen(false);
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            return;
          }
        }
      }

      handleConfirmDownload();
    } finally {
      setSharing(false);
    }
  };

  const handleConfirmDownload = async () => {
    if (!previewUrl) return;
    if (isNativePlatform() && previewBlob) {
      const file = new File([previewBlob], `${safeName}.png`, { type: "image/png" });
      const ok = await saveImageNative(file);
      toast({
        title: ok ? "Imagem salva!" : "Não foi possível salvar",
        description: ok ? "Salvo na pasta Documentos do dispositivo." : "Tente compartilhar em outro app.",
        variant: ok ? "default" : "destructive",
      });
      if (ok) setPreviewOpen(false);
      return;
    }
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: "Imagem salva!",
      description: "O card foi baixado em PNG.",
    });
    setPreviewOpen(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-share-hide="true"
              aria-label="Pré-visualizar e compartilhar imagem do resultado"
              onClick={handleGeneratePreview}
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
        <DialogContent
          className="max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
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
                alt="Pré-visualização do card"
                className="max-h-[60vh] w-auto rounded-md shadow-md"
              />
            )}
          </div>
          {previewBlob && (
            <SocialShareButtons
              file={new File([previewBlob], `${safeName}.png`, { type: "image/png" })}
              caption={caption}
              onDone={() => setPreviewOpen(false)}
            />
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleConfirmDownload}
              disabled={sharing}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PNG
            </Button>
            <Button onClick={handleConfirmShare} disabled={sharing}>
              {sharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Outros apps
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

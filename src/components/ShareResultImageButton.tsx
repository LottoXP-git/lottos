import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
  lotteryName: string;
  lotteryId: string;
  /** Lottery color token, e.g. "lottery-megasena" */
  lotteryColor?: string;
  concurso: number;
  date: string;
  nextDate?: string;
  numbers: number[];
  trevos?: number[];
  timeCoracao?: string;
  mesSorte?: string;
  nextPrize?: string;
  accumulated?: boolean;
  className?: string;
}

interface ModalityTheme {
  bgFrom: string;
  bgTo: string;
  ballFrom: string;
  ballTo: string;
  text: string;
}

const THEMES: Record<string, ModalityTheme> = {
  "lottery-megasena":      { bgFrom: "#059669", bgTo: "#064e3b", ballFrom: "#047857", ballTo: "#022c22", text: "#ffffff" },
  "lottery-lotofacil":     { bgFrom: "#7e22ce", bgTo: "#3b0764", ballFrom: "#7e22ce", ballTo: "#581c87", text: "#ffffff" },
  "lottery-quina":         { bgFrom: "#3730a3", bgTo: "#0c1c4a", ballFrom: "#1e40af", ballTo: "#1e1b4b", text: "#ffffff" },
  "lottery-lotomania":     { bgFrom: "#f97316", bgTo: "#9a3412", ballFrom: "#ea580c", ballTo: "#7c2d12", text: "#ffffff" },
  "lottery-duplasena":     { bgFrom: "#be123c", bgTo: "#7f1d1d", ballFrom: "#b91c1c", ballTo: "#7f1d1d", text: "#ffffff" },
  "lottery-diadesorte":    { bgFrom: "#f59e0b", bgTo: "#b45309", ballFrom: "#d97706", ballTo: "#78350f", text: "#ffffff" },
  "lottery-supersete":     { bgFrom: "#84cc16", bgTo: "#3f6212", ballFrom: "#4d7c0f", ballTo: "#1a2e05", text: "#ffffff" },
  "lottery-maismilionaria":{ bgFrom: "#4338ca", bgTo: "#1e1b4b", ballFrom: "#3730a3", ballTo: "#1e1b4b", text: "#ffffff" },
  "lottery-timemania":     { bgFrom: "#facc15", bgTo: "#a16207", ballFrom: "#15803d", ballTo: "#14532d", text: "#ffffff" },
  "lottery-federal":       { bgFrom: "#0284c7", bgTo: "#1e3a8a", ballFrom: "#075985", ballTo: "#1e3a8a", text: "#ffffff" },
  "lottery-loteca":        { bgFrom: "#ef4444", bgTo: "#7f1d1d", ballFrom: "#b91c1c", ballTo: "#7f1d1d", text: "#ffffff" },
};

const DEFAULT_THEME: ModalityTheme = {
  bgFrom: "#f97316", bgTo: "#7c2d12", ballFrom: "#ea580c", ballTo: "#7c2d12", text: "#ffffff",
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function buildCard(props: ShareResultImageButtonProps): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const theme = THEMES[props.lotteryColor ?? ""] ?? DEFAULT_THEME;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.bgFrom);
  bg.addColorStop(1, theme.bgTo);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Top-left highlight overlay
  const overlay = ctx.createLinearGradient(0, 0, W, H * 0.6);
  overlay.addColorStop(0, "rgba(255,255,255,0.18)");
  overlay.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Brand strip
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LOTTOS", 60, 70);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Resultado Oficial", W - 60, 70);

  // Header: name + concurso/date
  ctx.textAlign = "left";
  ctx.fillStyle = theme.text;
  ctx.font = "bold 72px Inter, system-ui, sans-serif";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 8;
  ctx.fillText(props.lotteryName, 60, 200);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 32px Inter, system-ui, sans-serif";
  ctx.fillText(`Concurso ${props.concurso} • ${props.date}`, 60, 250);

  // Inner panel
  const panelX = 60;
  const panelY = 300;
  const panelW = W - 120;
  const panelH = 820;
  drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 36);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Balls
  const nums = props.numbers;
  const many = nums.length > 10;
  const ballSize = many ? 100 : 140;
  const gap = many ? 16 : 26;
  const perRow = Math.min(nums.length, many ? 5 : 6);
  const rows = Math.ceil(nums.length / perRow);
  const totalW = perRow * ballSize + (perRow - 1) * gap;
  const startX = (W - totalW) / 2;
  const ballsBlockH = rows * ballSize + (rows - 1) * gap;
  const startY = panelY + (panelH - ballsBlockH) / 2 - 40;

  nums.forEach((n, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const cx = startX + col * (ballSize + gap) + ballSize / 2;
    const cy = startY + row * (ballSize + gap) + ballSize / 2;

    const grad = ctx.createLinearGradient(
      cx - ballSize / 2, cy - ballSize / 2,
      cx + ballSize / 2, cy + ballSize / 2,
    );
    grad.addColorStop(0, theme.ballFrom);
    grad.addColorStop(1, theme.ballTo);

    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.arc(cx, cy, ballSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 5;
    ctx.stroke();

    const gloss = ctx.createRadialGradient(
      cx - ballSize / 4, cy - ballSize / 4, 4,
      cx - ballSize / 4, cy - ballSize / 4, ballSize / 2,
    );
    gloss.addColorStop(0, "rgba(255,255,255,0.35)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, ballSize / 2 - 3, 0, Math.PI * 2);
    ctx.fillStyle = gloss;
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${ballSize * 0.42}px JetBrains Mono, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText(String(n).padStart(2, "0"), cx, cy + 3);
    ctx.shadowBlur = 0;
  });
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  // Extra chips
  let extrasY = startY + ballsBlockH + 70;
  const drawChip = (label: string, value: string) => {
    ctx.font = "600 28px Inter, system-ui, sans-serif";
    const txt = `${label} ${value}`;
    const w = ctx.measureText(txt).width + 60;
    const x = (W - w) / 2;
    drawRoundedRect(ctx, x, extrasY, w, 56, 28);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(txt, W / 2, extrasY + 38);
    extrasY += 70;
  };

  if (props.trevos && props.trevos.length) drawChip("🍀 Trevos:", props.trevos.join(" • "));
  if (props.timeCoracao) drawChip("❤ Time:", props.timeCoracao);
  if (props.mesSorte) drawChip("📅 Mês:", props.mesSorte);

  // Footer band
  drawRoundedRect(ctx, 60, H - 200, W - 120, 150, 28);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillText("Próximo prêmio", 100, H - 145);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Inter, system-ui, sans-serif";
  ctx.fillText(props.nextPrize || "A definir", 100, H - 100);

  if (props.accumulated) {
    ctx.font = "700 22px Inter, system-ui, sans-serif";
    const txt = "🔥 ACUMULADO";
    const w = ctx.measureText(txt).width + 36;
    drawRoundedRect(ctx, 100, H - 75, w, 36, 18);
    ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
    ctx.fill();
    ctx.fillStyle = "#1f2937";
    ctx.fillText(txt, 118, H - 50);
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  if (props.nextDate) {
    ctx.fillText(`Próximo sorteio: ${props.nextDate}`, W - 100, H - 130);
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Inter, system-ui, sans-serif";
  ctx.fillText("lottos.lovable.app", W - 100, H - 90);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 18px Inter, system-ui, sans-serif";
  ctx.fillText("Sem vínculo oficial com a Caixa", W - 100, H - 60);

  return canvas;
}

export function ShareResultImageButton(props: ShareResultImageButtonProps) {
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

  const safeName = `lottos-${props.lotteryId}-${props.concurso}`
    .replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const canvas = buildCard(props);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95),
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
        description: "Não foi possível gerar a imagem.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const caption = `🎰 ${props.lotteryName} - Concurso ${props.concurso}\n📅 ${props.date}\n🔢 ${props.numbers.join(", ")}${props.nextPrize ? `\n💰 Próximo: ${props.nextPrize}` : ""}\n\nlottos.lovable.app`;

  const handleConfirmShare = async () => {
    if (!previewBlob) return;
    setSharing(true);
    try {
      const file = new File([previewBlob], `${safeName}.png`, { type: "image/png" });
      if (
        navigator.canShare?.({ files: [file] }) &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `${props.lotteryName} - Concurso ${props.concurso}`,
            text: caption,
          });
          toast({ title: "Compartilhado!", description: "Imagem enviada com sucesso." });
          setPreviewOpen(false);
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
        }
      }
      handleConfirmDownload();
    } finally {
      setSharing(false);
    }
  };

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
              className={props.className}
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
                alt={`Pré-visualização ${props.lotteryName} concurso ${props.concurso}`}
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatLotteryNumber } from "@/lib/formatNumber";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SocialShareButtons } from "@/components/SocialShareButtons";

interface ShareablePickButtonProps {
  lotteryName: string;
  /** Lottery color token, e.g. "lottery-megasena" */
  lotteryColor?: string;
  numbers: number[];
  trevos?: number[];
  timeCoracao?: string;
  mesSorte?: string;
  rarityLabel?: string;
  rarityEmoji?: string;
  levelName: string;
  levelEmoji: string;
}

/** Card identity per modality — mirrors LotteryCard / LotteryBall palettes. */
interface ModalityTheme {
  bgFrom: string;
  bgTo: string;
  ballFrom: string;
  ballTo: string;
  accent: string; // for chips / banner
  text: string;
}

const THEMES: Record<string, ModalityTheme> = {
  "lottery-megasena":      { bgFrom: "#059669", bgTo: "#064e3b", ballFrom: "#047857", ballTo: "#022c22", accent: "#ffffff", text: "#ffffff" },
  "lottery-lotofacil":     { bgFrom: "#7e22ce", bgTo: "#3b0764", ballFrom: "#7e22ce", ballTo: "#581c87", accent: "#ffffff", text: "#ffffff" },
  "lottery-quina":         { bgFrom: "#3730a3", bgTo: "#0c1c4a", ballFrom: "#1e40af", ballTo: "#1e1b4b", accent: "#ffffff", text: "#ffffff" },
  "lottery-lotomania":     { bgFrom: "#f97316", bgTo: "#9a3412", ballFrom: "#ea580c", ballTo: "#7c2d12", accent: "#fff7ed", text: "#ffffff" },
  "lottery-duplasena":     { bgFrom: "#be123c", bgTo: "#7f1d1d", ballFrom: "#b91c1c", ballTo: "#7f1d1d", accent: "#ffffff", text: "#ffffff" },
  "lottery-diadesorte":    { bgFrom: "#f59e0b", bgTo: "#b45309", ballFrom: "#d97706", ballTo: "#78350f", accent: "#fff7ed", text: "#ffffff" },
  "lottery-supersete":     { bgFrom: "#84cc16", bgTo: "#3f6212", ballFrom: "#4d7c0f", ballTo: "#1a2e05", accent: "#ffffff", text: "#ffffff" },
  "lottery-maismilionaria":{ bgFrom: "#4338ca", bgTo: "#1e1b4b", ballFrom: "#3730a3", ballTo: "#1e1b4b", accent: "#ffffff", text: "#ffffff" },
  "lottery-timemania":     { bgFrom: "#facc15", bgTo: "#a16207", ballFrom: "#15803d", ballTo: "#14532d", accent: "#0f172a", text: "#ffffff" },
  "lottery-federal":       { bgFrom: "#0284c7", bgTo: "#1e3a8a", ballFrom: "#075985", ballTo: "#1e3a8a", accent: "#ffffff", text: "#ffffff" },
  "lottery-loteca":        { bgFrom: "#ef4444", bgTo: "#7f1d1d", ballFrom: "#b91c1c", ballTo: "#7f1d1d", accent: "#ffffff", text: "#ffffff" },
};

const DEFAULT_THEME: ModalityTheme = {
  bgFrom: "#f97316", bgTo: "#7c2d12", ballFrom: "#ea580c", ballTo: "#7c2d12", accent: "#ffffff", text: "#ffffff",
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function todayBR() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function buildCard(props: ShareablePickButtonProps): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const theme = THEMES[props.lotteryColor ?? ""] ?? DEFAULT_THEME;

  // ===== Background — full modality gradient (mirrors card) =====
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.bgFrom);
  bg.addColorStop(1, theme.bgTo);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle highlight glow top-left, like the card's ::before overlay
  const overlay = ctx.createLinearGradient(0, 0, W, H * 0.6);
  overlay.addColorStop(0, "rgba(255,255,255,0.18)");
  overlay.addColorStop(0.5, "rgba(255,255,255,0)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // ===== Top brand strip =====
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LOTTOS", 60, 70);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`Palpite • ${todayBR()}`, W - 60, 70);

  // ===== Card-style header (name + "MEU PALPITE") =====
  ctx.textAlign = "left";
  ctx.fillStyle = theme.text;
  ctx.font = "bold 72px Inter, system-ui, sans-serif";
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 8;
  ctx.fillText(props.lotteryName, 60, 200);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 30px Inter, system-ui, sans-serif";
  ctx.fillText("Meu palpite da sorte", 60, 250);

  // Rarity chip (top-right under brand)
  if (props.rarityLabel) {
    ctx.font = "700 26px Inter, system-ui, sans-serif";
    const txt = `${props.rarityEmoji ?? "✨"} ${props.rarityLabel}`;
    ctx.textAlign = "right";
    const padX = 22;
    const w = ctx.measureText(txt).width + padX * 2;
    const x = W - 60 - w;
    const y = 110;
    drawRoundedRect(ctx, x, y, w, 50, 25);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(txt, W - 60 - padX, y + 35);
    ctx.textAlign = "left";
  }

  // ===== Inner panel (like CardContent area) =====
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

  // ===== Balls (modality colors, like LotteryBall) =====
  const nums = props.numbers;
  const ballSize = nums.length > 10 ? 100 : 140;
  const gap = nums.length > 10 ? 16 : 26;
  const perRow = Math.min(nums.length, nums.length > 10 ? 5 : 6);
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

    // Ball gradient mirrors LotteryBall variant (br gradient)
    const grad = ctx.createLinearGradient(
      cx - ballSize / 2, cy - ballSize / 2,
      cx + ballSize / 2, cy + ballSize / 2
    );
    grad.addColorStop(0, theme.ballFrom);
    grad.addColorStop(1, theme.ballTo);

    // Soft drop shadow
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

    // White ring (matches ring-2 ring-white/90)
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Highlight gloss
    const gloss = ctx.createRadialGradient(
      cx - ballSize / 4, cy - ballSize / 4, 4,
      cx - ballSize / 4, cy - ballSize / 4, ballSize / 2
    );
    gloss.addColorStop(0, "rgba(255,255,255,0.35)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, ballSize / 2 - 3, 0, Math.PI * 2);
    ctx.fillStyle = gloss;
    ctx.fill();

    // Number
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${ballSize * 0.42}px JetBrains Mono, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText(formatLotteryNumber(n, props.lotteryColor === "lottery-supersete" ? "supersete" : undefined), cx, cy + 3);
    ctx.shadowBlur = 0;
  });
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  // ===== Extras (Trevos / Time / Mês) — pill chips like the card =====
  let extrasY = startY + ballsBlockH + 70;

  function drawChip(label: string, value: string) {
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
  }

  if (props.trevos && props.trevos.length) drawChip("🍀 Trevos:", props.trevos.join(" • "));
  if (props.timeCoracao) drawChip("❤ Time:", props.timeCoracao);
  if (props.mesSorte) drawChip("📅 Mês:", props.mesSorte);

  // ===== Footer band =====
  drawRoundedRect(ctx, 60, H - 180, W - 120, 130, 28);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.20)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px Inter, system-ui, sans-serif";
  ctx.fillText(`${props.levelEmoji}  ${props.levelName}`, 100, H - 115);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillText("grupolottoxp.com", 100, H - 75);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("#PalpiteDaSorte", W - 100, H - 75);

  return canvas;
}

export function ShareablePickButton(props: ShareablePickButtonProps) {
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const caption = `Meu palpite da sorte para ${props.lotteryName} 🍀\n\n#PalpiteDaSorte · grupolottoxp.com`;

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const canvas = buildCard(props);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );
      if (!blob) throw new Error("Falha ao gerar imagem");
      const file = new File([blob], "lottos-palpite.png", { type: "image/png" });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setPreviewOpen(true);
    } catch {
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "lottos-palpite.png";
    a.click();
    toast.success("Imagem baixada!");
    setPreviewOpen(false);
  };

  return (
    <>
    <Button
      onClick={handleGenerate}
      variant="outline"
      size="lg"
      disabled={busy}
      className="w-full border-primary/50 hover:bg-primary/10 h-11"
    >
      {busy ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Share2 className="w-4 h-4 mr-2" />
      )}
      Compartilhar como imagem
    </Button>

    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar palpite</DialogTitle>
          <DialogDescription>
            Escolha onde publicar sua imagem.
          </DialogDescription>
        </DialogHeader>
        {previewUrl && (
          <div className="flex justify-center rounded-lg bg-muted/40 p-3">
            <img
              src={previewUrl}
              alt="Pré-visualização do palpite"
              className="max-h-[55vh] w-auto rounded-md shadow-md"
            />
          </div>
        )}
        {previewFile && (
          <SocialShareButtons
            file={previewFile}
            caption={caption}
            onDone={() => setPreviewOpen(false)}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleDownload} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Baixar PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
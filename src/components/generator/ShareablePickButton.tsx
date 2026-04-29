import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareablePickButtonProps {
  lotteryName: string;
  numbers: number[];
  trevos?: number[];
  timeCoracao?: string;
  mesSorte?: string;
  rarityLabel?: string;
  rarityEmoji?: string;
  levelName: string;
  levelEmoji: string;
  accentColor?: string; // hex
}

const DEFAULT_ACCENT = "#f97316";

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

function buildCard(props: ShareablePickButtonProps): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const accent = props.accentColor || DEFAULT_ACCENT;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b1020");
  bg.addColorStop(1, "#1a0f00");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Glow blob
  const glow = ctx.createRadialGradient(W / 2, 220, 30, W / 2, 220, 600);
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LOTTOS", W / 2, 130);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 30px Inter, system-ui, sans-serif";
  ctx.fillText("Meu palpite da sorte", W / 2, 180);

  // Lottery chip
  ctx.font = "bold 36px Inter, system-ui, sans-serif";
  const chipText = props.lotteryName.toUpperCase();
  const chipW = ctx.measureText(chipText).width + 80;
  drawRoundedRect(ctx, (W - chipW) / 2, 230, chipW, 70, 35);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(chipText, W / 2, 280);

  // Rarity badge
  if (props.rarityLabel) {
    ctx.font = "600 28px Inter, system-ui, sans-serif";
    const txt = `${props.rarityEmoji ?? "✨"} Palpite ${props.rarityLabel}`;
    const w = ctx.measureText(txt).width + 60;
    drawRoundedRect(ctx, (W - w) / 2, 340, w, 56, 28);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(txt, W / 2, 378);
  }

  // Balls
  const nums = props.numbers;
  const ballSize = nums.length > 10 ? 110 : 140;
  const gap = nums.length > 10 ? 18 : 28;
  const perRow = Math.min(nums.length, nums.length > 10 ? 5 : 6);
  const rows = Math.ceil(nums.length / perRow);
  const totalW = perRow * ballSize + (perRow - 1) * gap;
  const startX = (W - totalW) / 2;
  const startY = 470;

  nums.forEach((n, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = startX + col * (ballSize + gap) + ballSize / 2;
    const y = startY + row * (ballSize + gap) + ballSize / 2;

    const grad = ctx.createRadialGradient(x - ballSize / 4, y - ballSize / 4, 5, x, y, ballSize / 2);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.15, accent);
    grad.addColorStop(1, "#000000");
    ctx.beginPath();
    ctx.arc(x, y, ballSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${ballSize * 0.42}px JetBrains Mono, monospace`;
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 6;
    ctx.fillText(String(n).padStart(2, "0"), x, y + 4);
    ctx.shadowBlur = 0;
  });
  ctx.textBaseline = "alphabetic";

  let extrasY = startY + rows * (ballSize + gap) + 30;

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 30px Inter, system-ui, sans-serif";
  if (props.trevos && props.trevos.length) {
    ctx.fillText(`Trevos: ${props.trevos.join(" • ")}`, W / 2, extrasY);
    extrasY += 50;
  }
  if (props.timeCoracao) {
    ctx.fillText(`Time: ${props.timeCoracao}`, W / 2, extrasY);
    extrasY += 50;
  }
  if (props.mesSorte) {
    ctx.fillText(`Mês: ${props.mesSorte}`, W / 2, extrasY);
    extrasY += 50;
  }

  // Footer band
  drawRoundedRect(ctx, 60, H - 230, W - 120, 170, 28);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Inter, system-ui, sans-serif";
  ctx.fillText(`${props.levelEmoji}  ${props.levelName}`, 100, H - 165);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillText("Gerado em lottos.lovable.app", 100, H - 110);
  ctx.fillStyle = accent;
  ctx.font = "bold 26px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("#PalpiteDaSorte", W - 100, H - 110);

  return canvas;
}

export function ShareablePickButton(props: ShareablePickButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const canvas = buildCard(props);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );
      if (!blob) throw new Error("Falha ao gerar imagem");

      const file = new File([blob], "lottos-palpite.png", { type: "image/png" });

      const navAny = navigator as any;
      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share({
          files: [file],
          title: "Meu palpite Lottos",
          text: `Meu palpite da sorte para ${props.lotteryName} 🍀`,
        });
        toast.success("Compartilhado!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lottos-palpite.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Imagem baixada!");
      }
    } catch (e) {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
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
  );
}
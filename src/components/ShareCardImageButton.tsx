import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { useState, RefObject } from "react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareCardImageButtonProps {
  /** Ref to the DOM node that should be captured (the colored card). */
  targetRef: RefObject<HTMLElement>;
  /** Used as the share title and the downloaded file name. */
  fileName: string;
  /** Caption sent alongside the image when using Web Share. */
  caption: string;
  className?: string;
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
  className,
}: ShareCardImageButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetRef.current || busy) return;

    setBusy(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Falha ao gerar imagem");

      const safeName = fileName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      const file = new File([blob], `${safeName}.png`, { type: "image/png" });

      // Try Web Share API with the file (mobile + supported desktop)
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
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          // fall through to download
        }
      }

      // Fallback: download the PNG
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Imagem salva!",
        description: "O card foi baixado em PNG.",
      });
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
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
          <p>Compartilhar como imagem</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

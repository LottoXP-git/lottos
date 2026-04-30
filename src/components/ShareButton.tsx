import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  /** When provided, the matching OG image at /og/{lotteryId}.jpg is attached to the share. */
  lotteryId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
}

const SUPPORTED_LOTTERIES = new Set([
  "megasena",
  "lotofacil",
  "quina",
  "lotomania",
  "duplasena",
  "diadesorte",
  "supersete",
  "maismilionaria",
  "timemania",
  "federal",
  "loteca",
]);

async function buildLotteryImageFile(lotteryId: string): Promise<File | null> {
  if (!SUPPORTED_LOTTERIES.has(lotteryId)) return null;
  try {
    const res = await fetch(`/og/${lotteryId}.jpg`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], `lottos-${lotteryId}.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

export function ShareButton({
  title,
  text,
  url = window.location.href,
  lotteryId,
  variant = "ghost",
  size = "icon",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Try to attach the lottery-specific OG image so WhatsApp/IG show a real preview.
    if (lotteryId && navigator.share) {
      const file = await buildLotteryImageFile(lotteryId);
      if (file) {
        const dataWithFile = { title, text, url, files: [file] };
        if (navigator.canShare?.(dataWithFile)) {
          try {
            await navigator.share(dataWithFile);
            toast({
              title: "Compartilhado!",
              description: "Resultado e imagem enviados com sucesso.",
            });
            return;
          } catch (err) {
            if ((err as Error).name === "AbortError") return;
            // fall through to text-only share
          }
        }
      }
    }

    const shareData = { title, text, url };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Compartilhado!",
          description: "Resultado compartilhado com sucesso.",
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    const shareText = `${title}\n\n${text}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o resultado.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleShare}
            className={className}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compartilhar resultado</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

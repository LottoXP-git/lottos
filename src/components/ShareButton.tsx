import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SharePreviewDialog } from "./SharePreviewDialog";

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
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open || !lotteryId) return;
    let cancelled = false;
    buildLotteryImageFile(lotteryId).then((f) => {
      if (!cancelled) setFile(f);
    });
    return () => {
      cancelled = true;
    };
  }, [open, lotteryId]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleOpen}
            className={className}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compartilhar resultado</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <SharePreviewDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      text={text}
      url={url}
      file={file}
    />
    </>
  );
}

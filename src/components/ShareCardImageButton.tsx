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

  const handleConfirmDownload = () => {
    if (!previewUrl) return;
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
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SharePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  url: string;
  /** Optional file (e.g. OG image) to attach when using native share. */
  file?: File | null;
  /** Optional app/logo image URL to show as a thumbnail preview. */
  imageUrl?: string;
}

export function SharePreviewDialog({
  open,
  onOpenChange,
  title,
  text,
  url,
  file,
  imageUrl,
}: SharePreviewDialogProps) {
  const [copied, setCopied] = useState(false);
  const fullMessage = `${text}\n\n${url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      toast({ title: "Copiado!", description: "Texto e link copiados." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erro", description: "Não foi possível copiar.", variant: "destructive" });
    }
  };

  const handleWhatsApp = () => {
    const wa = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  const handleNative = async () => {
    const data: ShareData = { title, text, url };
    if (file && navigator.canShare?.({ ...data, files: [file] })) {
      (data as ShareData & { files: File[] }).files = [file];
    }
    try {
      if (navigator.share) {
        await navigator.share(data);
        onOpenChange(false);
        return;
      }
      await handleCopy();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        await handleCopy();
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pré-visualização do compartilhamento</DialogTitle>
          <DialogDescription>
            Confira o texto e o link antes de enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary break-all hover:underline block"
            >
              {url}
            </a>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleWhatsApp} className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white">
              <MessageCircle className="w-4 h-4" />
              Compartilhar no WhatsApp
            </Button>

            {hasNativeShare && (
              <Button onClick={handleNative} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Outros apps (sistema)
              </Button>
            )}

            <Button onClick={handleCopy} variant="outline" className="gap-2">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar texto e link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
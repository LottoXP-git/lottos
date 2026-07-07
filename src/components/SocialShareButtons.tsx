import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  shareImageToInstagram,
  shareImageToWhatsApp,
  shareTextToInstagram,
  shareTextToWhatsApp,
} from "@/lib/socialShare";

interface SocialShareButtonsProps {
  /** Optional image file. When present, image sharing paths are used. */
  file?: File | null;
  /** Caption / text sent alongside the share. */
  caption: string;
  /** Optional URL appended to the WhatsApp text share (ignored when file is set). */
  url?: string;
  /** Called after a successful share (or fallback) to let the parent close. */
  onDone?: () => void;
  className?: string;
}

/**
 * Renders "WhatsApp" and "Instagram" buttons that share the given content
 * directly. Use inside preview dialogs alongside Download / native Share.
 */
export function SocialShareButtons({
  file,
  caption,
  url,
  onDone,
  className,
}: SocialShareButtonsProps) {
  const [busy, setBusy] = useState<"wa" | "ig" | null>(null);

  const handleWhatsApp = async () => {
    setBusy("wa");
    try {
      if (file) {
        const outcome = await shareImageToWhatsApp(file, caption);
        if (outcome === "shared") {
          toast({ title: "Enviado para o WhatsApp!" });
          onDone?.();
        } else if (outcome === "fallback") {
          toast({
            title: "Imagem baixada",
            description: "Anexe no WhatsApp — a legenda já foi copiada.",
          });
          onDone?.();
        }
      } else {
        shareTextToWhatsApp(caption, url);
        onDone?.();
      }
    } finally {
      setBusy(null);
    }
  };

  const handleInstagram = async () => {
    setBusy("ig");
    try {
      if (file) {
        const outcome = await shareImageToInstagram(file, caption);
        if (outcome === "shared") {
          toast({ title: "Enviado para o Instagram!" });
          onDone?.();
        } else if (outcome === "fallback") {
          toast({
            title: "Imagem baixada",
            description: "Publique no Instagram — a legenda já foi copiada.",
          });
          onDone?.();
        }
      } else {
        await shareTextToInstagram(caption);
        toast({
          title: "Texto copiado",
          description: "Cole a legenda no Instagram para publicar.",
        });
        onDone?.();
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`grid grid-cols-2 gap-2 ${className ?? ""}`}>
      <Button
        onClick={handleWhatsApp}
        disabled={busy !== null}
        className="gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white"
      >
        {busy === "wa" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        WhatsApp
      </Button>
      <Button
        onClick={handleInstagram}
        disabled={busy !== null}
        className="gap-2 text-white border-0"
        style={{
          background:
            "linear-gradient(135deg,#f58529 0%,#dd2a7b 50%,#8134af 100%)",
        }}
      >
        {busy === "ig" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Instagram className="w-4 h-4" />
        )}
        Instagram
      </Button>
    </div>
  );
}

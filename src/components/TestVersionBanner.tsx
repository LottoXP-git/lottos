import { useState } from "react";
import { FlaskConical, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNative } from "@/lib/platform";

const DISMISS_KEY = "lottos_test_banner_dismissed_v1";

/**
 * Email para feedback dos testadores do Closed Testing.
 * Pode ser trocado por um link de Google Form se preferir.
 */
const FEEDBACK_EMAIL = "contato@grupolottoxp.com";
const FEEDBACK_SUBJECT = "Feedback — Versão de teste Lottos";
const FEEDBACK_BODY =
  "Olá! Estou usando a versão de teste do Lottos e gostaria de compartilhar:\n\n" +
  "• O que funcionou bem:\n" +
  "• O que pode melhorar:\n" +
  "• Bugs encontrados:\n" +
  "• Aparelho / versão Android:\n";

/**
 * Considera "build de teste" quando:
 *  - VITE_TESTER_BUILD === "1" (definido no CI do APK/AAB de teste), OU
 *  - app rodando nativo (Capacitor) — todos os builds nativos atuais
 *    estão em Closed Testing no Play Console.
 */
function isTestBuild(): boolean {
  const envFlag = import.meta.env.VITE_TESTER_BUILD === "1";
  return envFlag || isNative();
}

export function TestVersionBanner() {
  const [dismissed, setDismissed] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (dismissed || !isTestBuild()) return null;

  const mailto = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
    FEEDBACK_SUBJECT,
  )}&body=${encodeURIComponent(FEEDBACK_BODY)}`;

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-amber-500/40 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-1.5">
        <FlaskConical className="h-4 w-4 shrink-0" />
        <p className="min-w-0 flex-1 truncate text-[11px] sm:text-xs font-medium">
          Você está usando uma <strong>versão de teste</strong> do Lottos.
          Seu feedback nos ajuda a melhorar!
        </p>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-7 shrink-0 border-amber-600/50 bg-white/60 px-2 text-[11px] text-amber-900 hover:bg-white dark:bg-amber-900/40 dark:text-amber-100"
        >
          <a href={mailto}>
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
            Enviar feedback
          </a>
        </Button>
        <button
          aria-label="Dispensar aviso"
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 hover:bg-amber-200/60 dark:hover:bg-amber-800/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
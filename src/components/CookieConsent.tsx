import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CONSENT_KEY = "lottos_cookie_consent";

type ConsentValue = "accepted" | "essential_only";

export function getCookieConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "essential_only" ? v : null;
}

function applyConsent(value: ConsentValue) {
  localStorage.setItem(CONSENT_KEY, value);
  // Sinaliza ao AdSense para não personalizar quando o usuário recusa
  try {
    const w = window as unknown as { adsbygoogle: unknown[] };
    w.adsbygoogle = w.adsbygoogle || [];
    if (value === "essential_only") {
      w.adsbygoogle.push({ requestNonPersonalizedAds: 1 });
    }
  } catch {
    // noop
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const handle = (value: ConsentValue) => {
    applyConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-fade-in"
    >
      <div className="container mx-auto max-w-4xl rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Usamos cookies para melhorar sua experiência
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilizamos cookies próprios e de parceiros (Google AdSense) para
              análise e exibição de anúncios. Você pode aceitar ou continuar
              apenas com cookies essenciais. Saiba mais em nossa{" "}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handle("essential_only")}
              className="flex-1 sm:flex-none"
            >
              Apenas essenciais
            </Button>
            <Button
              size="sm"
              onClick={() => handle("accepted")}
              className="flex-1 sm:flex-none"
            >
              Aceitar todos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
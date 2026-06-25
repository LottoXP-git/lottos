import { useState } from "react";
import { ShieldAlert, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

const AGE_TOKEN_KEY = "lottos_age_token_v1";
// Legacy key kept only so we can clear stale "true" values on first run.
const LEGACY_AGE_VERIFIED_KEY = "lottos_age_verified";

const BOT_UA_PATTERN = /Googlebot|AdsBot-Google|AdsBot-Google-Mobile|AdsBot-Google-Mobile-Apps|Mediapartners-Google|Google-InspectionTool|Google-Read-Aloud|GoogleOther|Storebot-Google|GoogleProducer|APIs-Google|FeedFetcher-Google|Chrome-Lighthouse|bingbot|DuckDuckBot|Slurp|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Applebot|PetalBot|SemrushBot|AhrefsBot/i;

function isSearchBot(): boolean {
  if (typeof navigator === "undefined") return false;
  return BOT_UA_PATTERN.test(navigator.userAgent || "");
}

function b64urlDecodeToString(s: string): string | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return atob(b64);
  } catch {
    return null;
  }
}

function isTokenStructurallyValid(token: string): boolean {
  // Format: <payloadB64Url>.<sigB64Url>
  // Signature is verified server-side (we cannot verify HMAC here without the
  // secret), but we can still reject trivially-forged values: anything that
  // does not parse as our payload shape or is expired is rejected.
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadStr, sig] = parts;
  if (!payloadStr || !sig || sig.length < 32) return false;
  const decoded = b64urlDecodeToString(payloadStr);
  if (!decoded) return false;
  try {
    const payload = JSON.parse(decoded) as { v?: number; exp?: number };
    if (payload.v !== 1) return false;
    if (typeof payload.exp !== "number") return false;
    if (payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function isAgeVerified(): boolean {
  if (isSearchBot()) return true;
  // Migrate away from the legacy boolean flag — it was trivially bypassable.
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(LEGACY_AGE_VERIFIED_KEY)) {
    localStorage.removeItem(LEGACY_AGE_VERIFIED_KEY);
  }
  const token = localStorage.getItem(AGE_TOKEN_KEY);
  if (!token) return false;
  if (!isTokenStructurallyValid(token)) {
    localStorage.removeItem(AGE_TOKEN_KEY);
    return false;
  }
  return true;
}

/**
 * Verifies the stored token's HMAC signature server-side. The structural
 * check in {@link isAgeVerified} runs synchronously so the UI can render
 * without flicker, but a forged token would also pass that check — this
 * call enforces the real cryptographic check.
 */
export async function verifyAgeTokenServerSide(): Promise<boolean> {
  if (isSearchBot()) return true;
  if (typeof localStorage === "undefined") return false;
  const token = localStorage.getItem(AGE_TOKEN_KEY);
  if (!token) return false;
  try {
    const { data, error } = await supabase.functions.invoke("verify-age", {
      body: { action: "verify", token },
    });
    if (error || !data?.valid) {
      localStorage.removeItem(AGE_TOKEN_KEY);
      return false;
    }
    return true;
  } catch {
    // On network failure keep the local token; next load will retry.
    return true;
  }
}

export function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleVerify = async () => {
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    if (!year || !month || !day) {
      setError("Selecione sua data de nascimento completa.");
      return;
    }

    const birthDate = new Date(year, month - 1, day);
    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      setError("Data de nascimento inválida.");
      return;
    }
    const eighteenth = new Date(year + 18, month - 1, day);
    if (eighteenth > new Date()) {
      setError("Você deve ter pelo menos 18 anos para acessar este aplicativo. Loterias são destinadas exclusivamente a maiores de idade.");
      return;
    }

    const birthDateStr = `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-age", {
        body: { birthDate: birthDateStr },
      });
      if (fnError || !data?.success || !data?.token) {
        setError("Não foi possível verificar a idade. Tente novamente.");
        return;
      }
      localStorage.setItem(AGE_TOKEN_KEY, data.token);
      onVerified();
    } catch {
      setError("Não foi possível verificar a idade. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-4 p-8 rounded-2xl border border-border/50 bg-card shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Verificação de Idade</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este aplicativo contém informações sobre loterias e jogos de azar.
            De acordo com a legislação brasileira, o acesso é restrito a <strong className="text-foreground">maiores de 18 anos</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground justify-center">
            <Calendar className="w-4 h-4 text-primary" />
            Data de Nascimento
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={birthDay}
              onChange={(e) => { setBirthDay(e.target.value); setError(""); }}
              className="h-11 px-2 rounded-lg bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
              aria-label="Dia"
            >
              <option value="">Dia</option>
              {days.map((d) => (
                <option key={d} value={d}>{d.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <select
              value={birthMonth}
              onChange={(e) => { setBirthMonth(e.target.value); setError(""); }}
              className="h-11 px-2 rounded-lg bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
              aria-label="Mês"
            >
              <option value="">Mês</option>
              {months.map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(e) => { setBirthYear(e.target.value); setError(""); }}
              className="h-11 px-2 rounded-lg bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
              aria-label="Ano"
            >
              <option value="">Ano</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={!birthYear || !birthMonth || !birthDay || submitting}
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitting ? "Verificando..." : "Confirmar Idade"}
        </Button>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Ao continuar, você confirma ter 18 anos ou mais e concorda com nossos{" "}
          <a href="/termos" className="text-primary hover:underline">Termos de Uso</a>{" "}
          e{" "}
          <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}

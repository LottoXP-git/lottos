import { useState } from "react";
import { ShieldAlert, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const AGE_VERIFIED_KEY = "lottos_age_verified";

export function isAgeVerified(): boolean {
  return localStorage.getItem(AGE_VERIFIED_KEY) === "true";
}

export function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleVerify = () => {
    const year = parseInt(birthYear);
    if (!year) {
      setError("Selecione seu ano de nascimento.");
      return;
    }

    const age = currentYear - year;
    if (age < 18) {
      setError("Você deve ter pelo menos 18 anos para acessar este aplicativo. Loterias são destinadas exclusivamente a maiores de idade.");
      return;
    }

    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    onVerified();
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
            Ano de Nascimento
          </label>
          <select
            value={birthYear}
            onChange={(e) => {
              setBirthYear(e.target.value);
              setError("");
            }}
            className="w-full h-11 px-4 rounded-lg bg-background/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer"
          >
            <option value="">Selecione o ano</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Button
          onClick={handleVerify}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={!birthYear}
        >
          <CheckCircle2 className="w-4 h-4" />
          Confirmar Idade
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

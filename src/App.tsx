import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AgeGate, isAgeVerified, verifyAgeTokenServerSide } from "@/components/AgeGate";
import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";
import { useForceUpdate } from "@/hooks/useForceUpdate";
import { Skeleton } from "@/components/ui/skeleton";
import Index from "./pages/Index";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import Admin from "./pages/Admin";
import MonthlyReport from "./pages/MonthlyReport";
import LotteryDraw from "./pages/LotteryDraw";
import HowToWin from "./pages/HowToWin";
import About from "./pages/About";
import ResponsibleGambling from "./pages/ResponsibleGambling";
import { CookieConsent } from "@/components/CookieConsent";
import { TestVersionBanner } from "@/components/TestVersionBanner";
import { NativeBannerMount } from "@/components/NativeBannerMount";

const queryClient = new QueryClient();

const App = () => {
  const [verified, setVerified] = useState(isAgeVerified());
  const { needsUpdate, isLoading, checkAgain } = useForceUpdate();

  // Defense-in-depth: re-verify the stored age token's HMAC signature with
  // the edge function. A forged token that passes the local structural check
  // is cleared here, forcing the gate to re-appear.
  useEffect(() => {
    if (!verified) return;
    verifyAgeTokenServerSide().then((ok) => {
      if (!ok) setVerified(false);
    });
  }, [verified]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (needsUpdate) {
    return (
      <div className="bg-background">
        <ForceUpdateScreen onRetry={checkAgain} />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {!verified ? (
            <AgeGate onVerified={() => setVerified(true)} />
          ) : (
            <BrowserRouter>
              <TestVersionBanner />
              <NativeBannerMount />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/historico" element={<History />} />
                <Route path="/estatisticas" element={<MonthlyReport />} />
                <Route path="/relatorio-mensal" element={<Navigate to="/estatisticas" replace />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/termos" element={<TermsOfUse />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/jogo-responsavel" element={<ResponsibleGambling />} />
                <Route path="/admin" element={<Admin />} />
                {/* SEO: guide pages targeting "como ganhar na X" keywords */}
                <Route path="/como-ganhar/:lotteryId" element={<HowToWin />} />
                {/* SEO: page per individual draw — /lotofacil/3669 etc. */}
                <Route path="/:lotteryId/:concurso" element={<LotteryDraw />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsent />
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

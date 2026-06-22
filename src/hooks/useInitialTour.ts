import { useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "lottos_tour_v1_done";
const START_DELAY_MS = 1200;
const STEP_INTERVAL_MS = 3500;
const TOAST_DURATION_MS = 5000;

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: "Bem-vindo ao Lottos! 🎲",
    description:
      "Resultados oficiais e ferramentas para todas as loterias da Caixa. Vamos te mostrar o essencial.",
  },
  {
    title: "Resultados em tempo real 📊",
    description:
      "Toque em qualquer card de loteria para ver detalhes, dezenas sorteadas e prêmios.",
  },
  {
    title: "Gerador Inteligente de Palpites 🧠",
    description:
      "Use estatísticas reais (números quentes/frios) para gerar combinações com mais critério.",
  },
  {
    title: "Conferidor de Apostas ✅",
    description:
      "Cole seu jogo e descubra rapidamente se você ganhou — sem precisar olhar dezena por dezena.",
  },
  {
    title: "Histórico e Estatísticas 📈",
    description:
      "Navegue por sorteios anteriores e veja frequência, atrasos e rankings.",
  },
];

function markDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

function isDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useInitialTour() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isDone()) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const toastIds: (string | number)[] = [];
    let cancelled = false;

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const position = isMobile ? "top-center" : "bottom-right";

    const skipTour = () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      toastIds.forEach((id) => toast.dismiss(id));
      markDone();
    };

    STEPS.forEach((step, index) => {
      const timer = setTimeout(() => {
        if (cancelled) return;
        const isFirst = index === 0;
        const isLast = index === STEPS.length - 1;
        const id = toast(step.title, {
          description: step.description,
          duration: TOAST_DURATION_MS,
          position,
          action: isFirst
            ? { label: "Pular tour", onClick: skipTour }
            : isLast
            ? { label: "Entendi!", onClick: markDone }
            : undefined,
        });
        toastIds.push(id);
        if (isLast) markDone();
      }, START_DELAY_MS + index * STEP_INTERVAL_MS);
      timers.push(timer);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);
}
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UpcomingMatch } from "@/components/LotecaUpcomingMatches";

export interface LotecaProgramming {
  concurso: number;
  periodoApostas: string;
  dataJogos: string;
  apuracao: string;
  jogos: UpcomingMatch[];
}

export function useLotecaProgramming(fallback: LotecaProgramming) {
  return useQuery<LotecaProgramming>({
    queryKey: ["loteca-programming"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("fetch-loteca-programming");
        if (error) return fallback;
        if (!data?.success || !data?.data) return fallback;
        return data.data as LotecaProgramming;
      } catch {
        return fallback;
      }
    },
    placeholderData: fallback,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
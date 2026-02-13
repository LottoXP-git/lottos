import { LotteryResult } from "@/data/lotteryData";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface PrizeEvolutionChartProps {
  lottery: LotteryResult;
  variant?: "megasena" | "lotofacil" | "quina" | "lotomania" | "duplasena" | "diadesorte" | "supersete" | "maismilionaria" | "timemania" | "federal" | "loteca";
}

const variantColors: Record<string, string> = {
  megasena: "hsl(142, 76%, 36%)",
  lotofacil: "hsl(280, 67%, 51%)",
  quina: "hsl(220, 70%, 50%)",
  lotomania: "hsl(24, 95%, 53%)",
  duplasena: "hsl(348, 83%, 47%)",
  diadesorte: "hsl(38, 92%, 50%)",
  supersete: "hsl(85, 70%, 45%)",
  maismilionaria: "hsl(230, 60%, 55%)",
  timemania: "hsl(142, 70%, 40%)",
  federal: "hsl(200, 70%, 50%)",
  loteca: "hsl(0, 70%, 50%)",
};

function parsePrizeValue(prize: string): number {
  if (!prize) return 0;
  const cleaned = prize
    .replace("R$", "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function formatCompactValue(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toFixed(0)}`;
}

async function fetchPrizeHistory(lotteryId: string): Promise<{ concurso: number; prize: number; date: string }[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/fetch-lottery-results?lottery=${lotteryId}&mode=history&count=15`,
    {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch prize history");

  const data = await response.json();
  const results: LotteryResult[] = data?.results || [];

  return results
    .map((r) => ({
      concurso: r.concurso,
      prize: parsePrizeValue(r.prize),
      date: r.date,
    }))
    .sort((a, b) => a.concurso - b.concurso);
}

export function PrizeEvolutionChart({ lottery, variant }: PrizeEvolutionChartProps) {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ["prize-evolution", lottery.id],
    queryFn: () => fetchPrizeHistory(lottery.id),
    staleTime: 1000 * 60 * 10,
  });

  const color = variantColors[variant || "megasena"] || variantColors.megasena;

  const chartConfig: ChartConfig = {
    prize: {
      label: "Prêmio",
      color,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !chartData || chartData.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-8">
        Não foi possível carregar o gráfico de evolução.
      </p>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <TrendingUp className="w-4 h-4" />
        Evolução dos Prêmios — {lottery.name}
      </div>

      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`fill-${lottery.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis
            dataKey="concurso"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={(v) => `#${v}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={(v) => formatCompactValue(v)}
            width={70}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `Concurso ${item.concurso} — ${item.date}` : "";
                }}
                formatter={(value) => [
                  `R$ ${Number(value).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`,
                  "Prêmio",
                ]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="prize"
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${lottery.id})`}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLotteryHistory } from "@/hooks/useLotteryResults";
import { LotteryResult } from "@/data/lotteryData";
import { Heart, CalendarDays, Clover, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface SpecialStatsProps {
  lottery: LotteryResult;
}

interface FrequencyItem {
  name: string;
  count: number;
}

function RankingList({ items, icon, accentClass, borderClass, bgClass }: {
  items: FrequencyItem[];
  icon: React.ReactNode;
  accentClass: string;
  borderClass: string;
  bgClass: string;
}) {
  if (items.length === 0) return <p className="text-xs sm:text-sm text-muted-foreground text-center">Dados insuficientes</p>;
  const max = items[0].count;

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {items.map((item, idx) => (
        <div key={item.name} className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg ${bgClass} border ${borderClass}`}>
          <span className={`text-xs sm:text-sm font-bold ${accentClass} w-5 sm:w-6 text-center`}>{idx + 1}º</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <span className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</span>
              <span className={`text-[10px] sm:text-xs font-mono font-semibold ${accentClass}`}>{item.count}x</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${accentClass.replace("text-", "bg-")}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpecialStats({ lottery }: SpecialStatsProps) {
  const { data: history, isLoading } = useLotteryHistory(lottery.id, 100);

  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    if (lottery.id === "timemania") {
      const freq: Record<string, number> = {};
      history.forEach((r) => {
        if (r.timeCoracao) {
          freq[r.timeCoracao] = (freq[r.timeCoracao] || 0) + 1;
        }
      });
      const items: FrequencyItem[] = Object.entries(freq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      return { type: "timemania" as const, items, total: history.length };
    }

    if (lottery.id === "diadesorte") {
      const freq: Record<string, number> = {};
      history.forEach((r) => {
        if (r.mesSorte) {
          freq[r.mesSorte] = (freq[r.mesSorte] || 0) + 1;
        }
      });
      const items: FrequencyItem[] = Object.entries(freq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      return { type: "diadesorte" as const, items, total: history.length };
    }

    if (lottery.id === "maismilionaria") {
      const freq: Record<number, number> = {};
      history.forEach((r) => {
        if (r.trevos) {
          r.trevos.forEach((t) => {
            freq[t] = (freq[t] || 0) + 1;
          });
        }
      });
      const items: FrequencyItem[] = Object.entries(freq)
        .map(([name, count]) => ({ name: `Trevo ${name}`, count: count as number }))
        .sort((a, b) => b.count - a.count);
      return { type: "maismilionaria" as const, items, total: history.length };
    }

    return null;
  }, [history, lottery.id]);

  // Only render for supported lotteries
  if (!["timemania", "diadesorte", "maismilionaria"].includes(lottery.id)) return null;

  if (isLoading) {
    return (
      <Card className="card-glass border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando estatísticas...</span>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.items.length === 0) return null;

  const config = {
    timemania: {
      title: "Times Mais Sorteados",
      subtitle: `Últimos ${stats.total} concursos`,
      icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 fill-green-400" />,
      accentClass: "text-green-400",
      borderClass: "border-green-500/20",
      bgClass: "bg-green-500/5",
    },
    diadesorte: {
      title: "Meses Mais Sorteados",
      subtitle: `Últimos ${stats.total} concursos`,
      icon: <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />,
      accentClass: "text-amber-400",
      borderClass: "border-amber-500/20",
      bgClass: "bg-amber-500/5",
    },
    maismilionaria: {
      title: "Trevos Mais Sorteados",
      subtitle: `Últimos ${stats.total} concursos`,
      icon: <Clover className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />,
      accentClass: "text-emerald-400",
      borderClass: "border-emerald-500/20",
      bgClass: "bg-emerald-500/5",
    },
  };

  const c = config[stats.type];

  return (
    <Card className={`card-glass ${c.borderClass}`}>
      <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
          {c.icon}
          <span className={c.accentClass}>{c.title}</span>
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{c.subtitle}</p>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <RankingList
          items={stats.items}
          icon={c.icon}
          accentClass={c.accentClass}
          borderClass={c.borderClass}
          bgClass={c.bgClass}
        />
      </CardContent>
    </Card>
  );
}

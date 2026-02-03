import { NumberFrequency } from "@/data/lotteryData";
import { cn } from "@/lib/utils";

interface FrequencyChartProps {
  data: NumberFrequency[];
  maxNumber: number;
  title?: string;
}

export function FrequencyChart({ data, maxNumber, title }: FrequencyChartProps) {
  const maxFreq = Math.max(...data.map(d => d.frequency));
  const sortedByNumber = [...data].sort((a, b) => a.number - b.number);
  
  // Split into rows for better display
  const itemsPerRow = maxNumber <= 25 ? 5 : maxNumber <= 60 ? 10 : 10;
  const rows = [];
  for (let i = 0; i < sortedByNumber.length; i += itemsPerRow) {
    rows.push(sortedByNumber.slice(i, i + itemsPerRow));
  }

  const getHeatColor = (frequency: number) => {
    const ratio = frequency / maxFreq;
    if (ratio > 0.8) return "bg-emerald-500";
    if (ratio > 0.6) return "bg-emerald-600/80";
    if (ratio > 0.4) return "bg-primary/70";
    if (ratio > 0.2) return "bg-orange-500/60";
    return "bg-rose-500/50";
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      
      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center flex-wrap">
            {row.map((item) => (
              <div
                key={item.number}
                className={cn(
                  "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-mono transition-all duration-300 hover:scale-110 cursor-pointer group relative",
                  getHeatColor(item.frequency)
                )}
                title={`Dezena ${item.number}: ${item.frequency} vezes`}
              >
                <span className="font-bold text-white">{item.number.toString().padStart(2, "0")}</span>
                <span className="text-[10px] text-white/70">{item.frequency}</span>
                
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                  <span className="text-muted-foreground">Frequência:</span>{" "}
                  <span className="text-primary font-bold">{item.frequency}x</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded bg-rose-500/50" />
          <span>Menos frequente</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span>Mais frequente</span>
        </div>
      </div>
    </div>
  );
}

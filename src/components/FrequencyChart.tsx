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
  const itemsPerRow = maxNumber <= 25 ? 5 : 10;
  const mobileItemsPerRow = maxNumber <= 25 ? 5 : 8;
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
    <div className="space-y-3 sm:space-y-4">
      {title && (
        <h3 className="text-sm sm:text-lg font-semibold text-foreground">{title}</h3>
      )}
      
      <div className="space-y-1 sm:space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-0.5 sm:gap-1 justify-center flex-wrap">
            {row.map((item) => (
              <div
                key={item.number}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex flex-col items-center justify-center font-mono transition-all duration-300 hover:scale-110 cursor-pointer group relative",
                  getHeatColor(item.frequency)
                )}
                title={`Dezena ${item.number}: ${item.frequency} vezes`}
              >
                <span className="font-bold text-white text-[10px] sm:text-xs">{item.number.toString().padStart(2, "0")}</span>
                <span className="text-[8px] sm:text-[10px] text-white/70">{item.frequency}</span>
                
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg hidden sm:block">
                  <span className="text-muted-foreground">Frequência:</span>{" "}
                  <span className="text-primary font-bold">{item.frequency}x</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-rose-500/50" />
          <span>Menos frequente</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-500" />
          <span>Mais frequente</span>
        </div>
      </div>
    </div>
  );
}

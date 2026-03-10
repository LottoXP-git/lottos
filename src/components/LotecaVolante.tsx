import { LotecaMatch } from "@/data/lotteryData";
import { Dribbble, Check } from "lucide-react";

interface LotecaVolanteProps {
  jogos: LotecaMatch[];
  concurso: number;
}

export function LotecaVolante({ jogos, concurso }: LotecaVolanteProps) {
  return (
    <div className="rounded-xl border-2 border-red-500/30 overflow-hidden bg-card">
      {/* Header - simulating volante top */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dribbble className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm sm:text-base tracking-wide">LOTECA</span>
        </div>
        <span className="text-white/80 text-xs sm:text-sm font-mono">Concurso {concurso}</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[2rem_1fr_auto_auto_auto_1fr] sm:grid-cols-[2.5rem_1fr_3.5rem_3.5rem_3.5rem_1fr] items-center bg-red-500/10 border-b border-red-500/20 px-2 sm:px-3 py-2">
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">Nº</span>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">TIME 1</span>
        <span className="text-[10px] sm:text-xs font-bold text-center text-emerald-500">COL 1</span>
        <span className="text-[10px] sm:text-xs font-bold text-center text-amber-500">EMPATE</span>
        <span className="text-[10px] sm:text-xs font-bold text-center text-blue-500">COL 2</span>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">TIME 2</span>
      </div>

      {/* Matches */}
      <div className="divide-y divide-border/50">
        {jogos.map((jogo, idx) => {
          const isCol1 = jogo.resultado === "coluna1";
          const isEmpate = jogo.resultado === "empate";
          const isCol2 = jogo.resultado === "coluna2";

          return (
            <div
              key={idx}
              className="grid grid-cols-[2rem_1fr_auto_auto_auto_1fr] sm:grid-cols-[2.5rem_1fr_3.5rem_3.5rem_3.5rem_1fr] items-center px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-red-500/5 transition-colors"
            >
              {/* Number */}
              <span className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground text-center">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Team 1 */}
              <div className="flex items-center gap-1 min-w-0 px-1">
                <span
                  className={`text-[10px] sm:text-xs truncate ${
                    isCol1 ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {jogo.equipeUm}
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold shrink-0">
                  {jogo.golEquipeUm}
                </span>
              </div>

              {/* Col 1 marker */}
              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isCol1
                      ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : "border-border/60 bg-secondary/30"
                  }`}
                >
                  {isCol1 && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>

              {/* Empate marker */}
              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isEmpate
                      ? "bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                      : "border-border/60 bg-secondary/30"
                  }`}
                >
                  {isEmpate && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>

              {/* Col 2 marker */}
              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all ${
                    isCol2
                      ? "bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                      : "border-border/60 bg-secondary/30"
                  }`}
                >
                  {isCol2 && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-end gap-1 min-w-0 px-1">
                <span className="text-[10px] font-mono text-red-400 font-bold shrink-0">
                  {jogo.golEquipeDois}
                </span>
                <span
                  className={`text-[10px] sm:text-xs truncate text-right ${
                    isCol2 ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {jogo.equipeDois}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Legend */}
      <div className="bg-red-500/5 border-t border-red-500/20 px-3 py-2 flex items-center justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Coluna 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Empate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Coluna 2</span>
        </div>
      </div>
    </div>
  );
}

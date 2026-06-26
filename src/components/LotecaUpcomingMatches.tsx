import { Dribbble, Calendar, Clock, Trophy } from "lucide-react";

export interface UpcomingMatch {
  equipeUm: string;
  equipeDois: string;
  campeonato?: string;
}

interface LotecaUpcomingMatchesProps {
  concurso: number;
  jogos: UpcomingMatch[];
  periodoApostas: string;
  dataJogos: string;
  apuracao: string;
}

// Programação oficial — Concurso 1257
export const LOTECA_1257: LotecaUpcomingMatchesProps = {
  concurso: 1257,
  periodoApostas: "18/06/2026 até as 21h de 21/06/2026",
  dataJogos: "21/06/2026 a 24/06/2026",
  apuracao: "21h de 21/06/2026",
  jogos: [
    { equipeUm: "Escócia", equipeDois: "Brasil", campeonato: "Copa do Mundo" },
    { equipeUm: "Nova Zelândia", equipeDois: "Egito", campeonato: "Copa do Mundo" },
    { equipeUm: "Argentina", equipeDois: "Áustria", campeonato: "Copa do Mundo" },
    { equipeUm: "França", equipeDois: "Iraque", campeonato: "Copa do Mundo" },
    { equipeUm: "Noruega", equipeDois: "Senegal", campeonato: "Copa do Mundo" },
    { equipeUm: "Portugal", equipeDois: "Uzbequistão", campeonato: "Copa do Mundo" },
    { equipeUm: "Inglaterra", equipeDois: "Gana", campeonato: "Copa do Mundo" },
    { equipeUm: "Panamá", equipeDois: "Croácia", campeonato: "Copa do Mundo" },
    { equipeUm: "Colômbia", equipeDois: "Congo", campeonato: "Copa do Mundo" },
    { equipeUm: "Suíça", equipeDois: "Canadá", campeonato: "Copa do Mundo" },
    { equipeUm: "Bósnia Herzegovina", equipeDois: "Catar", campeonato: "Copa do Mundo" },
    { equipeUm: "Marrocos", equipeDois: "Haiti", campeonato: "Copa do Mundo" },
    { equipeUm: "África do Sul", equipeDois: "Coreia do Sul", campeonato: "Copa do Mundo" },
    { equipeUm: "República Tcheca", equipeDois: "México", campeonato: "Copa do Mundo" },
  ],
};

export function LotecaUpcomingMatches({
  concurso,
  jogos,
  periodoApostas,
  dataJogos,
  apuracao,
}: LotecaUpcomingMatchesProps) {
  return (
    <div className="rounded-xl border-2 border-red-500/30 overflow-hidden bg-card">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 px-3 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dribbble className="w-5 h-5 text-white" />
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-sm sm:text-base tracking-wide">
              PROGRAMAÇÃO DE JOGOS
            </span>
            <span className="text-white/80 text-[10px] sm:text-xs">Próximo concurso</span>
          </div>
        </div>
        <span className="text-white font-mono font-bold text-sm sm:text-base">
          Nº {concurso}
        </span>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 bg-red-500/5 border-b border-red-500/20 px-3 py-2.5">
        <div className="flex items-start gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Apostas</span>
            <span className="text-[10px] sm:text-xs text-foreground">{periodoApostas}</span>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Jogos</span>
            <span className="text-[10px] sm:text-xs text-foreground">{dataJogos}</span>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Apuração</span>
            <span className="text-[10px] sm:text-xs text-foreground">{apuracao}</span>
          </div>
        </div>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-[2rem_1fr_auto_1fr] sm:grid-cols-[2.5rem_1fr_auto_1fr] items-center bg-red-500/10 border-b border-red-500/20 px-2 sm:px-3 py-2">
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">Nº</span>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">COLUNA 1</span>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center px-2">X</span>
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center">COLUNA 2</span>
      </div>

      {/* Matches */}
      <div className="divide-y divide-border/50">
        {jogos.map((jogo, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[2rem_1fr_auto_1fr] sm:grid-cols-[2.5rem_1fr_auto_1fr] items-center px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-red-500/5 transition-colors"
          >
            <span className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground text-center">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground truncate text-right pr-2">
              {jogo.equipeUm}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground px-1">x</span>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground truncate pl-2">
              {jogo.equipeDois}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-red-500/5 border-t border-red-500/20 px-3 py-2 text-center">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground italic">
          Sujeito a alterações até o início das apostas. Confira sempre antes do registro.
        </p>
      </div>
    </div>
  );
}
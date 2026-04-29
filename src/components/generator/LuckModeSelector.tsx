import { useState } from "react";
import { LUCK_MODES, ZODIAC_SIGNS, type LuckModeId } from "@/lib/luckModes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LuckModeSelectorProps {
  mode: LuckModeId;
  onModeChange: (mode: LuckModeId) => void;
  input: string;
  onInputChange: (value: string) => void;
}

export function LuckModeSelector({ mode, onModeChange, input, onInputChange }: LuckModeSelectorProps) {
  const current = LUCK_MODES.find((m) => m.id === mode) ?? LUCK_MODES[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Modo de sorte
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] text-primary hover:underline"
        >
          {open ? "Recolher" : "Ver todos"}
        </button>
      </div>

      {open ? (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
          {LUCK_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              title={m.description}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border-2 transition-all",
                mode === m.id
                  ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  : "border-border bg-secondary/30 hover:border-primary/40"
              )}
            >
              <span className="text-lg leading-none">{m.emoji}</span>
              <span className="text-[11px] font-medium text-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border-2 border-primary/40 bg-primary/5 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-base">{current.emoji}</span>
            {current.label}
          </span>
          <span className="text-[10px] text-muted-foreground">trocar</span>
        </button>
      )}

      {current.needsInput === "date" && (
        <Input
          type="date"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-10"
        />
      )}
      {current.needsInput === "zodiac" && (
        <Select value={input} onValueChange={onInputChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Escolha seu signo" />
          </SelectTrigger>
          <SelectContent>
            {ZODIAC_SIGNS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {current.needsInput === "dream" && (
        <Input
          placeholder="Descreva o sonho em uma palavra (ex.: cobra, água...)"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-10"
          maxLength={40}
        />
      )}
      {current.needsInput === "birthday" && (
        <Input
          placeholder="dd/mm/aaaa"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-10"
          maxLength={10}
        />
      )}
    </div>
  );
}
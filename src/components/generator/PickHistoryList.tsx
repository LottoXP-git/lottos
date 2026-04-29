import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy, Star, Trash2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { PickHistoryItem } from "@/hooks/usePickHistory";
import { rarityInfo } from "@/lib/pickRarity";

interface PickHistoryListProps {
  items: PickHistoryItem[];
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildShareText(item: PickHistoryItem) {
  let text = `${item.lotteryName}: ${item.numbers
    .map((n) => n.toString().padStart(2, "0"))
    .join(" - ")}`;
  if (item.trevos?.length) text += ` | Trevos: ${item.trevos.join(" - ")}`;
  if (item.timeCoracao) text += ` | Time: ${item.timeCoracao}`;
  if (item.mesSorte) text += ` | Mês: ${item.mesSorte}`;
  return text;
}

export function PickHistoryList({
  items,
  onToggleFavorite,
  onRemove,
  onClear,
}: PickHistoryListProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/40 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground">
          <History className="w-3.5 h-3.5 text-primary" />
          Meus palpites
          <span className="text-[10px] text-muted-foreground font-normal">
            ({items.length})
          </span>
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
              {items.map((item) => {
                const info = rarityInfo(item.rarity);
                return (
                  <div key={item.id} className="px-3 py-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-foreground truncate">
                            {item.lotteryName}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-full border",
                              info.badgeClass
                            )}
                          >
                            {info.emoji} {info.label}
                          </span>
                        </div>
                        <div className="text-[9px] text-muted-foreground">
                          {formatTime(item.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.id)}
                          className="p-1 rounded-md hover:bg-secondary transition-colors"
                          title={item.favorite ? "Desfavoritar" : "Favoritar"}
                        >
                          <Star
                            className={cn(
                              "w-3.5 h-3.5",
                              item.favorite
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(buildShareText(item));
                            toast.success("Copiado!");
                          }}
                          className="p-1 rounded-md hover:bg-secondary transition-colors"
                          title="Copiar"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="p-1 rounded-md hover:bg-destructive/20 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.numbers.map((n, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold text-primary"
                        >
                          {n.toString().padStart(2, "0")}
                        </span>
                      ))}
                      {item.trevos?.map((t, i) => (
                        <span
                          key={`t-${i}`}
                          className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400"
                          title="Trevo"
                        >
                          ✦{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 py-1.5 border-t border-border/50 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={() => {
                  onClear();
                  toast.success("Histórico limpo");
                }}
              >
                Limpar histórico
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
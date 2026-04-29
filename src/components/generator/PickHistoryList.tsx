import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Copy, Star, Trash2, History, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateImportPayload, type PickHistoryItem } from "@/hooks/usePickHistory";
import { rarityInfo } from "@/lib/pickRarity";

interface PickHistoryListProps {
  items: PickHistoryItem[];
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onImport?: (items: PickHistoryItem[]) => number;
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
  onImport,
}: PickHistoryListProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "fav">("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const favCount = items.filter((i) => i.favorite).length;
  const filtered = tab === "fav" ? items.filter((i) => i.favorite) : items;

  const handleExport = () => {
    if (items.length === 0) {
      toast.info("Nada para exportar ainda");
      return;
    }
    const payload = {
      app: "lottos",
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lottos-palpites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exportados ${items.length} palpites em JSON`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const valid = validateImportPayload(parsed);
      if (!valid || valid.length === 0) {
        toast.error("Arquivo JSON inválido ou vazio");
        return;
      }
      const added = onImport?.(valid) ?? 0;
      if (added > 0) {
        toast.success(`${added} palpite${added > 1 ? "s" : ""} importado${added > 1 ? "s" : ""}`);
      } else {
        toast.info("Todos os palpites já existem no histórico");
      }
    } catch {
      toast.error("Falha ao ler o arquivo JSON");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (items.length === 0 && !onImport) return null;

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
            {/* Tabs + actions */}
            <div className="px-3 pt-2 pb-1 flex items-center justify-between gap-2 border-b border-border/40">
              <div className="inline-flex rounded-lg bg-background/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors",
                    tab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Todos ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab("fav")}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1",
                    tab === "fav"
                      ? "bg-amber-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Star className="w-2.5 h-2.5" /> Favoritos ({favCount})
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  title="Exportar JSON"
                >
                  <Download className="w-3 h-3" /> JSON
                </button>
                {onImport && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      title="Importar JSON"
                    >
                      <Upload className="w-3 h-3" /> Importar
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportFile(f);
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">
                  {tab === "fav"
                    ? "Nenhum favorito ainda — toque na ⭐ de um palpite."
                    : "Sem palpites por aqui."}
                </div>
              )}
              {filtered.map((item) => {
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
import { useCallback, useEffect, useState } from "react";
import type { Rarity } from "@/lib/pickRarity";

const STORAGE_KEY = "lottos_pick_history_v1";
const MAX_ITEMS = 50;

export interface PickHistoryItem {
  id: string;
  lotteryId: string;
  lotteryName: string;
  numbers: number[];
  trevos?: number[];
  timeCoracao?: string;
  mesSorte?: string;
  strategy: "hot" | "cold" | "balanced";
  rarity: Rarity;
  createdAt: number; // ms timestamp
  favorite?: boolean;
}

function load(): PickHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(items: PickHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function usePickHistory() {
  const [items, setItems] = useState<PickHistoryItem[]>(() => load());

  useEffect(() => {
    save(items);
  }, [items]);

  const add = useCallback((item: Omit<PickHistoryItem, "id" | "createdAt">) => {
    setItems((prev) => {
      const next: PickHistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      // Keep favorites + most recent up to MAX_ITEMS
      const merged = [next, ...prev];
      const favs = merged.filter((m) => m.favorite);
      const rest = merged.filter((m) => !m.favorite);
      const trimmed = [...favs, ...rest].slice(0, MAX_ITEMS);
      return trimmed;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const replaceAll = useCallback((next: PickHistoryItem[]) => {
    setItems(next.slice(0, MAX_ITEMS));
  }, []);

  /**
   * Merge imported items into the current list. Items with the same id are
   * preserved (existing wins), the rest are appended and the list is trimmed.
   * Returns how many items were actually added.
   */
  const importItems = useCallback((incoming: PickHistoryItem[]) => {
    let added = 0;
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const item of incoming) {
        if (seen.has(item.id)) continue;
        merged.push(item);
        seen.add(item.id);
        added += 1;
      }
      // Sort: favorites first, then most recent
      merged.sort((a, b) => {
        if (!!b.favorite !== !!a.favorite) return b.favorite ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
      return merged.slice(0, MAX_ITEMS);
    });
    return added;
  }, []);

  return { items, add, remove, toggleFavorite, clear, replaceAll, importItems };
}

/** Validate a parsed JSON payload as a PickHistoryItem array. */
export function validateImportPayload(payload: unknown): PickHistoryItem[] | null {
  const arr = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.items)
    ? (payload as any).items
    : null;
  if (!arr) return null;
  const out: PickHistoryItem[] = [];
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as any;
    if (
      typeof r.id === "string" &&
      typeof r.lotteryId === "string" &&
      typeof r.lotteryName === "string" &&
      Array.isArray(r.numbers) &&
      r.numbers.every((n: unknown) => typeof n === "number") &&
      typeof r.createdAt === "number"
    ) {
      out.push({
        id: r.id,
        lotteryId: r.lotteryId,
        lotteryName: r.lotteryName,
        numbers: r.numbers,
        trevos: Array.isArray(r.trevos) ? r.trevos : undefined,
        timeCoracao: typeof r.timeCoracao === "string" ? r.timeCoracao : undefined,
        mesSorte: typeof r.mesSorte === "string" ? r.mesSorte : undefined,
        strategy: r.strategy === "hot" || r.strategy === "cold" ? r.strategy : "balanced",
        rarity: ["common", "rare", "epic", "legendary"].includes(r.rarity) ? r.rarity : "common",
        createdAt: r.createdAt,
        favorite: !!r.favorite,
      });
    }
  }
  return out;
}
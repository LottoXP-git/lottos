import { useCallback, useEffect, useState } from "react";
import type { Rarity } from "@/lib/pickRarity";

const STORAGE_KEY = "lottos_pick_history_v1";
const MAX_ITEMS = 10;

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

  return { items, add, remove, toggleFavorite, clear };
}
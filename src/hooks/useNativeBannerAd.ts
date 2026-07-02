import { useEffect } from "react";
import { isNative } from "@/lib/platform";
import { ensureAdMobInit } from "@/lib/admob";
import { BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

interface UseNativeBannerAdOptions {
  adId: string;
  position?: BannerAdPosition;
  adSize?: BannerAdSize;
  margin?: number;
  /** Higher priority takes over the visible banner slot. Default 0. */
  priority?: number;
}

type Entry = Required<Omit<UseNativeBannerAdOptions, "priority">> & {
  priority: number;
  id: number;
};

let seq = 0;
const stack: Entry[] = [];
let currentKey = "";
let applyingPromise: Promise<void> | null = null;

function keyOf(e: Entry | undefined) {
  return e ? `${e.adId}|${e.position}|${e.adSize}|${e.margin}` : "";
}

function topEntry(): Entry | undefined {
  if (stack.length === 0) return undefined;
  // Highest priority; ties broken by insertion order (later wins).
  let top = stack[0];
  for (let i = 1; i < stack.length; i++) {
    if (stack[i].priority >= top.priority) top = stack[i];
  }
  return top;
}

async function applyTop() {
  if (applyingPromise) {
    await applyingPromise;
  }
  applyingPromise = (async () => {
    const { AdMob } = await import("@capacitor-community/admob");
    const desired = topEntry();
    const desiredKey = keyOf(desired);
    if (desiredKey === currentKey) return;
    try {
      await AdMob.removeBanner();
    } catch {
      /* noop – nothing showing */
    }
    currentKey = "";
    if (!desired) return;
    try {
      await ensureAdMobInit();
      await AdMob.showBanner({
        adId: desired.adId,
        position: desired.position,
        adSize: desired.adSize,
        margin: desired.margin,
        isTesting: false,
      });
      currentKey = desiredKey;
    } catch (err) {
      console.warn("Native banner failed to show:", err);
    }
  })();
  try {
    await applyingPromise;
  } finally {
    applyingPromise = null;
  }
}

export function useNativeBannerAd(options: UseNativeBannerAdOptions) {
  useEffect(() => {
    if (!isNative()) return;
    const entry: Entry = {
      adId: options.adId,
      position: options.position ?? BannerAdPosition.BOTTOM_CENTER,
      adSize: options.adSize ?? BannerAdSize.ADAPTIVE_BANNER,
      margin: options.margin ?? 0,
      priority: options.priority ?? 0,
      id: ++seq,
    };
    stack.push(entry);
    void applyTop();

    return () => {
      const idx = stack.findIndex((e) => e.id === entry.id);
      if (idx >= 0) stack.splice(idx, 1);
      void applyTop();
    };
  }, [options.adId, options.position, options.adSize, options.margin, options.priority]);
}

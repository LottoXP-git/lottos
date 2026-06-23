import { useEffect, useRef } from "react";
import { isNative } from "@/lib/platform";
import { ensureAdMobInit } from "@/lib/admob";
import { BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

interface UseNativeBannerAdOptions {
  adId: string;
  position?: BannerAdPosition;
  adSize?: BannerAdSize;
  margin?: number;
}

export function useNativeBannerAd(options: UseNativeBannerAdOptions) {
  const shown = useRef(false);

  useEffect(() => {
    if (!isNative()) return;

    let cancelled = false;

    (async () => {
      try {
        await ensureAdMobInit();
        if (cancelled) return;
        const { AdMob } = await import("@capacitor-community/admob");
        await AdMob.showBanner({
          adId: options.adId,
          position: options.position ?? BannerAdPosition.BOTTOM_CENTER,
          adSize: options.adSize ?? BannerAdSize.ADAPTIVE_BANNER,
          margin: options.margin ?? 0,
          isTesting: false,
        });
        if (!cancelled) shown.current = true;
      } catch (err) {
        console.warn("Native banner failed to show:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (shown.current) {
        shown.current = false;
        (async () => {
          try {
            const { AdMob } = await import("@capacitor-community/admob");
            await AdMob.removeBanner();
          } catch (err) {
            console.warn("Native banner failed to remove:", err);
          }
        })();
      }
    };
  }, [options.adId, options.position, options.adSize, options.margin]);
}

import { useEffect } from "react";
import { isNative } from "@/lib/platform";
import { ensureAdMobInit } from "@/lib/admob";
import { BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

interface UseNativeBannerAdOptions {
  adId: string;
  position?: BannerAdPosition;
  adSize?: BannerAdSize;
  margin?: number;
}

/** Global ref counter so only one native banner is active at a time. */
let refCount = 0;

export function useNativeBannerAd(options: UseNativeBannerAdOptions) {
  useEffect(() => {
    if (!isNative()) return;

    refCount++;
    let cancelled = false;

    // Only the first mounted instance triggers the banner.
    if (refCount === 1) {
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
        } catch (err) {
          console.warn("Native banner failed to show:", err);
        }
      })();
    }

    return () => {
      cancelled = true;
      refCount--;
      if (refCount === 0) {
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

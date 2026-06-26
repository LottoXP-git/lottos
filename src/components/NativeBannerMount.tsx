import { useNativeBannerAd } from "@/hooks/useNativeBannerAd";
import { BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

/** Real AdMob banner unit ID for native Android/iOS. */
const NATIVE_BANNER_AD_ID = "ca-app-pub-2147498950861352/1961507403";

/**
 * Mounts the native AdMob banner overlay exactly once for the app lifetime.
 * No-op on web. Render this once near the root.
 */
export function NativeBannerMount() {
  useNativeBannerAd({
    adId: NATIVE_BANNER_AD_ID,
    position: BannerAdPosition.BOTTOM_CENTER,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
  });
  return null;
}
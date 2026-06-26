import { isNative } from "./platform";
import { ensureAdMobInit } from "./admob";

// AdMob Rewarded Ad Unit IDs (produção).
const REWARDED_ANDROID = "ca-app-pub-2147498950861352/2849021580";
// iOS ainda sem unit própria — usa o ID oficial de teste do Google até ser provisionado.
const REWARDED_IOS = "ca-app-pub-3940256099942544/1712485313";

/**
 * Loads and shows a real AdMob Rewarded ad on native platforms.
 * Resolves true when the user earned the reward, false otherwise.
 * Throws on the web — callers should fall back to the simulated VideoAdModal.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!isNative()) throw new Error("Rewarded ads only available on native");
  await ensureAdMobInit();
  const { AdMob, AdmobConsentStatus } = await import("@capacitor-community/admob");

  // Best-effort UMP consent (required for EEA, harmless elsewhere).
  try {
    const info = await AdMob.requestConsentInfo();
    if (
      info.isConsentFormAvailable &&
      info.status === AdmobConsentStatus.REQUIRED
    ) {
      await AdMob.showConsentForm();
    }
  } catch {
    // Ignore consent errors — proceed with ad request.
  }

  const adId =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("iphone")
      ? REWARDED_IOS
      : REWARDED_ANDROID;

  await AdMob.prepareRewardVideoAd({ adId });
  const reward = await AdMob.showRewardVideoAd();
  // showRewardVideoAd resolves with AdMobRewardItem when the user earned it.
  return !!reward && typeof reward.amount === "number";
}

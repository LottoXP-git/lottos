import { isNative } from "./platform";
import { ensureAdMobInit } from "./admob";

// AdMob Rewarded Ad Unit IDs.
// NOTE: the publisher unit 1961507403 is a *Native Advanced* unit, which is
// incompatible with rewarded video. Until a real Rewarded unit is provisioned
// in AdMob, we use Google's official test IDs to avoid policy violations.
const REWARDED_ANDROID = "ca-app-pub-3940256099942544/5224354917";
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

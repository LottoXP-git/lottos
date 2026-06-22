import { isNative } from "./platform";

// Google's official test rewarded ad unit IDs.
// Replace with your real AdMob Rewarded Ad Unit when ready.
const TEST_REWARDED_ANDROID = "ca-app-pub-3940256099942544/5224354917";
const TEST_REWARDED_IOS = "ca-app-pub-3940256099942544/1712485313";

let initialized = false;

async function ensureInit() {
  if (initialized || !isNative()) return;
  const { AdMob } = await import("@capacitor-community/admob");
  await AdMob.initialize({
    initializeForTesting: true,
  });
  initialized = true;
}

/**
 * Loads and shows a real AdMob Rewarded ad on native platforms.
 * Resolves true when the user earned the reward, false otherwise.
 * Throws on the web — callers should fall back to the simulated VideoAdModal.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!isNative()) throw new Error("Rewarded ads only available on native");
  await ensureInit();
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
    (typeof navigator !== "undefined" &&
      navigator.userAgent.toLowerCase().includes("iphone"))
      ? TEST_REWARDED_IOS
      : TEST_REWARDED_ANDROID;

  await AdMob.prepareRewardVideoAd({ adId });
  const reward = await AdMob.showRewardVideoAd();
  // showRewardVideoAd resolves with AdMobRewardItem when the user earned it.
  return !!reward && typeof reward.amount === "number";
}
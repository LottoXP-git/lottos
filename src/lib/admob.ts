import { isNative } from "./platform";

let initialized = false;

export async function ensureAdMobInit() {
  if (initialized || !isNative()) return;
  const { AdMob } = await import("@capacitor-community/admob");
  await AdMob.initialize({
    initializeForTesting: true,
  });
  initialized = true;
}

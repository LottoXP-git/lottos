import { useEffect } from "react";
import { isNative } from "@/lib/platform";

/**
 * Installs global listeners that publish two CSS variables on <html>:
 *   --admob-banner-h : current AdMob banner height (px)
 *   --keyboard-h     : current soft-keyboard height (px)
 *
 * Components can then reserve space with
 *   padding-bottom: calc(env(safe-area-inset-bottom) + var(--admob-banner-h,0px) + var(--keyboard-h,0px) + 0.5rem)
 * and shrink their max-height with
 *   max-height: calc(95vh - var(--keyboard-h,0px))
 * to avoid overlap when the ad loads or the keyboard opens.
 *
 * No-op on web.
 */
let installed = false;

function setVar(name: string, px: number) {
  document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(px))}px`);
}

async function install() {
  if (installed) return;
  installed = true;
  setVar("--admob-banner-h", 0);
  setVar("--keyboard-h", 0);

  // AdMob banner height (adaptive banner varies by device/orientation).
  try {
    const { AdMob, BannerAdPluginEvents } = await import("@capacitor-community/admob");
    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: { width: number; height: number }) => {
      setVar("--admob-banner-h", info?.height ?? 0);
    });
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      /* size event fires alongside; nothing to do */
    });
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => setVar("--admob-banner-h", 0));
  } catch (err) {
    console.warn("AdMob banner listeners unavailable:", err);
  }

  // Soft keyboard height.
  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    Keyboard.addListener("keyboardWillShow", (info) => setVar("--keyboard-h", info.keyboardHeight));
    Keyboard.addListener("keyboardDidShow", (info) => setVar("--keyboard-h", info.keyboardHeight));
    Keyboard.addListener("keyboardWillHide", () => setVar("--keyboard-h", 0));
    Keyboard.addListener("keyboardDidHide", () => setVar("--keyboard-h", 0));
  } catch (err) {
    console.warn("Keyboard listeners unavailable:", err);
  }
}

export function useNativeInsets() {
  useEffect(() => {
    if (!isNative()) return;
    void install();
  }, []);
}

import { Capacitor } from "@capacitor/core";

/** True quando o app roda dentro do wrapper nativo iOS (Capacitor). */
export function isNativeIOS(): boolean {
  try {
    return Capacitor.getPlatform() === "ios" && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True quando o app roda dentro do wrapper nativo Android (Capacitor). */
export function isNativeAndroid(): boolean {
  try {
    return Capacitor.getPlatform() === "android" && Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** True para qualquer plataforma nativa (Capacitor). */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

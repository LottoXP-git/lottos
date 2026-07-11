import { Capacitor } from "@capacitor/core";

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export type NativeShareOutcome = "shared" | "aborted" | "error";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Writes a Blob/File to the app cache and opens the native share sheet
 * with the file attached. Works on Android/iOS via Capacitor.
 */
export async function shareImageNative(
  file: File | Blob,
  caption: string,
  title = "Compartilhar",
): Promise<NativeShareOutcome> {
  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");

    const name =
      (file as File).name && (file as File).name.length > 0
        ? (file as File).name
        : `lottos-${Date.now()}.png`;

    const data = await blobToBase64(file);
    await Filesystem.writeFile({
      path: name,
      data,
      directory: Directory.Cache,
    });
    const { uri } = await Filesystem.getUri({
      path: name,
      directory: Directory.Cache,
    });

    await Share.share({
      title,
      text: caption,
      url: uri,
      dialogTitle: title,
    });
    return "shared";
  } catch (err) {
    const msg = (err as Error)?.message ?? "";
    if (/cancel|abort|dismiss/i.test(msg)) return "aborted";
    console.error("[nativeShare] failed", err);
    return "error";
  }
}

/** Save a Blob/File to the device's Documents dir on native. */
export async function saveImageNative(file: File | Blob): Promise<boolean> {
  try {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const name =
      (file as File).name && (file as File).name.length > 0
        ? (file as File).name
        : `lottos-${Date.now()}.png`;
    const data = await blobToBase64(file);
    await Filesystem.writeFile({
      path: name,
      data,
      directory: Directory.Documents,
    });
    return true;
  } catch (err) {
    console.error("[saveImageNative] failed", err);
    return false;
  }
}

export async function shareTextNative(
  text: string,
  url?: string,
): Promise<NativeShareOutcome> {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ text, url, dialogTitle: "Compartilhar" });
    return "shared";
  } catch (err) {
    const msg = (err as Error)?.message ?? "";
    if (/cancel|abort|dismiss/i.test(msg)) return "aborted";
    return "error";
  }
}
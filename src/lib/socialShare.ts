/**
 * Helpers to share text/image content directly to WhatsApp and Instagram.
 *
 * WhatsApp: `wa.me/?text=` opens the chat picker with the caption prefilled.
 *   For images we prefer the Web Share API (user picks WhatsApp from the
 *   sheet) and fall back to downloading + opening wa.me with the caption.
 *
 * Instagram: has no public deep-link for prefilled captions on the web.
 *   We copy the caption to the clipboard, try the native share sheet with
 *   the image (user picks Instagram), and fall back to downloading + opening
 *   the Instagram app / site so the user can paste the caption.
 */

export type SocialShareOutcome = "shared" | "aborted" | "fallback" | "error";

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function canShareFiles(file: File) {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData & { files?: File[] }) => boolean;
  };
  return (
    typeof nav.share === "function" &&
    typeof nav.canShare === "function" &&
    nav.canShare({ files: [file] })
  );
}

/** Share a text (optionally with URL) directly on WhatsApp. */
export function shareTextToWhatsApp(text: string, url?: string) {
  const message = url ? `${text}\n\n${url}` : text;
  openExternal(`https://wa.me/?text=${encodeURIComponent(message)}`);
}

/**
 * Share an image + caption to WhatsApp. Prefers the native share sheet
 * (so the user can pick a WhatsApp contact directly with the media
 * attached). If sharing files isn't available, downloads the image and
 * opens wa.me with the caption so the user can attach it manually.
 */
export async function shareImageToWhatsApp(
  file: File,
  caption: string,
): Promise<SocialShareOutcome> {
  if (canShareFiles(file)) {
    try {
      await (navigator as Navigator).share({
        files: [file],
        text: caption,
      } as ShareData & { files: File[] });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "aborted";
      // fall through to fallback
    }
  }
  downloadFile(file);
  await copyToClipboard(caption);
  openExternal(`https://wa.me/?text=${encodeURIComponent(caption)}`);
  return "fallback";
}

/**
 * Share an image + caption to Instagram. Copies the caption to the
 * clipboard, tries the native share sheet with the image, and finally
 * falls back to downloading + opening Instagram.
 */
export async function shareImageToInstagram(
  file: File,
  caption: string,
): Promise<SocialShareOutcome> {
  await copyToClipboard(caption);
  if (canShareFiles(file)) {
    try {
      await (navigator as Navigator).share({
        files: [file],
        text: caption,
      } as ShareData & { files: File[] });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "aborted";
    }
  }
  downloadFile(file);
  openExternal("https://www.instagram.com/");
  return "fallback";
}

/** Copy text and open Instagram (no image variant). */
export async function shareTextToInstagram(text: string) {
  await copyToClipboard(text);
  openExternal("https://www.instagram.com/");
}

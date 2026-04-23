import { useEffect } from "react";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2147498950861352";

/**
 * Injects the Google AdSense script into <head> only on pages with substantial
 * content. The script is loaded once per session — subsequent mounts reuse the
 * existing tag. We never remove it on unmount because AdSense becomes unstable
 * if the script is repeatedly added/removed during SPA navigation.
 */
export function useAdSenseScript() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[src^="${ADSENSE_SRC.split("?")[0]}"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-ad-client", "ca-pub-2147498950861352");
    document.head.appendChild(script);
  }, []);
}
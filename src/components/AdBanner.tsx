import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AdFormat = "leaderboard" | "inline" | "sidebar" | "interstitial";

interface AdBannerProps {
  format?: AdFormat;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const adSlotConfig: Record<AdFormat, { slot: string; format: string; style: React.CSSProperties }> = {
  leaderboard: {
    slot: "auto",
    format: "auto",
    style: { display: "block", minHeight: 45 },
  },
  inline: {
    slot: "auto",
    format: "fluid",
    style: { display: "block", minHeight: 50 },
  },
  sidebar: {
    slot: "auto",
    format: "auto",
    style: { display: "block", minHeight: 125 },
  },
  interstitial: {
    slot: "auto",
    format: "fluid",
    style: { display: "block", minHeight: 50 },
  },
};

export function AdBanner({ format = "leaderboard", className }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, []);

  const config = adSlotConfig[format];

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={config.style}
        data-ad-client="ca-pub-2147498950861352"
        data-ad-format={config.format}
        data-full-width-responsive="true"
      />
      <p className="text-[9px] text-muted-foreground/50 text-right uppercase tracking-wider mt-0.5">
        Anúncio
      </p>
    </div>
  );
}

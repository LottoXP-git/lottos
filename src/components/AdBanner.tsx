import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { isNativeIOS } from "@/lib/platform";

type AdFormat = "leaderboard" | "inline" | "sidebar" | "interstitial";

interface AdBannerProps {
  format?: AdFormat;
  className?: string;
  /** AdSense ad slot ID. Defaults to "auto" for responsive units. */
  slot?: string;
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

export function AdBanner({ format = "leaderboard", className, slot }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const impressionTracked = useRef(false);

  const config = adSlotConfig[format];
  const adSlot = slot ?? config.slot;

  // App Store compliance: AdSense em WebView viola a política do AdSense e
  // costuma causar rejeição na revisão da Apple. Esconder no iOS nativo até
  // integrarmos o SDK nativo (AdMob) numa próxima fase.
  const skipRender = isNativeIOS();

  useEffect(() => {
    if (skipRender) return;
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error("AdSense push error:", e);
    }
  }, [skipRender]);

  // Track impression when 50% of the ad is visible for >=1s
  useEffect(() => {
    if (skipRender) return;
    const el = adRef.current;
    if (!el || impressionTracked.current) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            timer = window.setTimeout(() => {
              if (impressionTracked.current) return;
              impressionTracked.current = true;
              supabase
                .from("ad_events")
                .insert({
                  slot: adSlot,
                  event_type: "impression",
                  page: window.location.pathname,
                  format,
                  user_agent: navigator.userAgent.slice(0, 255),
                })
                .then(({ error }) => {
                  if (error) console.warn("ad impression track failed", error.message);
                });
              observer.disconnect();
            }, 1000);
          } else if (timer) {
            window.clearTimeout(timer);
            timer = undefined;
          }
        });
      },
      { threshold: [0, 0.5, 1] },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [adSlot, format, skipRender]);

  // Track click on the ad container (best-effort: AdSense iframe steals real clicks,
  // so we listen for pointerdown — a strong signal the user engaged the ad area).
  const handlePointerDown = () => {
    supabase
      .from("ad_events")
      .insert({
        slot: adSlot,
        event_type: "click",
        page: window.location.pathname,
        format,
        user_agent: navigator.userAgent.slice(0, 255),
      })
      .then(({ error }) => {
        if (error) console.warn("ad click track failed", error.message);
      });
  };

  if (skipRender) return null;

  return (
    <div
      className={cn("w-full overflow-hidden animate-fade-in", className)}
      onPointerDown={handlePointerDown}
    >
      <ins
        className="adsbygoogle block animate-fade-in"
        ref={adRef}
        style={config.style}
        data-ad-client="ca-pub-2147498950861352"
        data-ad-slot={adSlot}
        data-ad-format={config.format}
        data-full-width-responsive="true"
      />
      <p className="text-[9px] text-muted-foreground/50 text-right uppercase tracking-wider mt-0.5">
        Anúncio
      </p>
    </div>
  );
}

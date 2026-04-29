import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminPassword = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");
    if (!adminPassword) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const provided =
      req.headers.get("x-admin-password") ??
      (await req.json().catch(() => ({}))).password;

    if (!provided || provided !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pull last 90 days of events (cap 50k for safety)
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: events, error } = await supabase
      .from("ad_events")
      .select("slot, event_type, page, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50000);

    if (error) throw error;

    // Aggregate by slot
    const bySlot: Record<
      string,
      { slot: string; impressions: number; clicks: number; ctr: number; pages: Record<string, { impressions: number; clicks: number }> }
    > = {};

    // Time-series for the focus slot
    const focusSlot = "8331815579";
    const dailyFocus: Record<string, { impressions: number; clicks: number }> = {};

    let totalImpressions = 0;
    let totalClicks = 0;

    for (const e of events ?? []) {
      const slot = e.slot ?? "unknown";
      bySlot[slot] ??= { slot, impressions: 0, clicks: 0, ctr: 0, pages: {} };
      const page = e.page ?? "/";
      bySlot[slot].pages[page] ??= { impressions: 0, clicks: 0 };

      if (e.event_type === "impression") {
        bySlot[slot].impressions++;
        bySlot[slot].pages[page].impressions++;
        totalImpressions++;
      } else if (e.event_type === "click") {
        bySlot[slot].clicks++;
        bySlot[slot].pages[page].clicks++;
        totalClicks++;
      }

      if (slot === focusSlot) {
        const day = (e.created_at as string).slice(0, 10);
        dailyFocus[day] ??= { impressions: 0, clicks: 0 };
        if (e.event_type === "impression") dailyFocus[day].impressions++;
        else if (e.event_type === "click") dailyFocus[day].clicks++;
      }
    }

    const slots = Object.values(bySlot).map((s) => ({
      ...s,
      ctr: s.impressions > 0 ? (s.clicks / s.impressions) * 100 : 0,
      pages: Object.entries(s.pages)
        .map(([page, v]) => ({
          page,
          ...v,
          ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
        }))
        .sort((a, b) => b.impressions - a.impressions),
    })).sort((a, b) => b.impressions - a.impressions);

    const focus = bySlot[focusSlot]
      ? {
          slot: focusSlot,
          impressions: bySlot[focusSlot].impressions,
          clicks: bySlot[focusSlot].clicks,
          ctr:
            bySlot[focusSlot].impressions > 0
              ? (bySlot[focusSlot].clicks / bySlot[focusSlot].impressions) * 100
              : 0,
          daily: Object.entries(dailyFocus)
            .map(([date, v]) => ({
              date,
              ...v,
              ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          pages:
            slots.find((s) => s.slot === focusSlot)?.pages ?? [],
        }
      : { slot: focusSlot, impressions: 0, clicks: 0, ctr: 0, daily: [], pages: [] };

    return new Response(
      JSON.stringify({
        totals: { impressions: totalImpressions, clicks: totalClicks, ctr: totalImpressions ? (totalClicks / totalImpressions) * 100 : 0 },
        slots,
        focus,
        windowDays: 90,
        sampleSize: events?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("admin-ad-metrics error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

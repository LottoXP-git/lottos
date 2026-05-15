import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password, x-admin-token",
};

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function issueToken(secret: string): Promise<string> {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `admin.${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(secret, `admin.${expStr}`);
  // constant-time-ish compare
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return mismatch === 0;
}

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

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const providedPwd =
      req.headers.get("x-admin-password") ?? (body as { password?: string }).password;
    const providedToken =
      req.headers.get("x-admin-token") ?? (body as { token?: string }).token;

    let authed = false;
    let issuedToken: string | null = null;

    if (providedToken && (await verifyToken(adminPassword, providedToken))) {
      authed = true;
    } else if (providedPwd && providedPwd === adminPassword) {
      authed = true;
      issuedToken = await issueToken(adminPassword);
    }

    if (!authed) {
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
        token: issuedToken,
        tokenTtlMs: issuedToken ? TOKEN_TTL_MS : undefined,
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

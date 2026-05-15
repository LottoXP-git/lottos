import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";

// Simple in-memory rate limiter (per-instance, best-effort).
// Limits sync attempts per IP to prevent CRM flooding from anonymous callers.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateBuckets = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  arr.push(now);
  rateBuckets.set(ip, arr);
  return arr.length > RATE_LIMIT_MAX;
}

function splitName(fullName: string): { firstname: string; lastname: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

function validateEmail(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== "string") return null;
  const email = b.email.toLowerCase().trim();
  if (!email.includes("@") || email.length > 255) return null;
  return email;
}

async function hubspotFetch(
  path: string,
  init: RequestInit,
  lovableKey: string,
  hubspotKey: string,
) {
  return await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": hubspotKey,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
    if (!HUBSPOT_API_KEY) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    const rawBody = await req.json().catch(() => null);
    const email = validateEmail(rawBody);
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Look up the registration server-side using the service role.
    // This prevents anonymous callers from injecting arbitrary data into
    // HubSpot — they can only trigger a sync for a record that already
    // exists in our database.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: reg, error: regError } = await supabase
      .from("user_registrations")
      .select(
        "full_name, email, phone, birth_date, favorite_lotteries, accept_whatsapp_marketing, accept_email_marketing",
      )
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ success: false, error: "Registration not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { firstname, lastname } = splitName(reg.full_name);

    const properties: Record<string, string> = {
      email: reg.email,
      firstname,
      lastname,
      phone: reg.phone,
      date_of_birth: reg.birth_date,
      favorite_lotteries: (reg.favorite_lotteries ?? []).join(", "),
      whatsapp_marketing_opt_in: reg.accept_whatsapp_marketing ? "true" : "false",
      email_marketing_opt_in: reg.accept_email_marketing ? "true" : "false",
      lead_source: "Lottos App",
    };

    // Try to upsert by email using PATCH with idProperty=email.
    // If the contact does not exist, HubSpot returns 404 — then create it.
    const encodedEmail = encodeURIComponent(reg.email);
    let response = await hubspotFetch(
      `/crm/v3/objects/contacts/${encodedEmail}?idProperty=email`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      },
      LOVABLE_API_KEY,
      HUBSPOT_API_KEY,
    );

    if (response.status === 404) {
      response = await hubspotFetch(
        `/crm/v3/objects/contacts`,
        {
          method: "POST",
          body: JSON.stringify({ properties }),
        },
        LOVABLE_API_KEY,
        HUBSPOT_API_KEY,
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("HubSpot error", response.status, data);
      return new Response(
        JSON.stringify({
          success: false,
          error: `HubSpot API failed [${response.status}]`,
          details: data,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("HubSpot contact synced:", data?.id || "(no id)");

    return new Response(
      JSON.stringify({ success: true, contactId: data?.id ?? null }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("sync-hubspot-contact error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
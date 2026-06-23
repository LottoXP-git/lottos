import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 180 days — token lifetime for the signed age-verification cookie/token.
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 180;

function b64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return b64url(new Uint8Array(sig));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("AGE_GATE_SECRET");
    if (!secret) {
      // Do not leak which env var is missing.
      return new Response(
        JSON.stringify({ success: false, error: "Service unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null) as { birthYear?: unknown } | null;
    const birthYear = typeof body?.birthYear === "number"
      ? body!.birthYear
      : typeof body?.birthYear === "string"
        ? parseInt(body!.birthYear as string, 10)
        : NaN;

    const currentYear = new Date().getUTCFullYear();
    if (!Number.isFinite(birthYear) || birthYear < 1900 || birthYear > currentYear) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid birth year" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const age = currentYear - birthYear;
    if (age < 18) {
      return new Response(
        JSON.stringify({ success: false, error: "Underage" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const payload = { v: 1, exp: expiresAt };
    const payloadStr = b64url(new TextEncoder().encode(JSON.stringify(payload)));
    const sig = await hmacSign(secret, payloadStr);
    const token = `${payloadStr}.${sig}`;

    return new Response(
      JSON.stringify({ success: true, token, expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_error) {
    // Generic message — never leak internal details.
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
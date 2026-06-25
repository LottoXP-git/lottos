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

function b64urlDecodeToBytes(s: string): Uint8Array | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

async function verifyToken(secret: string, token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadStr, sig] = parts;
  if (!payloadStr || !sig) return false;
  const expected = await hmacSign(secret, payloadStr);
  if (!timingSafeEqual(sig, expected)) return false;
  const decoded = b64urlDecodeToBytes(payloadStr);
  if (!decoded) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(decoded)) as { v?: number; exp?: number };
    if (payload.v !== 1) return false;
    if (typeof payload.exp !== "number") return false;
    if (payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
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

    const body = await req.json().catch(() => null) as
      | { action?: string; token?: unknown; birthDate?: unknown }
      | null;

    // --- Server-side token verification action ---
    if (body?.action === "verify") {
      const token = typeof body.token === "string" ? body.token : "";
      const valid = token ? await verifyToken(secret, token) : false;
      return new Response(
        JSON.stringify({ valid }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Issue a new token (requires a full birth date) ---
    const birthDateStr = typeof body?.birthDate === "string" ? body.birthDate.trim() : "";
    // Strict YYYY-MM-DD format.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid birth date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const [y, m, d] = birthDateStr.split("-").map((n) => parseInt(n, 10));
    const birthDate = new Date(Date.UTC(y, m - 1, d));
    if (
      !Number.isFinite(birthDate.getTime()) ||
      birthDate.getUTCFullYear() !== y ||
      birthDate.getUTCMonth() !== m - 1 ||
      birthDate.getUTCDate() !== d ||
      y < 1900
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid birth date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const today = new Date();
    const age18 = new Date(Date.UTC(y + 18, m - 1, d));
    if (age18.getTime() > today.getTime()) {
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
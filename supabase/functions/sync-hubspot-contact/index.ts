import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";

interface ContactPayload {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string; // yyyy-MM-dd
  favoriteLotteries: string[];
  acceptWhatsapp: boolean;
  acceptEmail: boolean;
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

function validatePayload(body: unknown): ContactPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.fullName !== "string" ||
    typeof b.email !== "string" ||
    typeof b.phone !== "string" ||
    typeof b.birthDate !== "string" ||
    !Array.isArray(b.favoriteLotteries) ||
    typeof b.acceptWhatsapp !== "boolean" ||
    typeof b.acceptEmail !== "boolean"
  ) {
    return null;
  }
  if (!b.email.includes("@")) return null;
  if (b.fullName.trim().length < 3) return null;
  return {
    fullName: b.fullName,
    email: b.email.toLowerCase().trim(),
    phone: b.phone,
    birthDate: b.birthDate,
    favoriteLotteries: b.favoriteLotteries as string[],
    acceptWhatsapp: b.acceptWhatsapp,
    acceptEmail: b.acceptEmail,
  };
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
    if (!HUBSPOT_API_KEY) {
      throw new Error("HUBSPOT_API_KEY is not configured");
    }

    const rawBody = await req.json().catch(() => null);
    const payload = validatePayload(rawBody);
    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { firstname, lastname } = splitName(payload.fullName);

    // HubSpot accepts a semicolon-separated string for multi-checkbox
    // properties; for plain text properties, a comma-separated list also
    // works. We'll send a comma-separated list which works as plain text
    // even if the property is created automatically.
    const properties: Record<string, string> = {
      email: payload.email,
      firstname,
      lastname,
      phone: payload.phone,
      date_of_birth: payload.birthDate,
      favorite_lotteries: payload.favoriteLotteries.join(", "),
      whatsapp_marketing_opt_in: payload.acceptWhatsapp ? "true" : "false",
      email_marketing_opt_in: payload.acceptEmail ? "true" : "false",
      lead_source: "Lottos App",
    };

    // Try to upsert by email using PATCH with idProperty=email.
    // If the contact does not exist, HubSpot returns 404 — then create it.
    const encodedEmail = encodeURIComponent(payload.email);
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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-password",
};

function isValidVersion(v: unknown): v is string {
  return typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v);
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
      req.headers.get("x-admin-password") ??
      (body as { password?: string }).password;

    if (!providedPwd || providedPwd !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { latest_version_name, min_version_name, force_update } = body as {
      latest_version_name?: string;
      min_version_name?: string;
      force_update?: boolean;
    };

    if (!isValidVersion(latest_version_name)) {
      return new Response(
        JSON.stringify({ error: "latest_version_name inválido (esperado X.Y.Z)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (min_version_name !== undefined && !isValidVersion(min_version_name)) {
      return new Response(
        JSON.stringify({ error: "min_version_name inválido (esperado X.Y.Z)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pega a linha mais recente; se não existir, cria uma.
    const { data: existing } = await supabase
      .from("app_version_config")
      .select("id")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const patch: Record<string, unknown> = {
      latest_version_name,
      updated_at: new Date().toISOString(),
    };
    if (min_version_name) patch.min_version_name = min_version_name;
    if (typeof force_update === "boolean") patch.force_update = force_update;

    if (existing?.id) {
      const { error } = await supabase
        .from("app_version_config")
        .update(patch)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("app_version_config")
        .insert({
          latest_version_name,
          min_version_name: min_version_name ?? latest_version_name,
          force_update: force_update ?? false,
        });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, latest_version_name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("update-app-version error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
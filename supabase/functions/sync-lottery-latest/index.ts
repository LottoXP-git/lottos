import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Cron-invoked function that fetches the latest draw of every lottery from
 * the official Caixa API (with heroku fallback) and upserts the result into
 * `public.lottery_latest` — but ONLY when the concurso has actually changed.
 *
 * The frontend subscribes to Realtime on that table, so any new draw
 * propagates to every connected client within seconds.
 */

type Cfg = { id: string; name: string; apiName: string; herokuName: string };

const LOTTERIES: Cfg[] = [
  { id: "megasena", name: "Mega-Sena", apiName: "megasena", herokuName: "megasena" },
  { id: "lotofacil", name: "Lotofácil", apiName: "lotofacil", herokuName: "lotofacil" },
  { id: "quina", name: "Quina", apiName: "quina", herokuName: "quina" },
  { id: "lotomania", name: "Lotomania", apiName: "lotomania", herokuName: "lotomania" },
  { id: "duplasena", name: "Dupla Sena", apiName: "duplasena", herokuName: "duplasena" },
  { id: "diadesorte", name: "Dia de Sorte", apiName: "diadesorte", herokuName: "diadesorte" },
  { id: "supersete", name: "Super Sete", apiName: "supersete", herokuName: "supersete" },
  { id: "maismilionaria", name: "+Milionária", apiName: "maismilionaria", herokuName: "maismilionaria" },
  { id: "timemania", name: "Timemania", apiName: "timemania", herokuName: "timemania" },
  { id: "federal", name: "Federal", apiName: "federal", herokuName: "federal" },
  { id: "loteca", name: "Loteca", apiName: "loteca", herokuName: "loteca" },
];

const CAIXA = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const HEROKU = "https://loteriascaixa-api.herokuapp.com/api";

async function fetchLatest(cfg: Cfg): Promise<{ concurso: number; source: "caixa" | "heroku"; data: unknown } | null> {
  // Try official Caixa first
  try {
    const r = await fetch(`${CAIXA}/${cfg.apiName}?_=${Date.now()}`, {
      headers: { accept: "application/json" },
    });
    if (r.ok) {
      const data = await r.json();
      const concurso: number = data?.numero ?? 0;
      if (concurso > 0) return { concurso, source: "caixa", data };
    }
  } catch (_err) {
    // fall through to heroku
  }

  // Fallback: heroku mirror (usually 1 day behind)
  try {
    const r = await fetch(`${HEROKU}/${cfg.herokuName}/latest`);
    if (r.ok) {
      const data = await r.json();
      const concurso: number = data?.concurso ?? 0;
      if (concurso > 0) return { concurso, source: "heroku", data };
    }
  } catch (_err) {
    // give up
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Existing row per lottery (only id + concurso)
  const { data: existing } = await admin
    .from("lottery_latest")
    .select("id, concurso");
  const currentMap = new Map<string, number>();
  for (const row of existing ?? []) currentMap.set(row.id, row.concurso);

  const updated: string[] = [];
  const skipped: string[] = [];

  const results = await Promise.all(LOTTERIES.map((cfg) => fetchLatest(cfg)));

  for (let i = 0; i < LOTTERIES.length; i++) {
    const cfg = LOTTERIES[i];
    const res = results[i];
    if (!res) {
      skipped.push(`${cfg.id}:no-data`);
      continue;
    }
    const prev = currentMap.get(cfg.id) ?? 0;
    if (res.concurso <= prev) {
      skipped.push(`${cfg.id}:${res.concurso}<=prev${prev}`);
      continue;
    }
    const { error } = await admin.from("lottery_latest").upsert({
      id: cfg.id,
      concurso: res.concurso,
      payload: res.data as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(`[sync] upsert ${cfg.id} failed:`, error.message);
      skipped.push(`${cfg.id}:upsert-error`);
      continue;
    }
    updated.push(`${cfg.id}#${res.concurso}(${res.source})`);
    console.log(`[sync] ${cfg.id}: ${prev} -> ${res.concurso} via ${res.source}`);
  }

  return new Response(
    JSON.stringify({ ok: true, updated, skipped, at: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
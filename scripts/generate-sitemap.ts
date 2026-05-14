/**
 * Generates public/sitemap.xml at build time.
 *
 * Strategy:
 * 1. Static routes (home, history, statistics, legal pages).
 * 2. For each lottery modality, fetch the latest concurso from the public
 *    Caixa API and emit the last N concursos as individual URLs so each
 *    /:lotteryId/:concurso page is discoverable by Google.
 * 3. If the network fails (offline build, blocked), the script falls back
 *    to a hard-coded floor concurso so the sitemap is still useful.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://grupolottoxp.com";
const HISTORY_DEPTH = 50; // pages per modality

interface Modality {
  id: string;
  apiName: string;
  fallbackConcurso: number;
}

const MODALITIES: Modality[] = [
  { id: "megasena", apiName: "megasena", fallbackConcurso: 2789 },
  { id: "lotofacil", apiName: "lotofacil", fallbackConcurso: 3245 },
  { id: "quina", apiName: "quina", fallbackConcurso: 6567 },
  { id: "lotomania", apiName: "lotomania", fallbackConcurso: 2589 },
  { id: "duplasena", apiName: "duplasena", fallbackConcurso: 2678 },
  { id: "diadesorte", apiName: "diadesorte", fallbackConcurso: 1172 },
  { id: "supersete", apiName: "supersete", fallbackConcurso: 807 },
  { id: "maismilionaria", apiName: "maismilionaria", fallbackConcurso: 326 },
  { id: "timemania", apiName: "timemania", fallbackConcurso: 2178 },
  { id: "federal", apiName: "federal", fallbackConcurso: 5890 },
  { id: "loteca", apiName: "loteca", fallbackConcurso: 1236 },
];

interface SitemapEntry {
  loc: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { loc: `${BASE_URL}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${BASE_URL}/historico`, changefreq: "daily", priority: "0.8" },
  { loc: `${BASE_URL}/estatisticas`, changefreq: "weekly", priority: "0.8" },
  { loc: `${BASE_URL}/privacidade`, changefreq: "yearly", priority: "0.3" },
  { loc: `${BASE_URL}/termos`, changefreq: "yearly", priority: "0.3" },
];

async function fetchLatestConcurso(m: Modality): Promise<number> {
  try {
    const res = await fetch(
      `https://servicebus2.caixa.gov.br/portaldeloterias/api/${m.apiName}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (compatible; GrupoLottoXPSitemapBot/1.0; +https://grupolottoxp.com)",
          Referer: "https://loterias.caixa.gov.br/",
        },
      },
    );
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { numero?: number };
    if (typeof data.numero === "number" && data.numero > 0) return data.numero;
    throw new Error("no numero");
  } catch (err) {
    console.warn(
      `[sitemap] ${m.id}: failed to fetch latest concurso (${(err as Error).message}), using fallback ${m.fallbackConcurso}`,
    );
    return m.fallbackConcurso;
  }
}

function urlToXml(e: SitemapEntry): string {
  const lines = [
    "  <url>",
    `    <loc>${e.loc}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ].filter(Boolean);
  return lines.join("\n");
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  const drawEntries: SitemapEntry[] = [];
  for (const m of MODALITIES) {
    const latest = await fetchLatestConcurso(m);
    const start = Math.max(1, latest - HISTORY_DEPTH + 1);
    for (let n = latest; n >= start; n--) {
      drawEntries.push({
        loc: `${BASE_URL}/${m.id}/${n}`,
        changefreq: n === latest ? "daily" : "yearly",
        priority: n === latest ? "0.7" : "0.4",
        lastmod: n === latest ? today : undefined,
      });
    }
  }

  const all = [...STATIC_ENTRIES, ...drawEntries];
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...all.map(urlToXml),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(
    `[sitemap] wrote ${all.length} entries (${STATIC_ENTRIES.length} static + ${drawEntries.length} draws)`,
  );
}

main().catch((err) => {
  console.error("[sitemap] failed:", err);
  process.exit(1);
});
#!/usr/bin/env node
/**
 * Lottos — build web + validações + npx cap sync android em um único comando.
 * Multiplataforma (Windows / macOS / Linux).
 *
 * Uso: npm run sync:android
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const step = (m) => console.log(`\n\x1b[36m${m}\x1b[0m`);
const ok = (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`);
const fail = (m) => {
  console.error(`\n\x1b[31m❌ ERRO: ${m}\x1b[0m\n`);
  process.exit(1);
};

const run = (cmd) => {
  try {
    execSync(cmd, { stdio: "inherit", shell: true });
  } catch {
    fail(`Falha ao executar: ${cmd}`);
  }
};

console.log("=========================================");
console.log("  Lottos - Build + Sync Android");
console.log("=========================================");

// 1. capacitor.config.ts não pode ter server.url ativo
step("[1/4] Validando capacitor.config.ts...");
if (!existsSync("capacitor.config.ts")) fail("capacitor.config.ts não encontrado.");
const capLines = readFileSync("capacitor.config.ts", "utf8").split(/\r?\n/);
const offending = capLines.filter((l) => /^\s*url\s*:/.test(l) && !/^\s*\/\//.test(l));
if (offending.length) {
  console.error("Linhas suspeitas:");
  offending.forEach((l) => console.error(`  ${l}`));
  fail("Remova o bloco 'server: { url: ... }' antes de buildar para release.");
}
ok("capacitor.config.ts OK (sem server.url).");

// 2. Build web
step("[2/4] Buildando o projeto web...");
run("npm run build");

// 3. Validação do dist/
step("[3/4] Validando saída do build web...");
if (!existsSync("dist")) fail("Pasta 'dist/' não foi gerada pelo build.");
if (!existsSync("dist/index.html")) fail("'dist/index.html' não encontrado.");
const html = readFileSync("dist/index.html", "utf8");
const remote = /(src|href)="https?:\/\/[^"]*\.(lovable\.app|lovableproject\.com|lovable\.dev)/g;
const hits = html.match(remote);
if (hits) {
  console.error("Referências remotas encontradas:");
  hits.forEach((h) => console.error(`  ${h}`));
  fail("dist/index.html referencia domínios Lovable remotos (quebraria offline).");
}
ok("dist/ validado (index.html presente, sem URLs remotas).");

// 4. Sync Capacitor
step("[4/4] Sincronizando com Capacitor (android)...");
run("npx cap sync android");
const synced = "android/app/src/main/assets/public/index.html";
if (!existsSync(synced)) fail(`'${synced}' não foi gerado pelo 'npx cap sync'.`);
ok(`Assets nativos sincronizados (${synced}).`);

console.log("\n=========================================");
console.log("\x1b[32m  Sync concluído com sucesso!\x1b[0m");
console.log("  Próximo passo (AAB assinado):");
console.log("    npm run build:android:checked      (bash)");
console.log("    npm run build:android:checked:win  (Windows)");
console.log("=========================================\n");

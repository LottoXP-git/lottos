// =========================================================
//  Lottos - Publica a versionName do AAB no backend
// =========================================================
// Lê versionName direto do app-release.aab e chama a edge
// function `update-app-version` para atualizar a linha em
// `app_version_config`. Depois disso, o UpdateAvailableBanner
// mostra a nova versão aos usuários que abrirem o app.
//
// Uso:
//   ADMIN_DASHBOARD_PASSWORD=xxx node scripts/publish-app-version.mjs [caminho/aab]
//   npm run publish:version
//
// Requer:
//   - .env com VITE_SUPABASE_URL
//   - variável de ambiente ADMIN_DASHBOARD_PASSWORD (mesma senha do painel admin)
//
// Opções (env):
//   MIN_VERSION_NAME=1.4.0   -> também atualiza min_version_name (force update)
//   FORCE_UPDATE=true        -> também liga force_update

import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const DEFAULT_AAB = 'android/app/build/outputs/bundle/release/app-release.aab';
const aabPath = process.argv[2] || DEFAULT_AAB;

function fail(msg) {
  console.error(`\n[ERRO] ${msg}`);
  process.exit(1);
}

// --- Lê VITE_SUPABASE_URL do .env local -----------------------------
function readEnvValue(key) {
  if (process.env[key]) return process.env[key];
  if (!fs.existsSync('.env')) return null;
  const line = fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : null;
}

const SUPABASE_URL = readEnvValue('VITE_SUPABASE_URL');
const ADMIN_PWD = process.env.ADMIN_DASHBOARD_PASSWORD;

if (!SUPABASE_URL) fail('VITE_SUPABASE_URL não encontrado no .env.');
if (!ADMIN_PWD)
  fail(
    'Variável ADMIN_DASHBOARD_PASSWORD não definida.\n' +
    '  Windows PowerShell: $env:ADMIN_DASHBOARD_PASSWORD="sua-senha"\n' +
    '  Linux/Mac:          export ADMIN_DASHBOARD_PASSWORD=sua-senha',
  );

if (!fs.existsSync(aabPath)) fail(`AAB não encontrado: ${aabPath}`);

// --- Extrai versionName do AAB (mesma lógica do check-aab) ----------
const buf = fs.readFileSync(aabPath);

function extractZipEntry(zip, name) {
  const SIG = 0x04034b50;
  for (let i = 0; i + 30 < zip.length; i++) {
    if (zip.readUInt32LE(i) !== SIG) continue;
    const compMethod = zip.readUInt16LE(i + 8);
    const compSize = zip.readUInt32LE(i + 18);
    const nameLen = zip.readUInt16LE(i + 26);
    const extraLen = zip.readUInt16LE(i + 28);
    const entryName = zip.slice(i + 30, i + 30 + nameLen).toString('utf8');
    if (entryName !== name) continue;
    const dataStart = i + 30 + nameLen + extraLen;
    const data = zip.slice(dataStart, dataStart + compSize);
    if (compMethod === 0) return data;
    if (compMethod === 8) return zlib.inflateRawSync(data);
  }
  return null;
}

function readVarint(b, p) {
  let v = 0, shift = 0, pos = p;
  while (pos < b.length) {
    const byte = b[pos++];
    v |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { value: v, next: pos };
    shift += 7;
    if (shift > 35) break;
  }
  return null;
}

function readStringAt(b, p) {
  if (b[p] !== 0x2a) return null;
  const lv = readVarint(b, p + 1);
  if (!lv) return null;
  return b.slice(lv.next, lv.next + lv.value).toString('utf8');
}

function findAttrValue(b, attrName) {
  const nameBytes = Buffer.from(attrName, 'utf8');
  const pattern = Buffer.concat([Buffer.from([0x22, nameBytes.length]), nameBytes]);
  let from = 0;
  while (from < b.length) {
    const idx = b.indexOf(pattern, from);
    if (idx < 0) return null;
    const val = readStringAt(b, idx + pattern.length);
    if (val !== null && val !== '') return val;
    from = idx + pattern.length;
  }
  return null;
}

const manifest = extractZipEntry(buf, 'base/manifest/AndroidManifest.xml');
if (!manifest) fail('AndroidManifest.xml não encontrado no AAB.');

const versionName = findAttrValue(manifest, 'versionName');
if (!versionName || !/^\d+\.\d+\.\d+$/.test(versionName)) {
  fail(`versionName inválido extraído do AAB: ${versionName}`);
}

const payload = { latest_version_name: versionName };
if (process.env.MIN_VERSION_NAME) payload.min_version_name = process.env.MIN_VERSION_NAME;
if (process.env.FORCE_UPDATE === 'true') payload.force_update = true;
if (process.env.FORCE_UPDATE === 'false') payload.force_update = false;

const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/update-app-version`;

console.log('=========================================');
console.log('  Publicando versão no backend');
console.log('=========================================');
console.log(`AAB:         ${aabPath}`);
console.log(`versionName: ${versionName}`);
if (payload.min_version_name) console.log(`min_version_name (force update): ${payload.min_version_name}`);
if (payload.force_update !== undefined) console.log(`force_update: ${payload.force_update}`);
console.log(`endpoint:    ${endpoint}`);
console.log('');

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-password': ADMIN_PWD,
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
if (!res.ok) {
  fail(`Falha ao publicar versão (HTTP ${res.status}): ${text}`);
}

console.log(`[OK] Versão ${versionName} registrada em app_version_config.`);
console.log('     O UpdateAvailableBanner passará a sinalizar a nova versão.');
console.log('     Resposta:', text);
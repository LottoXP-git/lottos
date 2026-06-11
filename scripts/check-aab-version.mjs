// =========================================================
//  Lottos - Validador de versão do AAB antes do upload
// =========================================================
// Lê versionCode e versionName direto do app-release.aab
// e valida se o versionCode ainda não foi usado em uploads
// anteriores (histórico em android/used-versions.txt).
//
// Uso:
//   node scripts/check-aab-version.mjs [caminho/para/app-release.aab]
//   npm run check:aab
//
// Comportamento:
//   - Falha (exit 1) se versionCode já estiver em used-versions.txt
//   - Caso contrário, registra a entrada e imprime os dados
//
// Implementação: parseia o ZIP do AAB manualmente, extrai
// base/manifest/AndroidManifest.xml (protobuf XmlNode) e
// localiza os atributos por padrão de bytes. Não requer
// bundletool nem dependências externas.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DEFAULT_AAB = 'android/app/build/outputs/bundle/release/app-release.aab';
const HISTORY_PATH = 'android/used-versions.txt';

const aabPath = process.argv[2] || DEFAULT_AAB;

function fail(msg) {
  console.error(`\n[ERRO] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(aabPath)) {
  fail(`AAB não encontrado: ${aabPath}\nRode 'npm run build:android' (ou :win) primeiro.`);
}

const buf = fs.readFileSync(aabPath);

// --- Extrai um arquivo do ZIP do AAB ------------------------------
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
    throw new Error(`Método de compressão ZIP não suportado: ${compMethod}`);
  }
  return null;
}

const manifest = extractZipEntry(buf, 'base/manifest/AndroidManifest.xml');
if (!manifest) {
  fail('base/manifest/AndroidManifest.xml não encontrado dentro do AAB.');
}

// --- Lê string protobuf (field 5, wire type 2 = tag 0x2A) ---------
function readVarint(b, p) {
  let v = 0, shift = 0, pos = p;
  while (pos < b.length) {
    const byte = b[pos++];
    v |= (byte & 0x7F) << shift;
    if ((byte & 0x80) === 0) return { value: v, next: pos };
    shift += 7;
    if (shift > 35) break;
  }
  return null;
}

function readStringAt(b, p) {
  // Espera 0x2A (field 5 / wire 2) seguido de varint length + bytes
  if (b[p] !== 0x2A) return null;
  const lv = readVarint(b, p + 1);
  if (!lv) return null;
  return b.slice(lv.next, lv.next + lv.value).toString('utf8');
}

function findAttrValue(b, attrName) {
  const nameBytes = Buffer.from(attrName, 'utf8');
  // padrão do nome do atributo: 0x22 (field 4 / wire 2), len (1 byte), bytes
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

const versionCode = findAttrValue(manifest, 'versionCode');
const versionName = findAttrValue(manifest, 'versionName');

if (!versionCode || !versionName) {
  fail(
    `Não foi possível extrair versionCode/versionName do AAB.\n` +
    `  versionCode lido: ${versionCode}\n` +
    `  versionName lido: ${versionName}`
  );
}

console.log('=========================================');
console.log('  Validação de versão do AAB');
console.log('=========================================');
console.log(`AAB:         ${aabPath}`);
console.log(`versionCode: ${versionCode}`);
console.log(`versionName: ${versionName}`);
console.log('');

// --- Checa histórico ----------------------------------------------
let history = [];
if (fs.existsSync(HISTORY_PATH)) {
  history = fs
    .readFileSync(HISTORY_PATH, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

const duplicate = history.find((line) => {
  const [vc] = line.split(/\s+/);
  return vc === String(versionCode);
});

if (duplicate) {
  console.error(`[ERRO] versionCode ${versionCode} JÁ FOI USADO em upload anterior:`);
  console.error(`  ${duplicate}`);
  console.error('');
  console.error('A Play Console vai rejeitar este AAB.');
  console.error('Rode um novo build (que auto-incrementa o versionCode) antes de subir:');
  console.error('  npm run build:android        (Linux/Mac)');
  console.error('  npm run build:android:win    (Windows)');
  process.exit(1);
}

// --- Registra ------------------------------------------------------
const entry = `${versionCode} ${versionName} ${new Date().toISOString()}`;
if (!fs.existsSync(HISTORY_PATH)) {
  fs.writeFileSync(
    HISTORY_PATH,
    `# Histórico de versões de AAB já enviadas à Play Console.\n` +
      `# Formato: <versionCode> <versionName> <timestampISO>\n` +
      `# Mantenha este arquivo versionado (git) para evitar reuso.\n`
  );
}
fs.appendFileSync(HISTORY_PATH, entry + '\n');

console.log(`[OK] versionCode ${versionCode} é novo. Registrado em ${HISTORY_PATH}.`);
console.log('Pode subir o AAB na Play Console com segurança.');
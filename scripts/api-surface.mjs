#!/usr/bin/env node
/**
 * Superficie de API del front: extrae los endpoints que consumen las capas
 * autorizadas a tocar la red (`src/hooks/**` y `src/store/**`) para reconciliar
 * contra el contrato del backend (`Backend-Inmobiliaria/.ai/contracts/api-contract.md`).
 *
 * NO es un gate de CI (el contrato vive en otro repo): es la herramienta del
 * checklist de "coherencia contrato↔front" del workflow. Sin dependencias.
 * El matching es por ENDPOINT (no por query params); usalo como guía, revisá a mano.
 *
 * Uso:
 *   node scripts/api-surface.mjs
 *   node scripts/api-surface.mjs --contract ../Backend-Inmobiliaria/.ai/contracts/api-contract.md
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SCAN_DIRS = ['src/hooks', 'src/store']; // las 2 capas que pueden llamar a api/api.js

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(js|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

/** Normaliza un path a patrón comparable: sin query, sin barra final, param → `:id`. */
function normalize(path) {
  return path
    .split('?')[0] // descarta query string literal
    .replace(/\/\$\{[^}]+\}/g, '/:id') // interpolación de path: /${id} → /:id
    .replace(/\$\{[^}]+\}/g, '') // interpolación pegada (queryString/suffix) → nada
    .replace(/\{[^}]+\}/g, ':id') // estilo contrato: {id} → :id
    .replace(/^\//, '')
    .replace(/\/+$/, '');
}

// --- 1) Endpoints que consume el front (hooks + store) ---
const CALL_RE = /api\.(get|post|put|patch|delete)\(\s*[`"']([^`"']+)/g;
const frontPaths = new Set();
const byKey = new Map(); // "METHOD path" -> Set(files)
for (const file of SCAN_DIRS.flatMap(walk)) {
  const src = readFileSync(file, 'utf8');
  let m;
  while ((m = CALL_RE.exec(src)) !== null) {
    const path = normalize(m[2]);
    if (!path) continue;
    frontPaths.add(path);
    const key = `${m[1].toUpperCase().padEnd(6)} ${path}`;
    if (!byKey.has(key)) byKey.set(key, new Set());
    byKey.get(key).add(file.replace(/\\/g, '/'));
  }
}

const rows = [...byKey.keys()].sort();
console.log(`\nSuperficie de API del front — ${rows.length} llamadas (${SCAN_DIRS.join(' + ')}):\n`);
for (const key of rows) console.log(`  ${key}`);

// --- 2) Diff contra el contrato del backend ---
const ci = process.argv.indexOf('--contract');
const contractPath = ci !== -1 ? process.argv[ci + 1] : null;
if (!contractPath) {
  console.log('\n(pasá --contract <ruta a api-contract.md> para diffear contra el backend)\n');
  process.exit(0);
}
if (!existsSync(contractPath)) {
  console.error(`\n✖ No se encontró el contrato en: ${contractPath}\n`);
  process.exit(2);
}
const contract = readFileSync(contractPath, 'utf8');

// Regex que matchea un endpoint del front dentro del texto del contrato
// (`:id` → cualquier segmento; acepta estilo `{id}`; con o sin barra inicial).
const inContract = (path) => {
  const pattern = path
    .split('/')
    .map((seg) => (seg === ':id' ? '(?::id|\\{[^}]+\\})' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp('/?' + pattern + '(?![\\w/])').test(contract);
};

// Endpoints del contrato: tokens entre backticks dentro de filas de tabla (`| ... |`).
// Exigimos que sean multi-segmento (con `/`): descarta nombres de campo/enum en backticks
// (`status`, `publisher_id`, `price_history`, …) que no son rutas. Los recursos de un solo
// segmento (plans/zones/agencies) el front ya los consume, así que no aparecen en la inversa.
const contractPaths = new Set();
for (const line of contract.split('\n')) {
  if (!line.startsWith('|')) continue;
  for (const [, tok] of line.matchAll(/`([^`]+)`/g)) {
    if (!/^\/?[a-z][a-z0-9/:{}.-]*\/[a-z0-9:{}.-]+$/i.test(tok)) continue;
    const n = normalize(tok);
    if (n) contractPaths.add(n);
  }
}

const frontNotInContract = [...frontPaths].filter((p) => !inContract(p)).sort();
const contractNotInFront = [...contractPaths].filter((p) => !frontPaths.has(p)).sort();

console.log(`\n— Diff contra ${contractPath} —`);
console.log(`\n  ▸ FRONT llama pero el contrato NO documenta (${frontNotInContract.length})  → posible drift del contrato:`);
frontNotInContract.forEach((p) => console.log(`      ${p}`));
console.log(`\n  ▸ CONTRATO ofrece pero el front NO consume (${contractNotInFront.length})  → feature pendiente o backend-only:`);
contractNotInFront.forEach((p) => console.log(`      ${p}`));
console.log('\n  (Matching por endpoint, no por query params. Revisá a mano antes de actuar.)\n');

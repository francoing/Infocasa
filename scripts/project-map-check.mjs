#!/usr/bin/env node
/**
 * Gate de EXACTITUD del PROJECT-MAP (dientes reales, no "¿lo tocaste?").
 *
 * Deriva del CÓDIGO los hechos volátiles que el mapa suele driftar —rutas,
 * hooks, stores y componentes comunes— y verifica que cada uno esté NOMBRADO
 * en PROJECT-MAP.md. Si agregás algo y no lo documentás, el gate corta (exit 1).
 * No se puede gamear bumpeando la fecha: chequea presencia real, no un touch.
 *
 * NO valida que la descripción sea correcta (eso sigue siendo criterio humano):
 * garantiza que nada estructural quede *ausente* del mapa. Ese fue el drift real
 * (p. ej. `BackButton` no figuraba tras crearse).
 *
 * Uso: node scripts/project-map-check.mjs   (o `npm run map:check`)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MAP = 'PROJECT-MAP.md';

/** Lista archivos de un dir que matchean `re`, devuelve el basename sin extensión. */
function baseNames(dir, re) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && re.test(e.name))
    .map((e) => e.name.replace(/\.(jsx?|mjs)$/, ''));
}

/** Rutas declaradas en el router (path="..."), sin las triviales `/` y `*`. */
function routePaths() {
  const src = readFileSync('src/router/AppRouter.jsx', 'utf8');
  const paths = [...src.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
  return [...new Set(paths)].filter((p) => p !== '/' && p !== '*');
}

// Hooks reales (use*.js), excluyendo helpers/mappers/queries/tests puros.
const hooks = baseNames('src/hooks', /^use[A-Z].*\.js$/).filter((n) => !/\.(helpers|mappers|query|test)$/.test(n));
const stores = baseNames('src/store', /^use[A-Z].*Store\.js$/);
const components = baseNames('src/common/components', /\.jsx$/);
const routes = routePaths();

const map = readFileSync(MAP, 'utf8');

const groups = [
  ['ruta', routes],
  ['hook', hooks],
  ['store', stores],
  ['componente común', components],
];

const missing = [];
for (const [kind, items] of groups) {
  for (const item of items) {
    if (!map.includes(item)) missing.push(`${kind}: ${item}`);
  }
}

if (missing.length > 0) {
  console.error(`\n✖ PROJECT-MAP desactualizado: ${missing.length} elemento(s) del código no figuran en ${MAP}:\n`);
  for (const m of missing) console.error(`   • ${m}`);
  console.error(`\n  Agregalos a ${MAP} (Regla de oro #5). El gate chequea presencia por nombre, no la descripción.\n`);
  process.exit(1);
}

console.log(`✔ PROJECT-MAP al día: ${routes.length} rutas, ${hooks.length} hooks, ${stores.length} stores, ${components.length} componentes comunes verificados.`);

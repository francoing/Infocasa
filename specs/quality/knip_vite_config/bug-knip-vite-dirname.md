# Bug-card: knip falla en CI porque no puede cargar `vite.config.js`

**Área:** `quality` (CI / tooling)
**Tier:** 2 · Bugfix / Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
El job `quality-gate` de GitHub Actions corta en el paso "Dead code (knip)" (`Process completed with exit code 2`).
Corriendo `npx knip` local se ve `ERROR: Error loading vite.config.js (__dirname is not defined)` y una lista de ~28
archivos "sin usar" (hooks, `src/api/*`, modales de infomonedas, etc.) que en realidad sí se usan.

## 2. Causa raíz
`vite.config.js` armaba el alias `@` con `path.resolve(__dirname, './src')`. El `package.json` tiene `"type": "module"`,
así que el config es ESM y `__dirname` no existe. Vite lo tolera (bundlea el config e inyecta `__dirname`), pero knip lo
carga como ESM puro y falla. Sin el plugin de Vite, knip pierde el entry `index.html → src/main.jsx`: solo ve los tests
como entry y marca como muerto todo lo que la app usa pero ningún test importa.

## 3. Fix
- `vite.config.js`: el alias pasa a `fileURLToPath(new URL('./src', import.meta.url))` (sin `__dirname` ni `path`).

## 4. Capa afectada
- [ ] Hook (`src/hooks/`)
- [ ] Store (`src/store/`)
- [ ] Componente / Página (`src/features/` o `src/common/`)
- [ ] Router (`src/router/`)
- [x] Tooling / config (`vite.config.js`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] `npm run knip` verde (exit 0)
- [x] `npm run map:check` verde
- [x] `npm run test` verde (24 archivos, 185 tests)
- [x] `vite build` OK
- [x] `PROJECT-MAP.md` actualizado

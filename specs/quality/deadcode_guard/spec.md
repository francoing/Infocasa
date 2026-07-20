# Spec: Guardia de código muerto (knip en CI)

**Área:** `quality` (gobernanza)
**Estado:** ✅ implementada
**Fuentes:** roadmap de gobernanza 2026-07-20 (paso #1) · auditoría de sanidad

## 1. Problema
La gobernanza no tenía guardia automática contra **código muerto/huérfano**. Se colaron 2 componentes muertos completos (`AdminPage` con una feature nunca accesible; `ProfilePage` duplicado) sin que nada fallara. Necesitamos un gate que detecte archivos/exports/dependencias sin uso.

## 2. Cambios
- **`knip`** agregado como devDependency + **`knip.json`** (entry = tests; project = `src/**/*.{js,jsx}`; entradas de app/tests las detectan los plugins de Vite/Vitest).
- **Script** `npm run knip` y **paso en CI** (`.github/workflows/ci.yml`) como **gate duro** tras el lint.
- **Limpieza que exigió la primera corrida (para dejar knip verde):**
  - Archivos huérfanos borrados: `common/components/PlanBadge.jsx`, `hooks/index.js` (barrel sin uso), `hooks/useLeads.js`, `mock/data/cities.js`, `theme/aceTheme.js` (+ dir `theme/` vacío).
  - Exports muertos eliminados: `getPublisherById`, `deleteProperty` (en `useProperties.js`; el dashboard usa la mutación de `useDashboardMutations`).
  - Exports innecesarios de-exportados (uso solo interno): `mapImageUrl`, `mapLocationStr` (`property.mappers.js`), `DEFAULT_FILTERS` (`search.helpers.js`).
  - **Dependencia sin declarar**: `js-yaml` (lo usa `.eslintrc.cjs`) agregada a `devDependencies`.

## 3. Invariantes (sin regresión)
- Todo lo borrado estaba **verificado como huérfano** (sin imports; `PlanBadge` lo usaba solo el `AdminPage` ya eliminado; `useLeads` sin consumidores; `cities`/`aceTheme` sin referencias en mock/config).
- `npm run lint` sigue verde (la de-exportación no rompe usos internos); `vite build` compila.

## 4. Criterios de aceptación
1. `npm run knip` termina **limpio** (exit 0, sin unused files/exports/deps).
2. CI corre `knip` como gate duro (falla si aparece código muerto nuevo).
3. `npm ci` reproducible (lock con `knip` + `js-yaml` reales).

## 5. Fuera de alcance / siguientes pasos
- Coherencia contrato↔front (checklist/script).
- Gate de tests real (jsdom en CI + cobertura).
- `knip` en pre-commit local: por ahora solo en CI (para no ralentizar cada commit); evaluable más adelante.

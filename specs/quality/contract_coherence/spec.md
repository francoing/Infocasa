# Spec: Coherencia contrato↔front (superficie de API + checklist)

**Área:** `quality` (gobernanza)
**Estado:** ✅ implementada
**Fuentes:** roadmap de gobernanza 2026-07-20 (paso #1 final) · `api-contract.md` (backend)

## 1. Problema
No existía ritual que verificara que el front consume lo que el contrato del backend ofrece. Fue la **causa raíz** de que faltaran ~12 filtros de búsqueda: el contrato los documentaba y nadie notó que el front los ignoraba. Un gate automático es inviable en el CI del front (el contrato vive en el repo del backend, cross-repo).

## 2. Solución
Herramienta + checklist (no gate de CI, por el cross-repo):
- **`scripts/api-surface.mjs`** (sin dependencias): extrae los endpoints que consumen las capas autorizadas a tocar la red (`src/hooks/**` + `src/store/**`, normalizando `${id}`→`:id` y descartando query strings) y, con `--contract <path>`, los diffea contra el `api-contract.md` del backend en ambas direcciones:
  - **FRONT→contrato** (confiable, por regex-search): endpoints que el front llama y el contrato no documenta → debe ser **0** (si no, drift del contrato).
  - **CONTRATO→front** (best-effort, tokens multi-segmento de las tablas): endpoints que el backend ofrece y el front no consume → feature pendiente o backend-only.
- **`npm run api:surface`** (y `-- --contract <path>` para el diff).
- **STEP 3.5 del workflow** (`create-feature.workflow.md`): correr el diff al consumir/cambiar una ruta; dejar FRONT→contrato en 0; revisar el reverso; y comprobar **query params a mano** (el script matchea por endpoint, no por params).

## 3. Estado actual (corrida de referencia)
- FRONT→contrato: **0** (el front no driftea; todo endpoint que llama está documentado).
- CONTRATO→front: **2**, ambos legítimamente backend-only (`auth/verify-email/{id}/{hash}`, `mercadopago/webhook`).

## 4. Criterios de aceptación
1. `node scripts/api-surface.mjs` lista la superficie del front sin artefactos (`${queryString}` no genera falsos `:id`).
2. Con `--contract`, FRONT→contrato = 0 en el estado actual; el reverso solo muestra backend-only.
3. Documentado en el workflow (STEP 3.5) y en PROJECT-MAP (sección Contrato + comandos).

## 5. Limitaciones (explícitas)
- Matching por **endpoint**, no por **query params**: la coherencia de filtros sigue siendo un chequeo manual del checklist.
- No es gate de CI (cross-repo). Es un ritual del workflow; su valor depende de correrlo al tocar rutas.

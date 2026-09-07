# CODING CONVENTIONS — REACT / VITE

## Naming

### 1. Componentes
- **Archivo y componente:** PascalCase `.jsx` (ej. `PropertyCard.jsx`, `CheckoutModal.jsx`).
- **Un componente por archivo.** Export **default** para pages/components.

### 2. Hooks
- **Archivo:** `useX.js` camelCase (ej. `useProperties.js`, `usePropertyDetail.js`).
- Export **named** (`export function useProperties()`), re-exportados desde `hooks/index.js` cuando aplique.
- Un hook por área de datos; define sus **query keys** de forma estable.

### 3. Stores (Zustand)
- **Archivo:** `useXStore.js` (ej. `useAuthStore.js`, `useFilterStore.js`). Export named `useXStore`.

### 4. Pages
- Viven en `features/{area}/pages/`, sufijo `Page` (ej. `SearchPage.jsx`).

### 5. Tests
- `src/test/**`, sufijo `.test.js(x)` (ej. `usePlans.test.js`, `CheckoutModal.test.jsx`). **Vitest + Testing Library sobre `happy-dom`** (entorno en `vite.config.js`; no usar `jsdom` — daba EPERM intermitente en Windows).
- **`npm run test` es gate duro** (corre en CI). Una feature/fix con lógica nueva **suma o ajusta al menos un test**; no se baja ni se saca el gate para "pasar" (si algo es flaky, se arregla la causa). Ver `.ai/policies/architecture-policies.yaml` → `testing`.

---

## Estilo

- **JS moderno (ESM):** `type: module`. Imports relativos dentro de `src/`.
- **Estilos:** **Tailwind** utility-first. Componer clases condicionales con `clsx` + `tailwind-merge` (`lib/utils.js`), no strings ad-hoc gigantes.
- **Estado de servidor:** siempre `useQuery`/`useMutation` (TanStack Query) desde un hook. Nunca `fetch` en el componente.
- **Estado de cliente:** Zustand, mínimo indispensable.
- **Textos de UI:** en español (coincide con los mensajes del backend).
- **Formato/lint:** correr `npm run lint` (`--max-warnings 0`) antes de commit. La config (`.eslintrc.cjs`) aplica los límites de `.ai/policies/architecture-policies.yaml` — no bajar reglas a `warn` para "pasar".

---

## Dependencias

- No agregar dependencias sin necesidad clara. El stack base (React Router, TanStack Query, Zustand, Tailwind, Leaflet) cubre la mayoría de los casos.
- No migrar a TypeScript ni cambiar el bundler sin aprobación.

---

## Criterio para armar PR (REGLA FUNCIONAL)

Objetivo: menos fricción. No todo cambio necesita PR; los triviales van directo.

**Directo a `QA`** (commit + push, sin PR ni rama) cuando el cambio cumple **las dos**:
- toca **≤ 3 archivos**, y
- queda dentro de **un solo módulo** (`src/features/{X}`, o una sola capa transversal: `hooks/`, `store/`, `api/`, `common/`, `lib/`).

**PR obligatorio** (rama `feat|fix|chore/*` → `QA`) cuando el cambio:
- toca **más de 3 archivos**, **o**
- cruza **más de un módulo**.

**Siempre PR** (aunque sea 1 archivo), si toca cualquiera de estos:
- **Contrato de API** (endpoints/params/shapes que se consumen — ver `api-contract.md`).
- **Seguridad / auth** (`useAuthStore`, token, `ProtectedRoute`, roles, visibilidad de datos privados).
- **Deploy / infra** (`vite.config`, CI, hooks, `.env*`, config de Vercel).
- *(Las migraciones de BD viven en el backend; acá no aplican.)*

Reglas duras:
- La rama **`production` NUNCA** recibe commit directo: solo avanza por **promoción** vía PR (`QA` → `production`).
- Un commit directo **igual pasa los gates locales** antes de pushear (`npm run lint` + `npm run knip` + `npm run build`). El umbral baja la ceremonia del PR, no la calidad.
- Contar = archivos de código/config tocados. **Ante la duda, PR.**

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
- `src/test/**`, sufijo `.test.js(x)` (ej. `usePlans.test.js`, `CheckoutModal.test.jsx`). Vitest + Testing Library.

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

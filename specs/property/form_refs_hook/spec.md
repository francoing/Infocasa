# Spec: Extraer los datos de referencia de PropertyForm a usePropertyFormRefs

**Área:** `property`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (boundary UI→api; server state en react-query) · auditoría de sanidad 2026-07-15 (paydown #2 del ratchet)

## 1. Objetivo
`PropertyForm.jsx` (1096 líneas, el peor god-component) hace **4 `api.get` directas** (`/locations`, `/property-types`, `/zones`, `/property-features`) con `useState` + `useEffect` propios, violando dos reglas: el boundary UI→api y "server state solo en react-query, no duplicado en useState". Mover esa carga a un hook de datos → el form adelgaza, respeta el contrato, y sale la entrada de `no-restricted-imports` de su LEGACY.

> Alcance acotado: **solo** la carga de refs. El resto del peso del form (estado del formulario, validación, secciones de JSX) sigue en el ratchet (`complexity`, `max-lines`, `max-lines-per-function`) y se salda en la spec de split.

## 2. Contrato (backend, ya existente)
- `GET /locations`, `/property-types`, `/zones` → `res.data` (arrays). `GET /property-features` → `res.data.data` (paginado). Datos de referencia, casi estáticos → cachear.

## 3. Implementación (front-only)
- **`hooks/usePropertyFormRefs.js`** (nuevo): un `useQuery` (`["propertyFormRefs"]`) que trae los 4 en `Promise.all` y devuelve `{ locations, propertyTypes, zones, availableFeatures, loadingRefs }`. `staleTime` alto (datos estáticos). Hook real (llama `useQuery` en el top level → sin `rules-of-hooks`). Es la capa de datos → único lugar que toca `api/api.js`.
- **`features/property/components/PropertyForm.jsx`**:
  - Quitar los 4 `useState` (locations/propertyTypes/zones/availableFeatures), el de `loadingRefs`, y el `useEffect` de `fetchRefData` (los setters no se usan en ningún otro lado).
  - Quitar `import { api }`; agregar `usePropertyFormRefs`.
  - `const { locations, propertyTypes, zones, availableFeatures, loadingRefs } = usePropertyFormRefs();`
  - Se elimina el `console.log("🏙️ …")` de debug.
- **`.eslintrc.cjs`**: la entrada de `PropertyForm.jsx` en `LEGACY` pierde `no-restricted-imports` (queda `['complexity','max-lines','max-lines-per-function']`) → boundary **enforced** sobre el form.

## 4. Casos borde
- Error de red → react-query deja `data` undefined; el hook devuelve arrays vacíos y `loadingRefs=false`; el form renderiza igual que hoy (sin refs, selects vacíos).
- Varias instancias del form (crear/editar) comparten cache por la queryKey → menos requests que antes.

## 5. Criterios de aceptación
1. `PropertyForm.jsx` no importa `api/api.js` (grep vacío).
2. `no-restricted-imports` removido del LEGACY de `PropertyForm`; `npm run lint` verde.
3. Crear/editar propiedad sigue mostrando ubicaciones, tipos, zonas y features.

## 6. Fuera de alcance
- Split del resto de `PropertyForm` (validación, secciones) → spec aparte.

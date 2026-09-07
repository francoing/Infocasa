# Spec: Cerrar puntos ciegos del enforcement + limpiar drift

**Área:** `quality` (gobernanza)
**Estado:** 🚧 en implementación
**Fuentes:** auditoría de gobernanza 2026-07-17/20 · `.ai/context/architecture.md`

## 1. Problema
La fitness function vigila el *cómo* (tamaño/capas) pero tenía agujeros por donde se coló deuda sin detección:
1. El boundary de red solo prohibía **importar `api/api.js`**, no `fetch(` crudo → se coló un `fetch` a Nominatim en `MapLocationSelector` (componente de UI), violando `architecture.md` ("ni fetch directo").
2. Código muerto sin guardia: `ProfilePage` duplicado en `features/auth/pages/` (el router usa `profile/`).

## 2. Cambios
- **`src/hooks/useGeocodeSearch.js`** (nuevo): encapsula la geocodificación Nominatim (texto → `{latitude, longitude}`) con su estado `searching`/`error`. Capa de datos.
- **`src/features/property/components/MapLocationSelector.jsx`**: usa `useGeocodeSearch`; se elimina el `fetch` directo y los `useState` de carga/error locales.
- **`.eslintrc.cjs`** (`apiBoundary`): suma `no-restricted-syntax` que prohíbe `fetch(...)` y `new XMLHttpRequest()` en `features/**` + `common/**`. Queda como error (gate).
- **`.ai/context/architecture.md`**: la prohibición #1 documenta el nuevo enforcement.
- **Eliminado (código muerto):** `src/features/auth/pages/ProfilePage.jsx` (sin referencias).

## 3. Invariantes (sin regresión)
- `MapLocationSelector` se comporta igual: buscar dirección → centra el mapa y setea coords; mismos mensajes de error; mismo spinner.
- El boundary sigue permitiendo `fetch` en `src/hooks/**` (Geoapify, Nominatim, reverse-geo) y en `src/api/api.js`.

## 4. Criterios de aceptación
1. `npm run lint` (eslint) verde con la nueva regla activa.
2. Un `fetch(...)` en cualquier archivo de `features/**`/`common/**` **falla** el lint con mensaje claro (verificado con probe).
3. `vite build` compila.
4. Sin referencias colgadas al `ProfilePage` borrado.

## 5. Fuera de alcance (siguientes pasos del roadmap de gobernanza)
- **Detección de código muerto automatizada** (`knip`/`no-unused-modules`) en CI.
- **Coherencia contrato↔front** (checklist/script que verifique que el front consume lo que `api-contract.md` ofrece).
- **Cerrar el ratchet a 0** (`PropertyCard` complexity, `HomePage` tamaño).
- **Gate de tests real** (arreglar jsdom en CI, quitar `continue-on-error`, subir cobertura).

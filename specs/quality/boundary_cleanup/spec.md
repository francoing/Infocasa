# Spec: Cerrar el boundary UI→api en los archivos chicos restantes

**Área:** `quality` (transversal)
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (la UI no importa `api/api.js`) · auditoría de sanidad 2026-07-15 (paydown #6)

## 1. Objetivo
Quedan 3 archivos de UI que importan el cliente HTTP directo (`no-restricted-imports` en el ratchet): `PropertyCard`, `ExplorePage`, `CreatePropertyPage`. Mover cada llamada a la capa de datos (`hooks/`) → **cierra la categoría boundary por completo**. Extracciones chicas, mismo patrón que `profile/agency_hook` y `property/form_refs_hook`.

## 2. Cambios (front-only)
- **`hooks/useFavorites.js`** (nuevo): `setPropertyFavorite(propertyId, favorited)` → `POST`/`DELETE /properties/{id}/favorite` + invalida `["me_favorites"]`. **`PropertyCard`** deja de importar `api`; el handler llama al hook y mantiene su estado local optimista.
- **`hooks/useExploreProperties.js`** (nuevo): `useExploreProperties(operationApi)` = `useQuery(["explore", op])` que trae `/properties/search?operation=X&per_page=50` y mapea con `mapProperty`. **`ExplorePage`** reemplaza su `useState`/`useEffect`/`api` por el hook (react-query aporta loading/error/cancelación). Se va también el flag `cancelled` manual.
- **`hooks/usePublications.js`** (nuevo): `createPublication({ property_id, type })` → `POST /publications`. **`CreatePropertyPage`** deja de importar `api`; usa el hook (mantiene el manejo del 403 sin suscripción).
- **`.eslintrc.cjs`**: `ExplorePage` y `CreatePropertyPage` salen **enteros** del LEGACY; `PropertyCard` pierde `no-restricted-imports` (queda `complexity`).

## 3. Por qué archivos nuevos (y no meter en useProperties)
`useProperties.js` está en 246 líneas (techo `hook` = 250, **enforced** — no está en LEGACY por tamaño). Agregarle hooks lo pasaría del límite. Cada hook nuevo es de responsabilidad única y chico.

## 4. Invariantes
- Mismo comportamiento visible. `PropertyCard` sigue con su toggle optimista + toasts; `ExplorePage` mismo mapa/estados; `CreatePropertyPage` mismo flujo (crear → imágenes → publicación, con el 403 → dashboard).
- `useExploreProperties` no fetchea si `operationApi` es falsy (`enabled`), replicando el guard de operación inválida.

## 5. Criterios de aceptación
1. Ninguno de los 3 importa `api/api.js` (grep vacío).
2. `ExplorePage` y `CreatePropertyPage` fuera del LEGACY; `PropertyCard` sin `no-restricted-imports`. **Categoría boundary saldada.**
3. `npm run lint` verde. Favoritos desde la card, mapa de explore y publicar propiedad funcionan igual.

## 6. Fuera de alcance
- `complexity` de `PropertyCard` (deuda de tamaño aparte).
- Unificar la lógica de favoritos dispersa (`usePropertyDetail`, `useDashboardData`) con `useFavorites` → mejora futura.
